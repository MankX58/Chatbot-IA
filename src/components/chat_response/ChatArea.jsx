import { useState, useRef, useEffect } from 'react';
import './ChatArea.css';

function formatTime(date) {
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
}

function BotIcon() {
    return (
        <div className="chat__bot-icon">
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
        <div className={`chat__message ${isUser ? 'chat__message--user' : 'chat__message--bot'}`}>
            {!isUser && <BotIcon />}
            <div className="chat__message-content">
                {!isUser && <span className="chat__message-label">ASISTENTE VIRTUAL</span>}
                {isUser && (
                    <span className="chat__message-time">Tú · {formatTime(message.timestamp)}</span>
                )}
                <div className={`chat__bubble ${isUser ? 'chat__bubble--user' : 'chat__bubble--bot'}`}>
                    {message.content.split('\n').map((line, i) => (
                        <p key={i} className="chat__line">{line}</p>
                    ))}
                </div>
                {!isUser && message.showFeedback && (
                    <div className="chat__feedback">
                        <div className="chat__feedback-question">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            ¿Esta respuesta fue útil para resolver tu problema?
                        </div>
                        <div className="chat__feedback-buttons">
                            <button
                                className="chat__feedback-btn chat__feedback-btn--yes"
                                onClick={() => onFeedback(message.id, true)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Sí, resolvió mi problema
                            </button>
                            <button
                                className="chat__feedback-btn chat__feedback-btn--no"
                                onClick={() => onFeedback(message.id, false)}
                            >
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
        <div className="chat__message chat__message--bot">
            <BotIcon />
            <div className="chat__message-content">
                <span className="chat__message-label">ASISTENTE VIRTUAL</span>
                <div className="chat__bubble chat__bubble--bot chat__typing">
                    <span className="chat__typing-dot" />
                    <span className="chat__typing-dot" />
                    <span className="chat__typing-dot" />
                </div>
            </div>
        </div>
    );
}

// ─── Rating Labels ────────────────────────────────────────────────────────────
const RATING_LABELS = ['', 'Muy insatisfecho', 'Insatisfecho', 'Regular', 'Satisfecho', '¡Muy satisfecho! 🎉'];

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
        <div
            className="rating-modal__overlay"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="rating-modal">
                {!submitted ? (
                    <>
                        <div className="rating-modal__header">
                            <div className="rating-modal__check-circle">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                    stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h2 className="rating-modal__title">Chat resuelto</h2>
                            <p className="rating-modal__subtitle">¿Cómo fue tu experiencia con el asistente?</p>
                        </div>

                        <div className="rating-modal__stars-section">
                            <span className="rating-modal__section-label">Calificación</span>
                            <div className="rating-modal__stars">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        className={`rating-modal__star-btn ${value <= (hovered || rating) ? 'rating-modal__star-btn--active' : ''}`}
                                        onClick={() => setRating(value)}
                                        onMouseEnter={() => setHovered(value)}
                                        onMouseLeave={() => setHovered(0)}
                                        aria-label={`${value} estrella${value > 1 ? 's' : ''}`}
                                    >
                                        <svg viewBox="0 0 24 24" width="40" height="40">
                                            <polygon
                                                className="rating-modal__star-icon"
                                                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                                            />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                            <p className="rating-modal__rating-label">
                                {RATING_LABELS[hovered || rating] || '\u00A0'}
                            </p>
                        </div>

                        <div className="rating-modal__feedback-section">
                            <label className="rating-modal__section-label">Comentarios (opcional)</label>
                            <textarea
                                className="rating-modal__textarea"
                                placeholder="Cuéntanos cómo podemos mejorar..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="rating-modal__actions">
                            <button className="rating-modal__btn-skip" onClick={handleClose}>
                                Omitir
                            </button>
                            <button
                                className={`rating-modal__btn-submit ${rating ? 'rating-modal__btn-submit--enabled' : ''}`}
                                onClick={handleSubmit}
                                disabled={!rating}
                            >
                                Enviar calificación
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="rating-modal__success">
                        <div className="rating-modal__success-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h3 className="rating-modal__success-title">¡Gracias por tu opinión!</h3>
                        <p className="rating-modal__success-text">
                            Tu calificación nos ayuda a mejorar la experiencia del asistente virtual.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── ChatArea ─────────────────────────────────────────────────────────────────
// chatLocked y onNewChat ahora vienen del padre (App.jsx) para sobrevivir
// cambios de pestaña sin perder el estado.
export default function ChatArea({ messages, onSend, isLoading, onFeedback, onResolved, onNewChat, chatLocked, breadcrumb }) {
    const [input, setInput] = useState('');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isLoading || chatLocked) return;
        onSend(trimmed);
        setInput('');
    };

    const handleFeedback = (messageId, resolved) => {
        onFeedback(messageId, resolved);
        if (resolved) {
            setShowRatingModal(true);
        }
    };

    // Al cerrar el modal (omitir o tras éxito) se notifica al padre
    const handleRatingClose = () => {
        setShowRatingModal(false);
        // Si se omitió sin enviar, igual bloqueamos el chat a través del padre
        onResolved?.({ rating: null, feedback: '' });
    };

    const handleRatingSubmit = ({ rating, feedback }) => {
        onResolved?.({ rating, feedback });
    };

    return (
        <main className="chat">
            {breadcrumb && (
                <div className="chat__breadcrumb">
                    <span className="chat__breadcrumb-item">Soporte</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="chat__breadcrumb-item chat__breadcrumb-item--active">{breadcrumb}</span>
                </div>
            )}

            <div className="chat__messages">
                {messages.length === 0 && (
                    <div className="chat__empty">
                        <div className="chat__empty-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h3>¡Bienvenido al Chat de Soporte!</h3>
                        <p>Escribe tu consulta sobre servicios tecnológicos de la Universidad de Medellín.</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} onFeedback={handleFeedback} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {chatLocked ? (
                <div className="chat__input-area">
                    <div className="chat__resolved">
                        <p>Se cerró el chat porque indicaste que el problema fue resuelto.</p>
                        <button
                            type="button"
                            className="chat__send-btn"
                            onClick={onNewChat}
                        >
                            Iniciar nuevo chat
                        </button>
                    </div>
                </div>
            ) : (
                <form className="chat__input-area" onSubmit={handleSubmit}>
                    <div className="chat__input-wrapper">
                        <input
                            ref={inputRef}
                            type="text"
                            className="chat__input"
                            placeholder="Escribe tu mensaje aquí..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="chat__send-btn"
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

            {/* Modal de calificación */}
            <RatingModal
                isOpen={showRatingModal}
                onClose={handleRatingClose}
                onSubmit={handleRatingSubmit}
            />
        </main>
    );
}
