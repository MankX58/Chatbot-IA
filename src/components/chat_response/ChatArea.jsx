import { useEffect, useRef, useState } from 'react';
import { RATING_LABELS, formatTime } from './chatUtils';

function BotIcon() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D32F2F] text-white">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
        <path d="M5.5 18.5c1.5-2.5 3.8-4 6.5-4s5 1.5 6.5 4" />
      </svg>
    </div>
  );
}

function MessageBubble({ message, onFeedback }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex max-w-[80%] gap-3 ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
      {!isUser && <BotIcon />}
      <div className="flex flex-col gap-1">
        {!isUser && <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-neutral-500">ASISTENTE VIRTUAL</span>}
        {isUser && <span className="text-right text-[11px] text-neutral-400">Tú · {formatTime(message.timestamp)}</span>}

        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'rounded-br-sm bg-[#D32F2F] text-white' : 'rounded-bl-sm border border-neutral-200 bg-white text-neutral-800'}`}>
          {message.content.split('\n').map((line, index) => (
            <p key={index} className={index > 0 ? 'mt-1' : ''}>{line}</p>
          ))}
        </div>

        {!isUser && message.showFeedback && (
          <div className="mt-2 rounded-xl border border-neutral-200 bg-white p-3">
            <div className="mb-2.5 flex items-center gap-2 text-[13px] text-neutral-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              ¿Esta respuesta fue útil para resolver tu problema?
            </div>
            <div className="flex gap-2">
              <button className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-green-600 bg-white px-3.5 py-2 text-[13px] text-green-700 transition hover:bg-green-100" onClick={() => onFeedback(message.id, true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Sí, resolvió mi problema
              </button>
              <button className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-600 bg-white px-3.5 py-2 text-[13px] text-red-700 transition hover:bg-red-100" onClick={() => onFeedback(message.id, false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                No resolvió mi problema
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex max-w-[80%] gap-3 self-start">
      <BotIcon />
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-neutral-500">ASISTENTE VIRTUAL</span>
        <div className="flex min-w-15 items-center gap-1 rounded-2xl rounded-bl-sm border border-neutral-200 bg-white px-5 py-4">
          <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.32s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.16s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" />
        </div>
      </div>
    </div>
  );
}

function RatingModal({ isOpen, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!rating) return;
    onSubmit({ rating, feedback });
    setSubmitted(true);

    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setRating(0);
      setFeedback('');
    }, 2200);
  };

  const handleClose = () => {
    onClose();
    setRating(0);
    setHovered(0);
    setFeedback('');
    setSubmitted(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="mx-5 w-full max-w-105 rounded-[20px] bg-white p-8 shadow-2xl">
        {!submitted ? (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-700">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="m-0 mb-1 text-xl font-bold text-neutral-800">Chat resuelto</h2>
              <p className="m-0 text-sm text-neutral-500">¿Cómo fue tu experiencia con el asistente?</p>
            </div>

            <div className="mb-5 text-center">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.5px] text-neutral-500">Calificación</span>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    className="cursor-pointer border-0 bg-transparent p-1 transition hover:scale-110"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHovered(value)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`${value} estrella${value > 1 ? 's' : ''}`}
                  >
                    <svg viewBox="0 0 24 24" width="40" height="40">
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                        className={`${value <= (hovered || rating) ? 'fill-amber-400' : 'fill-neutral-300'}`}
                      />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="mt-2 min-h-5 text-sm text-neutral-600">{RATING_LABELS[hovered || rating] || '\u00A0'}</p>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.5px] text-neutral-500">Comentarios (opcional)</label>
              <textarea
                className="w-full rounded-xl border border-neutral-300 p-3 text-sm outline-none transition focus:border-[#D32F2F]"
                placeholder="Cuéntanos cómo podemos mejorar..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button className="cursor-pointer rounded-[10px] border border-neutral-300 bg-white px-5 py-2.5 text-sm text-neutral-500 transition hover:bg-neutral-100" onClick={handleClose}>Omitir</button>
              <button
                className={`rounded-[10px] border-0 px-6 py-2.5 text-sm font-semibold text-white transition ${rating ? 'cursor-pointer bg-[#D32F2F] hover:bg-[#9f2323]' : 'cursor-not-allowed bg-neutral-400'}`}
                onClick={handleSubmit}
                disabled={!rating}
              >
                Enviar calificación
              </button>
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-700">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="m-0 mb-2 text-lg font-bold text-neutral-800">¡Gracias por tu opinión!</h3>
            <p className="m-0 text-sm leading-relaxed text-neutral-500">Tu calificación nos ayuda a mejorar la experiencia del asistente virtual.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EscalationModal({ isOpen, onClose, onSubmit }) {
  const [context, setContext] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!context.trim()) return;
    onSubmit({ escalationContext: context.trim() });
    setSubmitted(true);

    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setContext('');
    }, 3000);
  };

  const handleClose = () => {
    onClose();
    setContext('');
    setSubmitted(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="mx-5 w-full max-w-105 rounded-[20px] bg-white p-8 shadow-2xl">
        {!submitted ? (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D32F2F]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h2 className="m-0 mb-1 text-xl font-bold text-neutral-800">Escalar a agente de soporte</h2>
              <p className="m-0 text-sm text-neutral-500">Describe brevemente tu problema para que nuestro equipo pueda ayudarte mejor.</p>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.5px] text-neutral-500">Contexto del problema</label>
              <textarea
                className="w-full rounded-xl border border-neutral-300 p-3 text-sm outline-none transition focus:border-[#D32F2F]"
                placeholder="Ej: No puedo acceder a Canvas desde hace 2 días, ya intenté restablecer la contraseña..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button className="cursor-pointer rounded-[10px] border border-neutral-300 bg-white px-5 py-2.5 text-sm text-neutral-500 transition hover:bg-neutral-100" onClick={handleClose}>Cancelar</button>
              <button
                className={`rounded-[10px] border-0 px-6 py-2.5 text-sm font-semibold text-white transition ${context.trim() ? 'cursor-pointer bg-[#D32F2F] hover:bg-[#9f2323]' : 'cursor-not-allowed bg-neutral-400'}`}
                onClick={handleSubmit}
                disabled={!context.trim()}
              >
                Enviar y escalar
              </button>
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-700">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="m-0 mb-2 text-lg font-bold text-neutral-800">¡Escalamiento enviado!</h3>
            <p className="m-0 text-sm leading-relaxed text-neutral-500">Hemos registrado tu caso. Recibirás actualizaciones sobre el progreso en tu correo institucional.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotResolvedOptions({ onEscalate, onContinue, onClose }) {
  return (
    <div className="mt-2 max-w-[90%] self-start rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>¿Qué te gustaría hacer ahora?</span>
      </div>

      <div className="flex flex-col gap-2">
        <button className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#D32F2F] bg-white px-4 py-3 text-left text-sm text-[#D32F2F] transition hover:translate-x-1 hover:bg-[#e7f1ff]" onClick={onEscalate}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Escalar a agente de soporte
        </button>

        <button className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-green-700 bg-white px-4 py-3 text-left text-sm text-green-700 transition hover:translate-x-1 hover:bg-green-100" onClick={onContinue}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Continuar con el chat
        </button>

        <button className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-neutral-500 bg-white px-4 py-3 text-left text-sm text-neutral-500 transition hover:translate-x-1 hover:bg-neutral-100" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Cerrar chat
        </button>
      </div>
    </div>
  );
}

export default function ChatArea({
  messages,
  onSend,
  isLoading,
  onFeedback,
  onResolved,
  onEscalated,
  onClosed,
  onNewChat,
  chatLocked,
  breadcrumb,
}) {
  const [input, setInput] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [showNotResolvedOptions, setShowNotResolvedOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, showNotResolvedOptions]);

  useEffect(() => {
    if (!chatLocked) {
      inputRef.current?.focus();
    }
  }, [chatLocked]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed || isLoading || chatLocked) return;

    onSend(trimmed);
    setInput('');
  };

  const handleFeedback = (messageId, resolved) => {
    onFeedback(messageId, resolved);

    if (resolved) {
      setShowRatingModal(true);
      return;
    }

    setShowNotResolvedOptions(true);
  };

  const handleEscalate = () => {
    setShowNotResolvedOptions(false);
    setShowEscalationModal(true);
  };

  const handleCloseChat = () => {
    setShowNotResolvedOptions(false);
    onClosed?.();
  };

  const isChatEnded = chatLocked;

  return (
    <main className="flex h-full w-full flex-col bg-[#f8f9fa]">
      {breadcrumb && (
        <div className="flex items-center gap-2 border-b border-b-neutral-200 bg-white px-5 py-3 text-[13px] text-neutral-500">
          <span>Soporte</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="font-semibold text-[#D32F2F]">{breadcrumb}</span>
        </div>
      )}

      <div className="flex w-full flex-1 flex-col gap-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex h-full w-full flex-col items-center justify-center text-center text-neutral-400">
            <div className="mb-4 text-neutral-300">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg text-neutral-600">¡Bienvenido al Chat de Soporte!</h3>
            <p className="max-w-80 text-sm">Escribe tu consulta sobre servicios tecnológicos de la Universidad de Medellín.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onFeedback={handleFeedback} />
        ))}

        {isLoading && <TypingIndicator />}

        {showNotResolvedOptions && !isChatEnded && (
          <NotResolvedOptions
            onEscalate={handleEscalate}
            onContinue={() => setShowNotResolvedOptions(false)}
            onClose={handleCloseChat}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {isChatEnded ? (
        <div className="border-t border-t-neutral-200 bg-white px-5 py-4">
          <div className="flex flex-col items-center gap-3 p-4 text-center">
            <p className="m-0 text-sm text-neutral-500">Se cerró el chat.</p>
            <button type="button" className="flex h-11 w-[40%] cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#D32F2F] px-4 text-white transition hover:bg-[#9f2323]" onClick={onNewChat}>
              Iniciar nuevo chat
            </button>
          </div>
        </div>
      ) : (
        <form className="border-t border-t-neutral-200 bg-white px-5 py-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 rounded-full border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-[#D32F2F]"
              placeholder="Escribe tu mensaje aquí..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#D32F2F] text-white transition hover:bg-[#9f2323] disabled:cursor-not-allowed disabled:bg-neutral-400"
              disabled={!input.trim() || isLoading}
              aria-label="Enviar mensaje"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      )}

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={({ rating, feedback }) => onResolved?.({ rating, feedback })}
      />

      <EscalationModal
        isOpen={showEscalationModal}
        onClose={() => setShowEscalationModal(false)}
        onSubmit={({ escalationContext }) => onEscalated?.({ escalationContext })}
      />
    </main>
  );
}