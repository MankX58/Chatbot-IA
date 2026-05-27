import { query } from './db.js';

function applyCorsHeaders(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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

// Auto-initialize table if it doesn't exist
async function ensureTableExists() {
  await query(`
    CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(100) PRIMARY KEY,
        owner_id VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        rating INTEGER,
        last_confidence JSONB,
        breadcrumb VARCHAR(255),
        preview TEXT,
        messages JSONB DEFAULT '[]'::jsonb,
        support_responses JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  // Add columns if they do not exist
  await query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);`);
  await query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);`);
  await query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS priority VARCHAR(50);`);
  await query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS escalation_context TEXT;`);
}

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    await ensureTableExists();
  } catch (err) {
    console.error('Error al inicializar tabla de tickets:', err);
    return createJsonResponse(res, 500, { error: 'Error al conectar con la base de datos.' });
  }

  if (req.method === 'GET') {
    try {
      const { ownerId } = req.query || {};
      let result;
      if (ownerId) {
        result = await query('SELECT * FROM tickets WHERE owner_id = $1 ORDER BY updated_at DESC', [ownerId]);
      } else {
        result = await query('SELECT * FROM tickets ORDER BY updated_at DESC');
      }
      const tickets = result.rows.map((row) => ({
        id: row.id,
        ownerId: row.owner_id,
        ownerName: row.owner_name,
        ownerEmail: row.owner_email,
        status: row.status,
        rating: row.rating,
        lastConfidence: row.last_confidence,
        breadcrumb: row.breadcrumb,
        preview: row.preview,
        messages: row.messages,
        supportResponses: row.support_responses,
        priority: row.priority,
        escalationContext: row.escalation_context,
        date: row.created_at,
        updatedAt: row.updated_at,
      }));
      return createJsonResponse(res, 200, tickets);
    } catch (error) {
      return createJsonResponse(res, 500, { error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = parseRequestBody(req.body);
      const {
        id,
        ownerId,
        ownerName,
        ownerEmail,
        status,
        rating,
        lastConfidence,
        breadcrumb,
        preview,
        messages,
        supportResponses,
        priority,
        escalationContext,
      } = body;

      if (!id) {
        return createJsonResponse(res, 400, { error: 'Falta el campo id.' });
      }

      await query(
        `INSERT INTO tickets (id, owner_id, owner_name, owner_email, status, rating, last_confidence, breadcrumb, preview, messages, support_responses, priority, escalation_context, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           owner_name = COALESCE(EXCLUDED.owner_name, tickets.owner_name),
           owner_email = COALESCE(EXCLUDED.owner_email, tickets.owner_email),
           status = EXCLUDED.status,
           rating = EXCLUDED.rating,
           last_confidence = EXCLUDED.last_confidence,
           breadcrumb = EXCLUDED.breadcrumb,
           preview = EXCLUDED.preview,
           messages = EXCLUDED.messages,
           support_responses = EXCLUDED.support_responses,
           priority = COALESCE(EXCLUDED.priority, tickets.priority),
           escalation_context = COALESCE(EXCLUDED.escalation_context, tickets.escalation_context),
           updated_at = CURRENT_TIMESTAMP`,
        [
          id,
          ownerId || 'anon',
          ownerName || null,
          ownerEmail || null,
          status || 'ESCALADO',
          rating || null,
          lastConfidence ? JSON.stringify(lastConfidence) : null,
          breadcrumb || null,
          preview || null,
          messages ? JSON.stringify(messages) : '[]',
          supportResponses ? JSON.stringify(supportResponses) : '[]',
          priority || null,
          escalationContext || null,
        ]
      );

      return createJsonResponse(res, 200, { success: true });
    } catch (error) {
      return createJsonResponse(res, 500, { error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { ownerId, ticketId } = req.query || {};
      if (ticketId) {
        await query('DELETE FROM tickets WHERE id = $1', [ticketId]);
      } else if (ownerId) {
        await query('DELETE FROM tickets WHERE owner_id = $1', [ownerId]);
      } else {
        return createJsonResponse(res, 400, { error: 'Falta ownerId o ticketId.' });
      }
      return createJsonResponse(res, 200, { success: true });
    } catch (error) {
      return createJsonResponse(res, 500, { error: error.message });
    }
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return createJsonResponse(res, 405, { error: 'Método no permitido.' });
}
