import { useState, useCallback, useEffect } from 'react';
import { buildApiUrl } from '../../config/runtimeConfig';
import {
  STORAGE_KEYS,
  readLocalJson,
  writeLocalJson,
  removeLocalItem,
} from '../utils/browserStorage';

const BASE_STORAGE_KEY = STORAGE_KEYS.chatTickets;

function getStorageKey(userId) {
  return userId ? `${BASE_STORAGE_KEY}_${userId}` : BASE_STORAGE_KEY;
}

export function useChatHistory(userId) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!userId) {
      const local = readLocalJson(BASE_STORAGE_KEY, []);
      setTickets(local);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(buildApiUrl(`/api/tickets?ownerId=${userId}`));
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        const local = readLocalJson(getStorageKey(userId), []);
        setTickets(local);
      }
    } catch (err) {
      console.error('Error fetching chat history from DB:', err);
      const local = readLocalJson(getStorageKey(userId), []);
      setTickets(local);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const saveTicket = useCallback(async (messages, rating = null, feedback = '', extraData = {}) => {
    const lastConfidence = [...messages]
      .reverse()
      .find((message) => message.role === 'assistant' && message.confidence)?.confidence || null;

    const newTicket = {
      id: String(Date.now()),
      ownerId: userId || 'anon',
      date: new Date().toISOString(),
      preview: messages.find((message) => message.role === 'user')?.content?.slice(0, 80) || 'Sin mensaje',
      breadcrumb: extraData.breadcrumb || '',
      messageCount: messages.length,
      messages: messages.map(({ role, content, timestamp, confidence }) => ({
        role,
        content,
        timestamp,
        confidence: confidence || null,
      })),
      rating,
      feedback,
      status: extraData.status || 'closed',
      escalationContext: extraData.escalationContext || null,
      lastConfidence,
      ...extraData,
    };

    // Save to PostgreSQL DB
    try {
      await fetch(buildApiUrl('/api/tickets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });
      fetchTickets();
    } catch (err) {
      console.error('Error saving ticket to DB:', err);
    }

    // Save fallback to LocalStorage
    const key = getStorageKey(userId);
    const local = readLocalJson(key, []);
    writeLocalJson(key, [newTicket, ...local]);

    return newTicket.id;
  }, [userId, fetchTickets]);

  const updateTickets = useCallback(async (updatedTickets) => {
    setTickets(updatedTickets);
    const key = getStorageKey(userId);
    writeLocalJson(key, updatedTickets);

    // Save all updated tickets to PostgreSQL DB
    try {
      await Promise.all(
        updatedTickets.map((ticket) =>
          fetch(buildApiUrl('/api/tickets'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...ticket,
              ownerId: userId || 'anon',
            }),
          })
        )
      );
      fetchTickets();
    } catch (err) {
      console.error('Error updating tickets in DB:', err);
    }
  }, [userId, fetchTickets]);

  const clearTickets = useCallback(() => {
    const key = getStorageKey(userId);
    removeLocalItem(key);
    setTickets([]);
  }, [userId]);

  return { tickets, loading, reload: fetchTickets, saveTicket, updateTickets, clearTickets };
}
