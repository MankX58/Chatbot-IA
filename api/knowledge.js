import { query } from './db.js';

function applyCorsHeaders(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function createJsonResponse(res, statusCode, payload) {
  res.status(statusCode).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(payload));
}

function parseRequestBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

async function ensureTableExists() {
  await query(`
    CREATE TABLE IF NOT EXISTS learned_kb (
        id SERIAL PRIMARY KEY,
        tema VARCHAR(255) NOT NULL,
        problema TEXT NOT NULL,
        solucion TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    await ensureTableExists();
  } catch (err) {
    console.error('Error al inicializar tabla learned_kb:', err);
    return createJsonResponse(res, 500, { error: 'Error al conectar con la base de datos.' });
  }

  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM learned_kb ORDER BY created_at DESC');
      const entries = result.rows.map((row) => ({
        id: row.id,
        tema: row.tema,
        problema: row.problema,
        solucion: row.solucion,
        createdAt: row.created_at,
      }));
      return createJsonResponse(res, 200, entries);
    } catch (error) {
      return createJsonResponse(res, 500, { error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = parseRequestBody(req.body);
      const { tema, problema, solucion } = body;

      if (!tema || !problema || !solucion) {
        return createJsonResponse(res, 400, {
          error: 'Faltan campos obligatorios: tema, problema o solucion.',
        });
      }

      await query(
        'INSERT INTO learned_kb (tema, problema, solucion) VALUES ($1, $2, $3)',
        [tema, problema, solucion]
      );

      return createJsonResponse(res, 200, { success: true });
    } catch (error) {
      return createJsonResponse(res, 500, { error: error.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return createJsonResponse(res, 405, { error: 'Método no permitido.' });
}
