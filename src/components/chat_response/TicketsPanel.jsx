import { useState } from 'react';
import {
  formatConfidence,
  formatStars,
  formatStatus,
  formatTicketDate,
  getConfidenceTone,
  getStatusTone,
} from './chatUtils';

function ConfidenceBadge({ confidence }) {
  if (!confidence) {
    return null;
  }

  const tone = getConfidenceTone(confidence);
  const classes = {
    high: 'border-green-200 bg-green-50 text-green-700',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    low: 'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${classes[tone]}`}>
      Confianza {formatConfidence(confidence)}
    </span>
  );
}

function StatusBadge({ status }) {
  const classes = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${classes[getStatusTone(status)]}`}>
      {formatStatus(status)}
    </span>
  );
}

export default function TicketsPanel({ tickets, onClear, onSendStudentMessage }) {
  const [selected, setSelected] = useState(null);
  const [studentMsg, setStudentMsg] = useState('');

  if (selected) {
    const ticket = tickets.find((item) => item.id === selected);

    const handleSend = () => {
      if (!studentMsg.trim() || !onSendStudentMessage) return;
      onSendStudentMessage(ticket.id, studentMsg.trim());
      setStudentMsg('');
    };

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
            <span className="rounded-md bg-[#fb2c36]/10 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-[#fb2c36]">
              {ticket.breadcrumb || 'CONSULTA GENERAL'}
            </span>
            <span className="text-xs text-neutral-400">{formatTicketDate(ticket.date)}</span>
            <StatusBadge status={ticket.status} />
            <ConfidenceBadge confidence={ticket.lastConfidence} />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-5">
          {ticket.messages.map((message, index) => (
            <div
              key={index}
              className={`flex max-w-[92%] flex-col sm:max-w-[80%] ${message.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-400">
                {message.role === 'user' ? 'Tu' : message.agentName ? `Soporte (${message.agentName})` : 'Asistente'}
              </span>
              <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'bg-[#fb2c36] text-white' : 'bg-neutral-100 text-neutral-700'}`}>
                {message.content.split('\n').map((line, lineIndex) => (
                  <p key={lineIndex} className={lineIndex > 0 ? 'mt-1' : ''}>{line}</p>
                ))}
              </div>
              {message.role === 'assistant' && message.confidence && (
                <div className="mt-2">
                  <ConfidenceBadge confidence={message.confidence} />
                </div>
              )}
            </div>
          ))}
        </div>

        {(ticket.status === 'escalated' || ticket.status === 'in_progress') && (
          <div className="mt-4 border-t border-t-neutral-200 pt-4 flex gap-2">
            <input
              type="text"
              placeholder="Escribe un mensaje para soporte..."
              className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-[#fb2c36]"
              value={studentMsg}
              onChange={(e) => setStudentMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <button
              onClick={handleSend}
              className="rounded-xl bg-[#fb2c36] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d62029]"
            >
              Enviar
            </button>
          </div>
        )}

        {ticket.supportResponses?.length > 0 && (
          <div className="mt-2 border-t border-t-neutral-200 pt-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
              Respuestas de soporte
            </h3>
            <div className="space-y-3">
              {ticket.supportResponses.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-800">{entry.agentName}</p>
                    <p className="text-[11px] text-neutral-400">{formatTicketDate(entry.createdAt)}</p>
                  </div>
                  <p className="text-sm text-neutral-700">{entry.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(ticket.rating || ticket.feedback) && (
          <div className="mt-4 border-t border-t-neutral-200 pt-4">
            {ticket.rating && (
              <div className="mb-2 flex items-center gap-2.5">
                <span className="text-xl tracking-[2px] text-amber-400">{formatStars(ticket.rating)}</span>
                <span className="text-xs font-medium text-neutral-500">Calificacion: {ticket.rating}/5</span>
              </div>
            )}
            {ticket.feedback && <p className="m-0 text-sm italic text-neutral-600">"{ticket.feedback}"</p>}
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
          <h3 className="mb-2 text-[1.1rem] text-neutral-500">Sin tickets aun</h3>
          <p className="mx-auto text-sm leading-relaxed" style={{ maxWidth: 360 }}>
            Los chats que marques como resueltos, escalados o cerrados apareceran aqui.
          </p>
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
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-md bg-[#fb2c36]/10 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-[#fb2c36]">
                  {ticket.breadcrumb || 'CONSULTA GENERAL'}
                </span>
                <span className="text-xs text-neutral-400">{formatTicketDate(ticket.date)}</span>
              </div>
              <p className="mb-2 line-clamp-1 text-sm text-neutral-700">{ticket.preview}</p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-neutral-400">{ticket.messageCount} mensajes</span>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <StatusBadge status={ticket.status} />
                  {ticket.rating && (
                    <span className="text-[13px] tracking-[1px] text-amber-400">
                      {'★'.repeat(ticket.rating)}
                      {'☆'.repeat(5 - ticket.rating)}
                    </span>
                  )}
                  <ConfidenceBadge confidence={ticket.lastConfidence} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
