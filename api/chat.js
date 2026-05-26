import { buildSystemPrompt } from '../config/systemPrompt.js';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat';

function applyCorsHeaders(req, res) {
  const origin = req.headers.origin || '*';

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function createJsonResponse(res, statusCode, payload) {
  res.status(statusCode).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(payload));
}

function parseRequestBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
}

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return createJsonResponse(res, 405, {
      error: 'Metodo no permitido. Usa POST.',
    });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return createJsonResponse(res, 500, {
      error: 'La variable DEEPSEEK_API_KEY no esta configurada en Vercel.',
    });
  }

  const parsedBody = parseRequestBody(req.body);
  const messages = Array.isArray(parsedBody?.messages)
    ? parsedBody.messages
        .filter((message) => typeof message?.role === 'string' && typeof message?.content === 'string')
        .map(({ role, content }) => ({ role, content }))
    : [];

  if (!messages.length) {
    return createJsonResponse(res, 400, {
      error: 'Debes enviar al menos un mensaje en el historial.',
    });
  }

  const requestBody = {
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      ...messages,
    ],
    temperature: 0.4,
    max_tokens: 1024,
  };

  try {
    const providerResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responsePayload = await providerResponse.json().catch(() => ({}));

    if (!providerResponse.ok) {
      return createJsonResponse(res, providerResponse.status, {
        error: responsePayload?.error?.message || 'No fue posible obtener respuesta de DeepSeek.',
      });
    }

    return createJsonResponse(res, 200, {
      reply: responsePayload?.choices?.[0]?.message?.content ?? 'Sin respuesta del modelo.',
      provider: 'deepseek',
      model: DEFAULT_MODEL,
    });
  } catch (error) {
    return createJsonResponse(res, 502, {
      error: 'Error al conectar con DeepSeek.',
      details: error instanceof Error ? error.message : 'Fallo desconocido en el proveedor.',
    });
  }
}
