import { useState, useCallback, useEffect } from 'react';
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

function loadTickets(userId) {
  const key = getStorageKey(userId);
  return readLocalJson(key, []);
}

export function useChatHistory(userId) {
  const [tickets, setTickets] = useState(() => loadTickets(userId));

  useEffect(() => {
    setTickets(loadTickets(userId));
  }, [userId]);

  const saveTicket = useCallback((messages, rating = null, feedback = '', extraData = {}) => {
    const lastConfidence = [...messages]
      .reverse()
      .find((message) => message.role === 'assistant' && message.confidence)?.confidence || null;

    const newTicket = {
      id: Date.now(),
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

    setTickets((previousTickets) => {
      const updatedTickets = [newTicket, ...previousTickets];
      const key = getStorageKey(userId);
      writeLocalJson(key, updatedTickets);
      return updatedTickets;
    });

    return newTicket.id;
  }, [userId]);

  const updateTickets = useCallback((updatedTickets) => {
    setTickets(updatedTickets);
    const key = getStorageKey(userId);
    writeLocalJson(key, updatedTickets);
  }, [userId]);

  const clearTickets = useCallback(() => {
    const key = getStorageKey(userId);
    removeLocalItem(key);
    setTickets([]);
  }, [userId]);

  return { tickets, saveTicket, updateTickets, clearTickets };
}
