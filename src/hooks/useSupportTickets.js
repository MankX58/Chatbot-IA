import { useCallback, useEffect, useState } from 'react';
import { buildApiUrl } from '../../config/runtimeConfig';
import {
  deriveTicketPriority,
  isUnresolvedTicket,
  summarizeSupportMetrics,
} from '../services/ticketBoardService';

export function useSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await fetch(buildApiUrl('/api/tickets'));
      if (!response.ok) {
        throw new Error('No se pudieron obtener los tickets');
      }
      const data = await response.json();
      const enrichedTickets = data.map((ticket) => ({
        ...ticket,
        storageKey: ticket.storageKey || `chat_tickets_${ticket.ownerId}`,
        priority: deriveTicketPriority(ticket),
        unresolved: isUnresolvedTicket(ticket),
        supportResponses: ticket.supportResponses || [],
      }));
      setTickets(enrichedTickets);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets(false);

    const interval = setInterval(() => {
      fetchTickets(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const setTicketStatus = useCallback(async (storageKey, ticketId, status) => {
    setTickets((prevTickets) => {
      const localTicket = prevTickets.find((t) => t.id === ticketId);
      if (!localTicket) return prevTickets;

      const updatedTicket = {
        ...localTicket,
        status,
      };

      fetch(buildApiUrl('/api/tickets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTicket),
      })
        .then(() => fetchTickets())
        .catch((err) => console.error('Error al actualizar estado de ticket:', err));

      return prevTickets.map((t) => (t.id === ticketId ? updatedTicket : t));
    });
  }, [fetchTickets]);

  const setTicketPriority = useCallback(async (storageKey, ticketId, priority) => {
    setTickets((prevTickets) => {
      const localTicket = prevTickets.find((t) => t.id === ticketId);
      if (!localTicket) return prevTickets;

      const updatedTicket = {
        ...localTicket,
        priority,
      };

      fetch(buildApiUrl('/api/tickets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTicket),
      })
        .then(() => fetchTickets())
        .catch((err) => console.error('Error al actualizar prioridad de ticket:', err));

      return prevTickets.map((t) => (t.id === ticketId ? updatedTicket : t));
    });
  }, [fetchTickets]);

  const registerSupportResponse = useCallback(async (storageKey, ticketId, response) => {
    setTickets((prevTickets) => {
      const localTicket = prevTickets.find((t) => t.id === ticketId);
      if (!localTicket) return prevTickets;

      const nextStatus = response.nextStatus || 'IN_PROGRESS';
      const updatedTicket = {
        ...localTicket,
        status: nextStatus,
        messages: [
          ...(localTicket.messages || []),
          {
            role: 'assistant',
            content: response.body,
            timestamp: response.createdAt,
            agentName: response.agentName,
          },
        ],
        supportResponses: [...(localTicket.supportResponses || []), response],
      };

      fetch(buildApiUrl('/api/tickets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTicket),
      })
        .then(() => fetchTickets())
        .catch((err) => console.error('Error al registrar respuesta de soporte:', err));

      return prevTickets.map((t) => (t.id === ticketId ? updatedTicket : t));
    });
  }, [fetchTickets]);

  return {
    tickets,
    metrics: summarizeSupportMetrics(tickets),
    loading,
    error,
    reload: fetchTickets,
    setTicketStatus,
    setTicketPriority,
    registerSupportResponse,
  };
}
