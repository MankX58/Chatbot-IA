function applyCorsHeaders(req, res) {
  const origin = req.headers.origin || '*';

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function createJsonResponse(res, statusCode, payload) {
  res.status(statusCode).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(payload));
}

export default function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const apiConfigured = Boolean(process.env.DEEPSEEK_API_KEY);

  return createJsonResponse(res, 200, {
    ok: true,
    apiConfigured,
    provider: 'deepseek',
    timestamp: new Date().toISOString(),
  });
}
