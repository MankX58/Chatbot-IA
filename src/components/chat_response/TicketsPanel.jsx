import { useState } from 'react';
import { formatStars, formatTicketDate } from './chatUtils';

export default function TicketsPanel({ tickets, onClear }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const ticket = tickets.find((item) => item.id === selected);

    return (
      <main className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button className="flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-semibold text-[#fb2c36]" onClick={() => setSelected(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-[#fb2c36]/10 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-[#fb2c36]">{ticket.breadcrumb || 'CONSULTA GENERAL'}</span>
            <span className="text-xs text-neutral-400">{formatTicketDate(ticket.date)}</span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-5">
          {ticket.messages.map((msg, index) => (
            <div key={index} className={`flex max-w-[92%] flex-col sm:max-w-[80%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-400">{msg.role === 'user' ? 'Tú' : 'Asistente'}</span>
              <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#fb2c36] text-white' : 'bg-neutral-100 text-neutral-700'}`}>
                {msg.content.split('\n').map((line, lineIndex) => (
                  <p key={lineIndex} className={lineIndex > 0 ? 'mt-1' : ''}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {(ticket.rating || ticket.feedback) && (
          <div className="mt-2 border-t border-t-neutral-200 pt-4">
            {ticket.rating && (
              <div className="mb-2 flex items-center gap-2.5">
                <span className="text-xl tracking-[2px] text-amber-400">{formatStars(ticket.rating)}</span>
                <span className="text-xs font-medium text-neutral-500">Calificación: {ticket.rating}/5</span>
              </div>
            )}
            {ticket.feedback && <p className="m-0 text-sm italic text-neutral-600">"{ticket.feedback}"</p>}
          </div>
        )}

        {ticket.status && (
          <div className={`mt-4 inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold ${
            ticket.status === 'escalated'
              ? 'bg-[#e7f1ff] text-[#D32F2F]'
              : ticket.status === 'resolved'
                ? 'bg-[#d1e7dd] text-[#198754]'
                : 'bg-neutral-100 text-neutral-500'
          }`}>
            {ticket.status === 'escalated' ? 'Escalado a soporte' : 'Cerrado'}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto p-4 sm:p-6">
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-neutral-900">Mis Tickets</h2>
        {tickets.length > 0 && (
          <button className="cursor-pointer rounded-lg border border-neutral-200 bg-transparent px-3 py-1.5 text-xs text-neutral-400 transition hover:border-red-400 hover:text-red-500" onClick={onClear}>
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
          <p className="mx-auto text-sm leading-relaxed" style={{ maxWidth: 360 }}>Los chats que marques como resueltos, escalados o cerrados aparecerán aquí.</p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {tickets.map((ticket) => (
            <li
              key={ticket.id}
              className="cursor-pointer rounded-[14px] border border-neutral-100 bg-white py-4 transition hover:border-[#fb2c36] hover:shadow"
              style={{ paddingLeft: 18, paddingRight: 18 }}
              onClick={() => setSelected(ticket.id)}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-md bg-[#fb2c36]/10 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-[#fb2c36]">{ticket.breadcrumb || 'CONSULTA GENERAL'}</span>
                <span className="text-xs text-neutral-400">{formatTicketDate(ticket.date)}</span>
              </div>
              <p className="mb-2 line-clamp-1 text-sm text-neutral-700">{ticket.preview}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">{ticket.messageCount} mensajes</span>
                <div className="flex items-center gap-2">
                  {ticket.status === 'escalated' && <span className="rounded-full bg-[#e7f1ff] px-2 py-0.5 text-[11px] font-semibold uppercase text-[#D32F2F]">Escalado</span>}
                  {ticket.status === 'closed' && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-neutral-500">Cerrado</span>}
                  {ticket.rating && (
                    <span className="text-[13px] tracking-[1px] text-amber-400">
                      {'★'.repeat(ticket.rating)}
                      {'☆'.repeat(5 - ticket.rating)}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
