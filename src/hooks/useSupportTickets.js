import { useCallback, useEffect, useState } from 'react';
import {
  appendSupportResponse,
  collectStoredTickets,
  summarizeSupportMetrics,
  updateStoredTicket,
} from '../services/ticketBoardService';

export function useSupportTickets() {
  const [tickets, setTickets] = useState(() => collectStoredTickets());

  const reload = useCallback(() => {
    setTickets(collectStoredTickets());
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      reload();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [reload]);

  const setTicketStatus = useCallback((storageKey, ticketId, status) => {
    updateStoredTicket(storageKey, ticketId, { status });
    reload();
  }, [reload]);

  const registerSupportResponse = useCallback((storageKey, ticketId, response) => {
    appendSupportResponse(storageKey, ticketId, response);
    reload();
  }, [reload]);

  return {
    tickets,
    metrics: summarizeSupportMetrics(tickets),
    reload,
    setTicketStatus,
    registerSupportResponse,
  };
}
