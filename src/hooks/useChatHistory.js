// src/hooks/useChatHistory.js
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'chat_tickets';

function loadTickets() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

export function useChatHistory() {
    const [tickets, setTickets] = useState(loadTickets);

    const saveTicket = useCallback((messages, rating = null, feedback = '') => {
        const newTicket = {
            id: Date.now(),
            date: new Date().toISOString(),
            preview: messages.find(m => m.role === 'user')?.content?.slice(0, 80) || 'Sin mensaje',
            breadcrumb: '',
            messageCount: messages.length,
            messages: messages.map(({ role, content, timestamp }) => ({ role, content, timestamp })),
            rating,
            feedback,
        };

        setTickets(prev => {
            const updated = [newTicket, ...prev];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });

        return newTicket.id;
    }, []);

    const clearTickets = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setTickets([]);
    }, []);

    return { tickets, saveTicket, clearTickets };
}