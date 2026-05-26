import { buildApiUrl } from '../config/runtimeConfig.js';

const CHAT_API_URL = buildApiUrl('/api/chat');

/**
 * Envia el historial del chat al backend para que la llamada a DeepSeek se haga
 * en el lado servidor usando las variables de entorno configuradas en Vercel.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>}
 */
export async function sendMessage(messages) {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(
      errorPayload?.error ||
      errorPayload?.details ||
      `Error ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.reply ?? 'Sin respuesta del modelo.';
}
