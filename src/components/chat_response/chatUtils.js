export const APP_SECTIONS = {
  CHAT: 'chat',
  TICKETS: 'tickets',
  CONFIG: 'config',
};

export const TICKET_STATUS = {
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
  CLOSED: 'closed',
};

export const RATING_LABELS = ['', 'Muy insatisfecho', 'Insatisfecho', 'Regular', 'Satisfecho', '¡Muy satisfecho! 🎉'];

let messageId = 0;

export function createMessage(role, content, extras = {}) {
  return {
    id: ++messageId,
    role,
    content,
    timestamp: new Date(),
    ...extras,
  };
}

export function formatTime(date) {
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase();
}

export function formatTicketDate(iso) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatStars(n) {
  return n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '—';
}

export function detectBreadcrumb(text) {
  const upper = text.toUpperCase();

  if (upper.includes('CANVAS') || upper.includes('LMS')) return 'ACCESO LMS';
  if (upper.includes('CORREO') || upper.includes('EMAIL')) return 'CORREO INSTITUCIONAL';
  if (upper.includes('WIFI') || upper.includes('INTERNET')) return 'INTERNET INSTITUCIONAL';
  if (upper.includes('OFFICE') || upper.includes('365')) return 'SOFTWARE INSTITUCIONAL';
  if (upper.includes('VPN')) return 'VPN Y ACCESO REMOTO';

  return 'CONSULTA GENERAL';
}
