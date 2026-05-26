import { TICKET_STATUS } from '../components/chat_response/chatUtils';
import {
  STORAGE_KEYS,
  listLocalKeys,
  readLocalJson,
  writeLocalJson,
} from '../utils/browserStorage';

function getTicketCollections() {
  const prefix = `${STORAGE_KEYS.chatTickets}_`;

  return listLocalKeys()
    .filter((key) => key === STORAGE_KEYS.chatTickets || key.startsWith(prefix))
    .map((storageKey) => ({
      storageKey,
      tickets: readLocalJson(storageKey, []),
    }));
}

function extractConfidenceScore(confidence) {
  if (!confidence) return 0;
  return typeof confidence === 'number' ? confidence : confidence.score ?? 0;
}

export function deriveTicketPriority(ticket) {
  let score = 0;

  if (ticket.status === TICKET_STATUS.ESCALATED) score += 2;
  if (ticket.status === TICKET_STATUS.IN_PROGRESS) score += 1;
  if (extractConfidenceScore(ticket.lastConfidence) < 0.45) score += 2;
  if (ticket.rating && ticket.rating <= 2) score += 1;
  if (ticket.messageCount >= 4) score += 1;
  if (ticket.breadcrumb === 'CORREO INSTITUCIONAL' || ticket.breadcrumb === 'ACCESO LMS') score += 1;

  if (score >= 4) return 'Alta';
  if (score >= 2) return 'Media';
  return 'Baja';
}

export function isUnresolvedTicket(ticket) {
  if (ticket.status === TICKET_STATUS.ESCALATED || ticket.status === TICKET_STATUS.IN_PROGRESS) {
    return true;
  }

  if (ticket.rating && ticket.rating <= 3) {
    return true;
  }

  return extractConfidenceScore(ticket.lastConfidence) < 0.45;
}

export function collectStoredTickets() {
  return getTicketCollections()
    .flatMap(({ storageKey, tickets }) => tickets.map((ticket) => ({
      ...ticket,
      storageKey,
      ownerId: ticket.ownerId || storageKey.replace(`${STORAGE_KEYS.chatTickets}_`, '') || 'anon',
      priority: deriveTicketPriority(ticket),
      unresolved: isUnresolvedTicket(ticket),
      supportResponses: ticket.supportResponses || [],
    })))
    .sort((left, right) => new Date(right.date) - new Date(left.date));
}

export function updateStoredTicket(storageKey, ticketId, updates) {
  const tickets = readLocalJson(storageKey, []);
  const updatedTickets = tickets.map((ticket) => (
    ticket.id === ticketId
      ? {
        ...ticket,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      : ticket
  ));

  writeLocalJson(storageKey, updatedTickets);
}

export function appendSupportResponse(storageKey, ticketId, response) {
  const tickets = readLocalJson(storageKey, []);
  const updatedTickets = tickets.map((ticket) => {
    if (ticket.id !== ticketId) {
      return ticket;
    }

    return {
      ...ticket,
      status: response.nextStatus || TICKET_STATUS.IN_PROGRESS,
      supportResponses: [...(ticket.supportResponses || []), response],
      updatedAt: new Date().toISOString(),
    };
  });

  writeLocalJson(storageKey, updatedTickets);
}

export function summarizeSupportMetrics(tickets) {
  const total = tickets.length;
  const escalated = tickets.filter((ticket) => ticket.status === TICKET_STATUS.ESCALATED).length;
  const inProgress = tickets.filter((ticket) => ticket.status === TICKET_STATUS.IN_PROGRESS).length;
  const resolved = tickets.filter((ticket) => ticket.status === TICKET_STATUS.RESOLVED).length;
  const unresolved = tickets.filter((ticket) => ticket.unresolved).length;
  const avgConfidence = tickets.length
    ? Math.round((tickets.reduce((sum, ticket) => sum + extractConfidenceScore(ticket.lastConfidence), 0) / tickets.length) * 100)
    : 0;

  const ratedTickets = tickets.filter((ticket) => ticket.rating);
  const avgRating = ratedTickets.length
    ? (ratedTickets.reduce((sum, ticket) => sum + ticket.rating, 0) / ratedTickets.length).toFixed(1)
    : '0.0';

  const byBreadcrumb = tickets.reduce((accumulator, ticket) => {
    const key = ticket.breadcrumb || 'CONSULTA GENERAL';
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const byPriority = tickets.reduce((accumulator, ticket) => {
    accumulator[ticket.priority] = (accumulator[ticket.priority] || 0) + 1;
    return accumulator;
  }, {});

  return {
    total,
    escalated,
    inProgress,
    resolved,
    unresolved,
    avgConfidence,
    avgRating,
    byBreadcrumb,
    byPriority,
  };
}
