// src/hooks/useChatHistory.js
import { useState, useCallback, useEffect } from 'react';

const BASE_STORAGE_KEY = 'chat_tickets';

// Crear clave de storage basada en el usuario
function getStorageKey(userId) {
  return userId ? `${BASE_STORAGE_KEY}_${userId}` : BASE_STORAGE_KEY;
}

function loadTickets(userId) {
  try {
    const key = getStorageKey(userId);
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

export function useChatHistory(userId) {
  const [tickets, setTickets] = useState(() => loadTickets(userId));

  // Recargar tickets cuando cambia el usuario
  useEffect(() => {
    setTickets(loadTickets(userId));
  }, [userId]);

  const saveTicket = useCallback((messages, rating = null, feedback = '', extraData = {}) => {
    const newTicket = {
      id: Date.now(),
      date: new Date().toISOString(),
      preview: messages.find(m => m.role === 'user')?.content?.slice(0, 80) || 'Sin mensaje',
      breadcrumb: extraData.breadcrumb || '',
      messageCount: messages.length,
      messages: messages.map(({ role, content, timestamp }) => ({ role, content, timestamp })),
      rating,
      feedback,
      status: extraData.status || 'closed',
      escalationContext: extraData.escalationContext || null,
      ...extraData,
    };

    setTickets(prev => {
      const updated = [newTicket, ...prev];
      const key = getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });

    return newTicket.id;
  }, [userId]);

  const updateTickets = useCallback((updatedTickets) => {
    setTickets(updatedTickets);
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(updatedTickets));
  }, [userId]);

  const clearTickets = useCallback(() => {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);
    setTickets([]);
  }, [userId]);

  return { tickets, saveTicket, updateTickets, clearTickets };
}