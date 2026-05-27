import { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSupportTickets } from '../../hooks/useSupportTickets';
import { addLearnedEntry } from '../../services/learningService';
import {
  formatConfidence,
  formatStatus,
  formatTicketDate,
  getStatusTone,
  TICKET_STATUS,
} from './chatUtils';

/* ─── Priority config ──────────────────────────── */
const PRIORITY_CONFIG = {
  Alta:  { bar: 'bg-red-500',   badge: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500'   },
  Media: { bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  Baja:  { bar: 'bg-green-500', badge: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Hace ${hrs} h`;
  return `Hace ${Math.floor(hrs / 24)} d`;
}

/* ─── Sub-components ───────────────────────────── */
function StatusBadge({ status }) {
  const tones = {
    blue:    'bg-blue-50 text-blue-700 border-blue-200',
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    green:   'bg-green-50 text-green-700 border-green-200',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[getStatusTone(status)]}`}>
      {formatStatus(status)}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Media;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {priority}
    </span>
  );
}

function AgentAvatar({ name }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] text-[11px] font-bold text-white shadow-sm">
      {name ? name.charAt(0).toUpperCase() : 'A'}
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D32F2F]/10 text-[#D32F2F]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
        <path d="M5.5 18.5c1.5-2.5 3.8-4 6.5-4s5 1.5 6.5 4" />
      </svg>
    </div>
  );
}

/* ─── Main component ───────────────────────────── */
export default function AgentPanel() {
  const { user } = useAuth0();
  const { tickets, setTicketStatus, registerSupportResponse } = useSupportTickets();
  const [statusFilter,   setStatusFilter]   = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedId,     setSelectedId]     = useState(null);
  const [response,       setResponse]       = useState('');
  const [addToKB,        setAddToKB]        = useState(true);
  const [detailsOpen,    setDetailsOpen]    = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-open details when there's escalation context
  useEffect(() => {
    setDetailsOpen(Boolean(selectedTicket?.escalationContext));
  }, [selectedTicket?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredTickets = tickets.filter((ticket) => {
    const activeMatch =
      statusFilter === 'active'
        ? [TICKET_STATUS.ESCALATED, TICKET_STATUS.IN_PROGRESS].includes(ticket.status)
        : ticket.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return activeMatch && priorityMatch;
  });

  const selectedTicket =
    filteredTickets.find((t) => t.id === selectedId) ||
    filteredTickets[0] ||
    null;

  // Stats
  const activeCount  = tickets.filter((t) => [TICKET_STATUS.ESCALATED, TICKET_STATUS.IN_PROGRESS].includes(t.status)).length;
  const highPriCount = tickets.filter((t) => t.priority === 'Alta' && [TICKET_STATUS.ESCALATED, TICKET_STATUS.IN_PROGRESS].includes(t.status)).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const handleStatusChange = (ticket, nextStatus) => {
    setTicketStatus(ticket.storageKey, ticket.id, nextStatus);
  };

  const handleSubmitResponse = () => {
    if (!selectedTicket || !response.trim()) return;

    registerSupportResponse(selectedTicket.storageKey, selectedTicket.id, {
      id: Date.now(),
      body: response.trim(),
      agentName: user?.name || 'Agente',
      createdAt: new Date().toISOString(),
      nextStatus: TICKET_STATUS.IN_PROGRESS,
    });

    if (addToKB) {
      const tema     = selectedTicket.breadcrumb || 'CONSULTA GENERAL';
      const problema = selectedTicket.messages?.find((m) => m.role === 'user')?.content || selectedTicket.preview || '';
      addLearnedEntry(tema, problema, response.trim());
    }

    setResponse('');
    setAddToKB(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmitResponse();
    }
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f1f3f6]">

      {/* ── Agent identity header (always visible) ── */}
      <div className="bg-gradient-to-r from-[#3d0000] to-[#7B1111] px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Panel de Agente</p>
              <h1 className="text-base font-bold text-white">{user?.name || 'Agente de Soporte'}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
              <p className="text-lg font-bold text-white">{activeCount}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Activos</p>
            </div>
            <div className="rounded-xl bg-[#D32F2F]/30 px-3 py-2 text-center">
              <p className="text-lg font-bold text-red-300">{highPriCount}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-300/70">Alta prio.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
        <select
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:border-[#B71C1C]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="active">Activos</option>
          <option value={TICKET_STATUS.ESCALATED}>Escalados</option>
          <option value={TICKET_STATUS.IN_PROGRESS}>En gestión</option>
          <option value={TICKET_STATUS.RESOLVED}>Resueltos</option>
          <option value={TICKET_STATUS.CLOSED}>Cerrados</option>
        </select>
        <select
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:border-[#B71C1C]"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">Todas las prioridades</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      {/* ── Content ── */}
      {filteredTickets.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-10 text-center text-neutral-400">
          <div>
            <svg className="mx-auto mb-3 text-neutral-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" />
            </svg>
            <p className="text-sm">No hay tickets que coincidan con los filtros actuales.</p>
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[22rem_minmax(0,1fr)]">

          {/* ── Ticket list ── */}
          <section className="min-h-0 overflow-y-auto border-b border-neutral-200 bg-white xl:border-b-0 xl:border-r">
            <div className="px-4 py-3 sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Casos · {filteredTickets.length}
              </p>
            </div>
            <div className="flex flex-col gap-1 px-2 pb-4">
              {filteredTickets.map((ticket) => {
                const cfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.Media;
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    className={`relative w-full overflow-hidden rounded-2xl border pl-5 pr-4 py-4 text-left transition-all
                      ${isSelected
                        ? 'border-[#B71C1C] bg-[#fff5f5] shadow-sm'
                        : 'border-transparent bg-transparent hover:border-neutral-200 hover:bg-neutral-50'}`}
                    onClick={() => setSelectedId(ticket.id)}
                  >
                    <span className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${cfg.bar}`} />
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#B71C1C]">
                        {ticket.breadcrumb || 'CONSULTA GENERAL'}
                      </span>
                      <span className="shrink-0 text-[11px] text-neutral-400">{timeAgo(ticket.updatedAt || ticket.date)}</span>
                    </div>
                    <p className="mb-1 text-[12px] font-medium text-neutral-500 truncate">
                      {ticket.ownerName || ticket.ownerEmail || 'Usuario'}
                    </p>
                    <p className="mb-2.5 line-clamp-2 text-sm text-neutral-700">{ticket.preview}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Case detail (chat view) ── */}
          <section className="flex min-h-0 flex-col overflow-hidden bg-[#f8f9fa]">
            {selectedTicket ? (
              <>
                {/* ── Compact case header ── */}
                <div className="shrink-0 border-b border-neutral-200 bg-white">
                  {/* Always-visible top bar */}
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#B71C1C]">
                          {selectedTicket.breadcrumb || 'CONSULTA GENERAL'}
                        </span>
                        <span className="text-neutral-300 text-xs">·</span>
                        <span className="text-[12px] font-medium text-neutral-600 truncate">
                          {(() => {
                            const n = selectedTicket.ownerName;
                            if (n && n !== 'Usuario') return n;
                            if (selectedTicket.ownerEmail) return selectedTicket.ownerEmail.split('@')[0];
                            return 'Usuario';
                          })()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-neutral-800 line-clamp-1">{selectedTicket.preview}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <PriorityBadge priority={selectedTicket.priority} />
                      <StatusBadge status={selectedTicket.status} />
                      <button
                        onClick={() => setDetailsOpen((o) => !o)}
                        title={detailsOpen ? 'Ocultar detalles' : 'Mostrar detalles'}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-[#B71C1C] hover:text-[#B71C1C]"
                      >
                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                          className={`transition-transform duration-200 ${detailsOpen ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Collapsible details */}
                  {detailsOpen && (
                    <div className="border-t border-neutral-100 px-4 pb-3 pt-2">
                      {selectedTicket.escalationContext && (
                        <div className="mb-3 rounded-xl border-l-4 border-[#D32F2F] bg-[#fff5f5] px-3 py-2">
                          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#D32F2F]">Motivo del escalamiento</p>
                          <p className="text-sm text-neutral-800">{selectedTicket.escalationContext}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span><span className="font-semibold text-neutral-700">{selectedTicket.messages.length}</span> mensajes</span>
                          <span>IA: <span className="font-semibold text-neutral-700">{formatConfidence(selectedTicket.lastConfidence)}</span></span>
                          <span className="text-neutral-400">{formatTicketDate(selectedTicket.updatedAt || selectedTicket.date)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
                            onClick={() => handleStatusChange(selectedTicket, TICKET_STATUS.IN_PROGRESS)}
                          >
                            En gestión
                          </button>
                          <button
                            className="rounded-xl bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800 transition hover:bg-green-200"
                            onClick={() => handleStatusChange(selectedTicket, TICKET_STATUS.RESOLVED)}
                          >
                            Resuelto
                          </button>
                          <button
                            className="rounded-xl bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-200"
                            onClick={() => handleStatusChange(selectedTicket, TICKET_STATUS.CLOSED)}
                          >
                            Cerrar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Messages (chat view) ── */}
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-5 sm:px-6">
                  {selectedTicket.messages.map((message, idx) => {
                    const isUser  = message.role === 'user';
                    const isAgent = Boolean(message.agentName);
                    const rawName = selectedTicket.ownerName;
                    const ownerLabel = (rawName && rawName !== 'Usuario')
                      ? rawName
                      : (selectedTicket.ownerEmail?.split('@')[0] || 'Usuario');
                    return (
                      <div
                        key={idx}
                        className={`flex max-w-[86%] gap-2.5 ${isAgent ? 'self-end flex-row-reverse' : 'self-start'}`}
                      >
                        {!isAgent && (isUser
                          ? (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-[11px] font-bold text-neutral-600">
                              {ownerLabel.charAt(0).toUpperCase()}
                            </div>
                          )
                          : <BotAvatar />
                        )}
                        <div className="flex flex-col gap-1">
                          <span className={`text-[11px] font-semibold uppercase tracking-[0.05em]
                            ${isAgent
                              ? 'text-right text-[#B71C1C]'
                              : isUser
                                ? 'text-neutral-500'
                                : 'text-neutral-400'}`}
                          >
                            {isAgent
                              ? `Agente · ${message.agentName}`
                              : isUser
                                ? ownerLabel
                                : 'Asistente virtual'}
                          </span>
                          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                            ${isAgent
                              ? 'rounded-br-sm bg-[#D32F2F] text-white'
                              : isUser
                                ? 'rounded-bl-sm border border-neutral-200 bg-neutral-100 text-neutral-800'
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

                {/* ── Composer ── */}
                <div className="shrink-0 border-t border-neutral-200 bg-white px-4 py-3 sm:px-5">
                  <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs text-neutral-500">
                    <input
                      type="checkbox"
                      checked={addToKB}
                      onChange={(e) => setAddToKB(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#B71C1C]"
                    />
                    Agregar respuesta a la base de conocimiento del chatbot
                  </label>
                  <div className="flex items-end gap-2">
                    <textarea
                      className="flex-1 resize-none rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-[#B71C1C]"
                      placeholder="Escribe tu respuesta al usuario... (Ctrl+Enter para enviar)"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                    />
                    <button
                      onClick={handleSubmitResponse}
                      disabled={!response.trim()}
                      className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[#D32F2F] text-white shadow transition hover:bg-[#B71C1C] disabled:cursor-not-allowed disabled:bg-neutral-300"
                      aria-label="Enviar respuesta"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-center text-neutral-400">
                <div>
                  <svg className="mx-auto mb-3 text-neutral-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-sm">Selecciona un ticket de la lista para atender el caso.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
