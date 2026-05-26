import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSupportTickets } from '../../hooks/useSupportTickets';
import {
  formatConfidence,
  formatStatus,
  formatTicketDate,
  getStatusTone,
  TICKET_STATUS,
} from './chatUtils';

function StatusBadge({ status }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tones[getStatusTone(status)]}`}>
      {formatStatus(status)}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const classes = {
    Alta: 'bg-red-50 text-red-700 border-red-200',
    Media: 'bg-amber-50 text-amber-700 border-amber-200',
    Baja: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${classes[priority]}`}>
      Prioridad {priority}
    </span>
  );
}

export default function AgentPanel() {
  const { user } = useAuth0();
  const { tickets, setTicketStatus, registerSupportResponse } = useSupportTickets();
  const [statusFilter, setStatusFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [response, setResponse] = useState('');

  const filteredTickets = tickets.filter((ticket) => {
    const activeMatch = statusFilter === 'active'
      ? [TICKET_STATUS.ESCALATED, TICKET_STATUS.IN_PROGRESS].includes(ticket.status)
      : ticket.status === statusFilter;

    const priorityMatch = priorityFilter === 'all' || ticket.priority === priorityFilter;

    return activeMatch && priorityMatch;
  });

  const selectedTicket = filteredTickets.find((ticket) => ticket.id === selectedId) || filteredTickets[0] || null;

  const handleStatusChange = (ticket, nextStatus) => {
    setTicketStatus(ticket.storageKey, ticket.id, nextStatus);
  };

  const handleSubmitResponse = () => {
    if (!selectedTicket || !response.trim()) {
      return;
    }

    registerSupportResponse(selectedTicket.storageKey, selectedTicket.id, {
      id: Date.now(),
      body: response.trim(),
      agentName: user?.name || 'Agente local',
      createdAt: new Date().toISOString(),
      nextStatus: TICKET_STATUS.IN_PROGRESS,
    });
    setResponse('');
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-[#f8f9fa] p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Panel de soporte</h2>
          <p className="text-sm text-neutral-500">Gestion local de casos escalados y seguimiento operativo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="active">Activos</option>
            <option value={TICKET_STATUS.ESCALATED}>Escalados</option>
            <option value={TICKET_STATUS.IN_PROGRESS}>En gestion</option>
            <option value={TICKET_STATUS.RESOLVED}>Resueltos</option>
            <option value={TICKET_STATUS.CLOSED}>Cerrados</option>
          </select>
          <select
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="all">Todas las prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500">
          No hay tickets que coincidan con los filtros actuales.
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <section className="min-h-0 overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-3">
            <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Casos disponibles
            </div>
            <div className="space-y-2">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selectedTicket?.id === ticket.id
                      ? 'border-[#B71C1C] bg-[#fff5f5] shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-[#D32F2F]'
                  }`}
                  onClick={() => setSelectedId(ticket.id)}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#B71C1C]">
                      {ticket.breadcrumb || 'CONSULTA GENERAL'}
                    </span>
                    <span className="text-[11px] text-neutral-400">{formatTicketDate(ticket.date)}</span>
                  </div>
                  <p className="mb-3 text-sm text-neutral-700">{ticket.preview}</p>
                  <div className="flex flex-wrap gap-2">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="min-h-0 overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-5">
            {selectedTicket && (
              <>
                <div className="mb-5 flex flex-col gap-3 border-b border-neutral-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">{selectedTicket.preview}</h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Ultima actividad: {formatTicketDate(selectedTicket.updatedAt || selectedTicket.date)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <PriorityBadge priority={selectedTicket.priority} />
                    <StatusBadge status={selectedTicket.status} />
                    <span className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
                      Confianza {formatConfidence(selectedTicket.lastConfidence)}
                    </span>
                  </div>
                </div>

                <div className="mb-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">Usuario</p>
                    <p className="mt-2 text-sm text-neutral-700">{selectedTicket.ownerName || selectedTicket.ownerEmail || selectedTicket.ownerId}</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">Mensajes</p>
                    <p className="mt-2 text-sm text-neutral-700">{selectedTicket.messageCount}</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">Contexto de escalamiento</p>
                    <p className="mt-2 text-sm text-neutral-700">{selectedTicket.escalationContext || 'Sin detalle adicional'}</p>
                  </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  <button
                    className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-200"
                    onClick={() => handleStatusChange(selectedTicket, TICKET_STATUS.IN_PROGRESS)}
                  >
                    Marcar en gestion
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

                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Conversacion del caso
                  </h4>
                  <div className="space-y-3">
                    {selectedTicket.messages.map((message, index) => (
                      <div key={index} className={`rounded-2xl px-4 py-3 text-sm ${message.role === 'user' ? 'bg-[#fff5f5] text-neutral-700' : 'bg-neutral-50 text-neutral-700'}`}>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                          {message.role === 'user' ? 'Usuario' : 'Asistente'}
                        </p>
                        {message.content.split('\n').map((line, lineIndex) => (
                          <p key={lineIndex} className={lineIndex > 0 ? 'mt-1' : ''}>{line}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Respuesta de soporte
                  </h4>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-[#B71C1C]"
                    placeholder="Documenta la gestion realizada para este caso..."
                    value={response}
                    onChange={(event) => setResponse(event.target.value)}
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      className="rounded-xl bg-[#B71C1C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9f2323]"
                      onClick={handleSubmitResponse}
                    >
                      Registrar respuesta
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Historial de gestion
                  </h4>
                  {selectedTicket.supportResponses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
                      Aun no hay respuestas registradas por soporte.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTicket.supportResponses.map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-neutral-800">{entry.agentName}</p>
                            <p className="text-[11px] text-neutral-400">{formatTicketDate(entry.createdAt)}</p>
                          </div>
                          <p className="text-sm text-neutral-700">{entry.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
