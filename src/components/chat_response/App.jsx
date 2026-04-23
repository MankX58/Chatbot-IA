import { useState, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import ConfigPanel from './ConfigPanel';
import Footer from './Footer';
import { sendMessage } from '../../../services/deepseekService';
import { buildSystemPrompt } from '../../../config/systemPrompt';
import './App.css';

let messageId = 0;

function createMessage(role, content, extras = {}) {
  return {
    id: ++messageId,
    role,
    content,
    timestamp: new Date(),
    ...extras,
  };
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = 'chat_tickets';

function loadTickets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTicketToStorage(ticket) {
  const current = loadTickets();
  const updated = [ticket, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

// ─── TicketsPanel ─────────────────────────────────────────────────────────────
function TicketsPanel({ tickets, onClear }) {
  const [selected, setSelected] = useState(null);

  const formatDate = (iso) =>
    new Date(iso).toLocaleString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

  const stars = (n) =>
    n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '—';

  if (selected) {
    const ticket = tickets.find(t => t.id === selected);
    return (
      <main className="tickets">
        <div className="tickets__header">
          <button className="tickets__back-btn" onClick={() => setSelected(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>
          <div className="tickets__detail-meta">
            <span className="tickets__badge">{ticket.breadcrumb || 'CONSULTA GENERAL'}</span>
            <span className="tickets__date">{formatDate(ticket.date)}</span>
          </div>
        </div>

        <div className="tickets__messages">
          {ticket.messages.map((msg, i) => (
            <div key={i} className={`tickets__msg tickets__msg--${msg.role}`}>
              <span className="tickets__msg-role">
                {msg.role === 'user' ? 'Tú' : 'Asistente'}
              </span>
              <div className="tickets__msg-bubble">
                {msg.content.split('\n').map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {(ticket.rating || ticket.feedback) && (
          <div className="tickets__rating-summary">
            {ticket.rating && (
              <div className="tickets__stars-display">
                <span className="tickets__stars-value">{stars(ticket.rating)}</span>
                <span className="tickets__stars-label">Calificación: {ticket.rating}/5</span>
              </div>
            )}
            {ticket.feedback && (
              <p className="tickets__feedback-text">"{ticket.feedback}"</p>
            )}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="tickets">
      <div className="tickets__header">
        <h2 className="tickets__title">Mis Tickets</h2>
        {tickets.length > 0 && (
          <button className="tickets__clear-btn" onClick={onClear}>
            Limpiar historial
          </button>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="tickets-placeholder__content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 10h20" />
          </svg>
          <h3>Sin tickets aún</h3>
          <p>Los chats que marques como resueltos aparecerán aquí.</p>
        </div>
      ) : (
        <ul className="tickets__list">
          {tickets.map(ticket => (
            <li
              key={ticket.id}
              className="tickets__item"
              onClick={() => setSelected(ticket.id)}
            >
              <div className="tickets__item-top">
                <span className="tickets__badge">{ticket.breadcrumb || 'CONSULTA GENERAL'}</span>
                <span className="tickets__date">{formatDate(ticket.date)}</span>
              </div>
              <p className="tickets__preview">{ticket.preview}</p>
              <div className="tickets__item-bottom">
                <span className="tickets__count">{ticket.messageCount} mensajes</span>
                {ticket.rating && (
                  <span className="tickets__stars-small">{'★'.repeat(ticket.rating)}{'☆'.repeat(5 - ticket.rating)}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

// ─── ChatMain ─────────────────────────────────────────────────────────────────
export default function ChatMain() {
  const [activeSection, setActiveSection] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('deepseek_api_key') || '');
  const [breadcrumb, setBreadcrumb] = useState('');
  const [tickets, setTickets] = useState(loadTickets);
  const [chatLocked, setChatLocked] = useState(false); // ← subido desde ChatArea

  const handleApiKeyChange = useCallback((key) => {
    setApiKey(key);
    localStorage.setItem('deepseek_api_key', key);
  }, []);

  const handleSend = useCallback(
    async (text) => {
      if (!apiKey) {
        setActiveSection('config');
        return;
      }

      const userMsg = createMessage('user', text);
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      if (!breadcrumb) {
        const upper = text.toUpperCase();
        if (upper.includes('CANVAS') || upper.includes('LMS')) setBreadcrumb('ACCESO LMS');
        else if (upper.includes('CORREO') || upper.includes('EMAIL')) setBreadcrumb('CORREO INSTITUCIONAL');
        else if (upper.includes('WIFI') || upper.includes('INTERNET')) setBreadcrumb('INTERNET INSTITUCIONAL');
        else if (upper.includes('OFFICE') || upper.includes('365')) setBreadcrumb('SOFTWARE INSTITUCIONAL');
        else if (upper.includes('VPN')) setBreadcrumb('VPN Y ACCESO REMOTO');
        else setBreadcrumb('CONSULTA GENERAL');
      }

      try {
        const systemPrompt = buildSystemPrompt();
        const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
        const reply = await sendMessage(apiKey, history, systemPrompt);
        const botMsg = createMessage('assistant', reply, { showFeedback: true });
        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        const errorMsg = createMessage(
          'assistant',
          `⚠️ Error al conectar con DeepSeek: ${err.message}\n\nVerifica tu API key en la sección de Configuración.`,
          { showFeedback: false }
        );
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, messages, breadcrumb]
  );

  const handleFeedback = useCallback((msgId, isPositive) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, showFeedback: false, feedback: isPositive } : msg
      )
    );
  }, []);

  const handleChatResolved = useCallback(({ rating, feedback }) => {
    const ticket = {
      id: Date.now(),
      date: new Date().toISOString(),
      breadcrumb,
      preview: messages.find(m => m.role === 'user')?.content?.slice(0, 80) || 'Sin mensaje',
      messageCount: messages.length,
      messages: messages.map(({ role, content, timestamp }) => ({ role, content, timestamp })),
      rating: rating || null,
      feedback: feedback || '',
    };

    const updated = saveTicketToStorage(ticket);
    setTickets(updated);
    setChatLocked(true); // ← persiste aunque cambies de pestaña
  }, [messages, breadcrumb]);

  // "Iniciar nuevo chat" ya no recarga la página, solo resetea el estado
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setBreadcrumb('');
    setChatLocked(false);
  }, []);

  const handleClearTickets = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTickets([]);
  }, []);

  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
  }, []);

  return (
    <div className="app">
      <Header />
      <div className="app__body">
        <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        {activeSection === 'chat' && (
          <ChatArea
            messages={messages}
            onSend={handleSend}
            isLoading={isLoading}
            onFeedback={handleFeedback}
            onResolved={handleChatResolved}
            onNewChat={handleNewChat}
            chatLocked={chatLocked}
            breadcrumb={breadcrumb}
          />
        )}
        {activeSection === 'config' && (
          <ConfigPanel apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
        )}
        {activeSection === 'tickets' && (
          <TicketsPanel tickets={tickets} onClear={handleClearTickets} />
        )}
      </div>
      <Footer />
    </div>
  );
}
