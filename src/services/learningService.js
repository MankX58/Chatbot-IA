import { collectStoredTickets } from './ticketBoardService';
import {
  STORAGE_KEYS,
  readLocalJson,
  writeLocalJson,
} from '../utils/browserStorage';

const MAX_LEARNED_ENTRIES = 20;

/**
 * Extrae conocimiento de tickets resueltos por agentes de soporte.
 * Un ticket aporta conocimiento si tiene al menos una supportResponse.
 */
function extractFromAgentResponses(tickets) {
  return tickets
    .filter(
      (ticket) =>
        Array.isArray(ticket.supportResponses) &&
        ticket.supportResponses.length > 0
    )
    .map((ticket) => {
      const firstUserMessage =
        ticket.messages?.find((m) => m.role === 'user')?.content || ticket.preview || '';
      const agentSolution = ticket.supportResponses
        .map((r) => r.body)
        .join('\n');

      return {
        tema: ticket.breadcrumb || 'CONSULTA GENERAL',
        problema: firstUserMessage.slice(0, 200),
        solucion: agentSolution.slice(0, 600),
        source: 'agent',
        ticketId: ticket.id,
      };
    });
}

/**
 * Extrae conocimiento de chats calificados positivamente (rating >= 4).
 * Solo toma el par pregunta-respuesta más relevante.
 */
function extractFromPositiveRatings(tickets) {
  return tickets
    .filter(
      (ticket) =>
        ticket.rating >= 4 &&
        Array.isArray(ticket.messages) &&
        ticket.messages.length >= 2 &&
        (!ticket.supportResponses || ticket.supportResponses.length === 0)
    )
    .map((ticket) => {
      const userMsg = ticket.messages.find((m) => m.role === 'user');
      const assistantMsg = ticket.messages.find((m) => m.role === 'assistant');

      if (!userMsg || !assistantMsg) return null;

      return {
        tema: ticket.breadcrumb || 'CONSULTA GENERAL',
        problema: userMsg.content.slice(0, 200),
        solucion: assistantMsg.content.slice(0, 600),
        source: 'rating',
        ticketId: ticket.id,
      };
    })
    .filter(Boolean);
}

/**
 * Reconstruye la base de conocimiento aprendido escaneando todos los tickets
 * almacenados en localStorage y guardando el resultado en learned_kb.
 */
export function rebuildLearnedKnowledge() {
  const tickets = collectStoredTickets();

  const fromAgents = extractFromAgentResponses(tickets);
  const fromRatings = extractFromPositiveRatings(tickets);

  const combined = [...fromAgents, ...fromRatings];

  const uniqueMap = new Map();
  for (const entry of combined) {
    const key = `${entry.tema}::${entry.problema.slice(0, 60)}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, entry);
    }
  }

  const learned = Array.from(uniqueMap.values()).slice(0, MAX_LEARNED_ENTRIES);

  writeLocalJson(STORAGE_KEYS.learnedKnowledge, learned);

  return learned;
}

/**
 * Agrega manualmente una entrada de conocimiento aprendido.
 * Se usa cuando el agente marca el checkbox "Agregar a base de conocimiento".
 */
export function addLearnedEntry(tema, problema, solucion) {
  const current = readLocalJson(STORAGE_KEYS.learnedKnowledge, []);

  const key = `${tema}::${problema.slice(0, 60)}`;
  const alreadyExists = current.some(
    (entry) => `${entry.tema}::${entry.problema.slice(0, 60)}` === key
  );

  if (alreadyExists) {
    return current;
  }

  const newEntry = {
    tema,
    problema: problema.slice(0, 200),
    solucion: solucion.slice(0, 600),
    source: 'agent',
    addedAt: new Date().toISOString(),
  };

  // Save to PostgreSQL DB via api endpoint
  fetch('/api/knowledge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newEntry),
  }).catch((err) => console.error('Error saving learned knowledge to DB:', err));

  const updated = [newEntry, ...current].slice(0, MAX_LEARNED_ENTRIES);
  writeLocalJson(STORAGE_KEYS.learnedKnowledge, updated);

  return updated;
}

/**
 * Devuelve las entradas de conocimiento aprendido listas para enviar al backend.
 * Solo devuelve { tema, problema, solucion } sin metadata interna.
 */
export function getLearnedKnowledge() {
  const entries = readLocalJson(STORAGE_KEYS.learnedKnowledge, []);

  return entries.map(({ tema, problema, solucion }) => ({
    tema,
    problema,
    solucion,
  }));
}
