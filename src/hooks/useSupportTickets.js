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

  const fetchTickets = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
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

  const registerSupportResponse = useCallback(async (storageKey, ticketId, response) => {
    setTickets((prevTickets) => {
      const localTicket = prevTickets.find((t) => t.id === ticketId);
      if (!localTicket) return prevTickets;

      const nextStatus = response.nextStatus || 'IN_PROGRESS';
      const updatedTicket = {
        ...localTicket,
        status: nextStatus,
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
    registerSupportResponse,
  };
}
