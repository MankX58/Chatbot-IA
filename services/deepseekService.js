const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

/**
 * Envía un mensaje a la API de DeepSeek y retorna la respuesta del asistente.
 *
 * @param {string} apiKey  - API key de DeepSeek
 * @param {Array}  messages - Historial de mensajes [{role, content}, ...]
 * @param {string} systemPrompt - Prompt del sistema con guardrails y KB
 * @returns {Promise<string>} Respuesta del asistente
 */
export async function sendMessage(apiKey, messages, systemPrompt) {
    const body = {
        model: 'deepseek-chat',
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
        ],
        temperature: 0.4,
        max_tokens: 1024,
    };

    const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
            err?.error?.message || `Error ${response.status}: ${response.statusText}`
        );
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? 'Sin respuesta del modelo.';
}
