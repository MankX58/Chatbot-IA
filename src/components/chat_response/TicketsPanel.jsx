import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  formatConfidence,
  formatStars,
  formatStatus,
  formatTicketDate,
  getConfidenceTone,
  getStatusTone,
} from './chatUtils';

/* ─── Priority config ──────────────────────────────── */
const PRIORITY_STYLES = {
  Alta:  { badge: 'bg-red-100 text-red-700 border-red-300',       dot: 'bg-red-500'    },
  Media: { badge: 'bg-amber-100 text-amber-700 border-amber-300', dot: 'bg-amber-500'  },
  Baja:  { badge: 'bg-green-100 text-green-700 border-green-300', dot: 'bg-green-500'  },
};

const STATUS_STEPS = [
  { key: 'escalated',   label: 'Escalado'   },
  { key: 'in_progress', label: 'En gestión' },
  { key: 'resolved',    label: 'Resuelto'   },
];

/* ─── Sub-components ───────────────────────────────── */
function ConfidenceBadge({ confidence }) {
  if (!confidence) return null;

  const tone = getConfidenceTone(confidence);
  const classes = {
    high:   'border-green-200 bg-green-50 text-green-700',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    low:    'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${classes[tone]}`}>
      Confianza {formatConfidence(confidence)}
    </span>
  );
}

function StatusBadge({ status }) {
  const classes = {
    blue:    'bg-blue-50 text-blue-700 border-blue-200',
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    green:   'bg-green-50 text-green-700 border-green-200',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${classes[getStatusTone(status)]}`}>
      {formatStatus(status)}
    </span>
  );
}

function SupportStatusBar({ status }) {
  const activeIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, idx) => {
        const done    = idx <= activeIdx;
        const current = idx === activeIdx;
        return (
          <div key={step.key} className="flex flex-1 items-center gap-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all
                ${current
                  ? 'border-[#B71C1C] bg-[#B71C1C] text-white scale-110 shadow'
                  : done
                    ? 'border-[#B71C1C] bg-white'
                    : 'border-neutral-300 bg-white'}`}
              >
                {done && !current && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B71C1C" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {current && <span className="h-2 w-2 rounded-full bg-white" />}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${done ? 'text-[#B71C1C]' : 'text-neutral-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`mb-4 h-0.5 flex-1 transition-all ${idx < activeIdx ? 'bg-[#B71C1C]' : 'bg-neutral-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AgentAvatar({ name }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] text-[11px] font-bold text-white shadow-sm">
      {name ? name.charAt(0).toUpperCase() : 'A'}
    </div>
  );
}

/* ─── Main component ───────────────────────────────── */
export default function TicketsPanel({ tickets, onClear, onSendStudentMessage }) {
  const { user } = useAuth0();
  const [selected,    setSelected]    = useState(null);
  const [studentMsg,  setStudentMsg]  = useState('');
  const messagesEndRef                = useRef(null);

  const ticket = selected ? tickets.find((item) => item.id === selected) : null;

  useEffect(() => {
    if (selected) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selected, ticket?.messages]);

  /* ── Selected ticket detail ── */
  if (selected && ticket) {
    const handleSend = () => {
      if (!studentMsg.trim() || !onSendStudentMessage) return;
      onSendStudentMessage(ticket.id, studentMsg.trim());
      setStudentMsg('');
    };

    const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.Media;
    const ticketNumber  = ticket.id ? String(ticket.id).slice(-6).toUpperCase() : '------';
    const isActive      = ticket.status === 'escalated' || ticket.status === 'in_progress';

    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f1f3f6]">

        {/* Support header banner */}
        <div className="bg-gradient-to-r from-[#3d0000] to-[#7B1111] px-4 py-3 sm:px-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <button
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/20"
              onClick={() => setSelected(null)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Volver
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${priorityStyle.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`} />
                Prioridad {ticket.priority || 'Media'}
              </span>
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Soporte Humano</p>
              <h2 className="truncate text-sm font-bold text-white">{ticket.breadcrumb || 'Consulta General'}</h2>
            </div>
            <span className="ml-auto shrink-0 rounded-md bg-white/10 px-2 py-1 text-[10px] font-mono font-semibold text-white/60">
              #{ticketNumber}
            </span>
          </div>
        </div>

        {/* Status timeline */}
        <div className="border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
          <SupportStatusBar status={ticket.status} />
        </div>

        {/* Messages */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-5 sm:px-6">
          {ticket.messages.map((message, index) => {
            if (message.role === 'context') {
              return (
                <div key={index} className="my-2 self-center w-full max-w-[90%] rounded-xl border-2 border-dashed border-[#B71C1C] bg-[#fff5f5] px-4 py-3 text-sm text-neutral-800 text-center shadow-sm">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#B71C1C] mb-1">
                    Contexto de Escalamiento a Soporte
                  </span>
                  <p className="italic text-neutral-600">"{message.content}"</p>
                </div>
              );
            }

            const isUser  = message.role === 'user';
            const isAgent = message.role === 'support' || message.agentName;
            return (
              <div
                key={index}
                className={`flex max-w-[88%] gap-3 sm:max-w-[78%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {!isUser && (
                  isAgent
                    ? <AgentAvatar name={message.agentName} />
                    : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                        </svg>
                      </div>
                    )
                )}
                <div className="flex flex-col gap-1">
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.05em]
                    ${isUser ? 'text-right text-neutral-400' : isAgent ? 'text-[#D32F2F]' : 'text-neutral-400'}`}
                  >
                    {isUser ? (user?.name || 'Tú') : isAgent ? `Agente · ${message.agentName || 'Soporte'}` : 'Asistente virtual'}
                  </span>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                    ${isUser
                      ? 'rounded-br-sm bg-[#D32F2F] text-white'
                      : isAgent
                        ? 'rounded-bl-sm border border-[#D32F2F]/20 bg-[#fff5f5] text-neutral-800'
                        : 'rounded-bl-sm border border-neutral-200 bg-white text-neutral-700'}`}
                  >
                    {message.content.split('\n').map((line, li) => (
                      <p key={li} className={li > 0 ? 'mt-1' : ''}>{line}</p>
                    ))}
                  </div>
                  {message.timestamp && (
                    <span className={`text-[10px] text-neutral-400 ${isUser ? 'text-right' : ''}`}>
                      {new Date(message.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Rating display */}
        {(ticket.rating || ticket.feedback) && (
          <div className="border-t border-neutral-200 bg-white px-4 py-3 sm:px-6">
            {ticket.rating && (
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg tracking-[2px] text-amber-400">{formatStars(ticket.rating)}</span>
                <span className="text-xs text-neutral-500">Calificación: {ticket.rating}/5</span>
              </div>
            )}
            {ticket.feedback && <p className="m-0 text-sm italic text-neutral-500">"{ticket.feedback}"</p>}
          </div>
        )}

        {/* Reply input */}
        {isActive && (
          <div className="border-t border-neutral-200 bg-white px-4 py-4 sm:px-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">Responder al agente</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe tu respuesta aquí..."
                className="flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#D32F2F]"
                value={studentMsg}
                onChange={(e) => setStudentMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              />
              <button
                onClick={handleSend}
                disabled={!studentMsg.trim()}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[#D32F2F] text-white transition hover:bg-[#9f2323] disabled:cursor-not-allowed disabled:bg-neutral-300"
                aria-label="Enviar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  /* ── Ticket list ── */
  return (
    <main className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-neutral-900">Mis Tickets</h2>
        {tickets.length > 0 && (
          <button
            className="cursor-pointer rounded-lg border border-neutral-200 bg-transparent px-3 py-1.5 text-xs text-neutral-400 transition hover:border-red-400 hover:text-red-500"
            onClick={onClear}
          >
            Limpiar historial
          </button>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="py-16 text-center text-neutral-400">
          <svg className="mx-auto mb-3 text-neutral-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 10h20" />
          </svg>
          <h3 className="mb-2 text-[1.1rem] text-neutral-500">Sin tickets aún</h3>
          <p className="mx-auto text-sm leading-relaxed" style={{ maxWidth: 360 }}>
            Los chats que marques como resueltos, escalados o cerrados aparecerán aquí.
          </p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {tickets.map((ticketItem) => {
            const pStyle = PRIORITY_STYLES[ticketItem.priority] || PRIORITY_STYLES.Media;
            return (
              <li
                key={ticketItem.id}
                className="cursor-pointer rounded-[14px] border border-neutral-100 bg-white py-4 transition hover:border-[#D32F2F] hover:shadow"
                style={{ paddingLeft: 18, paddingRight: 18 }}
                onClick={() => setSelected(ticketItem.id)}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-md bg-[#D32F2F]/10 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-[#D32F2F]">
                    {ticketItem.breadcrumb || 'CONSULTA GENERAL'}
                  </span>
                  <span className="text-xs text-neutral-400">{formatTicketDate(ticketItem.date)}</span>
                </div>
                <p className="mb-2 line-clamp-1 text-sm text-neutral-700">{ticketItem.preview}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-neutral-400">{ticketItem.messageCount} mensajes</span>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {ticketItem.priority && (
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${pStyle.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${pStyle.dot}`} />
                        {ticketItem.priority}
                      </span>
                    )}
                    <StatusBadge status={ticketItem.status} />
                    {ticketItem.rating && (
                      <span className="text-[13px] tracking-[1px] text-amber-400">
                        {'★'.repeat(ticketItem.rating)}
                        {'☆'.repeat(5 - ticketItem.rating)}
                      </span>
                    )}
                    <ConfidenceBadge confidence={ticketItem.lastConfidence} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
