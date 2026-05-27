import { useState } from 'react';
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

/* ─── Priority config ──────────────────────────────────── */
const PRIORITY_CONFIG = {
  Alta:  { bar: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200',    dot: 'bg-red-500'    },
  Media: { bar: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  Baja:  { bar: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
};

/* ─── Helpers ──────────────────────────────────────────── */
function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)  return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Hace ${hrs} h`;
  return `Hace ${Math.floor(hrs / 24)} d`;
}

/* ─── Sub-components ───────────────────────────────────── */
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
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-[11px] font-bold text-white shadow-sm">
      {name ? name.charAt(0).toUpperCase() : 'A'}
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D32F2F] text-white">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
        <path d="M5.5 18.5c1.5-2.5 3.8-4 6.5-4s5 1.5 6.5 4" />
      </svg>
    </div>
  );
}

/* ─── Main component ───────────────────────────────────── */
export default function AgentPanel() {
  const { user } = useAuth0();
  const { tickets, setTicketStatus, registerSupportResponse } = useSupportTickets();
  const [statusFilter,   setStatusFilter]   = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedId,     setSelectedId]     = useState(null);
  const [response,       setResponse]       = useState('');
  const [addToKB,        setAddToKB]        = useState(true);

  const filteredTickets = tickets.filter((ticket) => {
    const activeMatch =
      statusFilter === 'active'
        ? [TICKET_STATUS.ESCALATED, TICKET_STATUS.IN_PROGRESS].includes(ticket.status)
        : ticket.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return activeMatch && priorityMatch;
  });

  const selectedTicket =
    filteredTickets.find((ticket) => ticket.id === selectedId) ||
    filteredTickets[0] ||
    null;

  // Stats
  const activeCount  = tickets.filter((t) => [TICKET_STATUS.ESCALATED, TICKET_STATUS.IN_PROGRESS].includes(t.status)).length;
  const highPriCount = tickets.filter((t) => t.priority === 'Alta' && [TICKET_STATUS.ESCALATED, TICKET_STATUS.IN_PROGRESS].includes(t.status)).length;

  const handleStatusChange = (ticket, nextStatus) => {
    setTicketStatus(ticket.storageKey, ticket.id, nextStatus);
  };

  const handleSubmitResponse = () => {
    if (!selectedTicket || !response.trim()) return;

    registerSupportResponse(selectedTicket.storageKey, selectedTicket.id, {
      id: Date.now(),
      body: response.trim(),
      agentName: user?.name || 'Agente local',
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

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f1f3f6]">

      {/* ── Agent identity header ── */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-4 sm:px-6">
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

          {/* Quick stats */}
          <div className="flex gap-2">
            <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
              <p className="text-lg font-bold text-white">{activeCount}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Activos</p>
            </div>
            <div className="rounded-xl bg-red-500/25 px-3 py-2 text-center">
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
        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden xl:grid-cols-[22rem_minmax(0,1fr)]">

          {/* ── Ticket list ── */}
          <section className="min-h-0 overflow-y-auto border-b border-neutral-200 bg-white xl:border-b-0 xl:border-r">
            <div className="px-4 py-3 sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Casos disponibles · {filteredTickets.length}
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
                    {/* Priority bar */}
                    <span className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${cfg.bar}`} />

                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#B71C1C]">
                        {ticket.breadcrumb || 'CONSULTA GENERAL'}
                      </span>
                      <span className="shrink-0 text-[11px] text-neutral-400">{timeAgo(ticket.updatedAt || ticket.date)}</span>
                    </div>

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

          {/* ── Ticket detail ── */}
          <section className="min-h-0 overflow-y-auto bg-[#f8f9fa]">
            {selectedTicket ? (
              <div className="flex h-full flex-col">

                {/* Detail header */}
                <div className="border-b border-neutral-200 bg-white px-5 py-4">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-neutral-900">{selectedTicket.preview}</h2>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        Última actividad: {formatTicketDate(selectedTicket.updatedAt || selectedTicket.date)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <PriorityBadge priority={selectedTicket.priority} />
                      <StatusBadge status={selectedTicket.status} />
                    </div>
                  </div>

                  {/* Meta cards */}
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Usuario</p>
                      <p className="mt-1 text-sm font-medium text-neutral-800 truncate">
                        {selectedTicket.ownerName || selectedTicket.ownerEmail || selectedTicket.ownerId}
                      </p>
                    </div>
                    <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Mensajes</p>
                      <p className="mt-1 text-sm font-medium text-neutral-800">{selectedTicket.messageCount}</p>
                    </div>
                    <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Confianza IA</p>
                      <p className="mt-1 text-sm font-medium text-neutral-800">{formatConfidence(selectedTicket.lastConfidence)}</p>
                    </div>
                  </div>
                </div>

                {/* Escalation context */}
                {selectedTicket.escalationContext && (
                  <div className="mx-4 mt-4 rounded-2xl border-l-4 border-[#D32F2F] bg-red-50 px-4 py-3">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#D32F2F]">
                      Contexto de escalamiento
                    </p>
                    <p className="text-sm text-neutral-800">{selectedTicket.escalationContext}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mx-4 mt-4 flex flex-wrap gap-2">
                  <button
                    className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-200"
                    onClick={() => handleStatusChange(selectedTicket, TICKET_STATUS.IN_PROGRESS)}
                  >
                    Marcar en gestión
                  </button>
                  <button
                    className="rounded-xl bg-green-100 px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-200"
                    onClick={() => handleStatusChange(selectedTicket, TICKET_STATUS.RESOLVED)}
                  >
                    Marcar resuelto
                  </button>
                  <button
                    className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-300"
                    onClick={() => handleStatusChange(selectedTicket, TICKET_STATUS.CLOSED)}
                  >
                    Cerrar ticket
                  </button>
                </div>

                {/* Conversation */}
                <div className="mx-4 mt-5">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                    Conversación del caso
                  </p>
                  <div className="flex flex-col gap-3">
                    {selectedTicket.messages.map((message, idx) => {
                      const isUser  = message.role === 'user';
                      const isAgent = message.role === 'support' || message.agentName;
                      return (
                        <div
                          key={idx}
                          className={`flex max-w-[88%] gap-3 ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
                        >
                          {!isUser && (isAgent ? <AgentAvatar name={message.agentName} /> : <BotAvatar />)}
                          <div className="flex flex-col gap-1">
                            <span className={`text-[11px] font-semibold uppercase tracking-[0.05em]
                              ${isUser ? 'text-right text-neutral-400' : isAgent ? 'text-indigo-600' : 'text-[#D32F2F]'}`}>
                              {isUser ? 'Usuario' : isAgent ? `Agente · ${message.agentName || 'Soporte'}` : 'Asistente virtual'}
                            </span>
                            <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                              ${isUser
                                ? 'rounded-br-sm bg-neutral-200 text-neutral-800'
                                : isAgent
                                  ? 'rounded-bl-sm border border-indigo-100 bg-indigo-50 text-indigo-900'
                                  : 'rounded-bl-sm border border-neutral-200 bg-white text-neutral-700'}`}
                            >
                              {message.content.split('\n').map((line, li) => (
                                <p key={li} className={li > 0 ? 'mt-1' : ''}>{line}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Support response */}
                <div className="mx-4 mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                    Registrar respuesta de soporte
                  </p>
                  <textarea
                    className="min-h-28 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-[#B71C1C]"
                    placeholder="Documenta la gestión realizada para este caso..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                  />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
                      <input
                        type="checkbox"
                        checked={addToKB}
                        onChange={(e) => setAddToKB(e.target.checked)}
                        className="h-4 w-4 accent-[#B71C1C]"
                      />
                      Agregar a base de conocimiento del Chatbot
                    </label>
                    <button
                      className="rounded-xl bg-[#B71C1C] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#9f2323] disabled:cursor-not-allowed disabled:bg-neutral-300"
                      onClick={handleSubmitResponse}
                      disabled={!response.trim()}
                    >
                      Registrar respuesta
                    </button>
                  </div>
                </div>

                {/* Management history */}
                <div className="mx-4 mt-5 mb-6">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                    Historial de gestión
                  </p>
                  {selectedTicket.supportResponses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-neutral-200 p-4 text-center text-sm text-neutral-400">
                      Aún no hay respuestas registradas por soporte.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedTicket.supportResponses.map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <AgentAvatar name={entry.agentName} />
                              <p className="text-sm font-semibold text-neutral-800">{entry.agentName}</p>
                            </div>
                            <p className="text-[11px] text-neutral-400">{formatTicketDate(entry.createdAt)}</p>
                          </div>
                          <p className="text-sm text-neutral-700">{entry.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-center text-neutral-400">
                <div>
                  <svg className="mx-auto mb-3 text-neutral-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-sm">Selecciona un ticket de la lista para ver los detalles.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
