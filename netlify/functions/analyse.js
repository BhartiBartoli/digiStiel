const getMarket = require('./market');

// ── Airtable logging (fire-and-forget, non-blocking) ──────────────
// Never let an Airtable failure break the chat. All writes are guarded
// and diagnostic: we log the HTTP status + response body on success AND
// failure so the Function log shows whether a write actually landed.
const AIRTABLE_API = 'https://api.airtable.com/v0';

async function airtableRequest(method, path, bodyObj) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token  = process.env.AIRTABLE_TOKEN;
  if (!baseId || !token) {
    console.error('[airtable] missing AIRTABLE_BASE_ID or AIRTABLE_TOKEN — skipping log');
    return null;
  }

  const res = await fetch(`${AIRTABLE_API}/${baseId}/${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: bodyObj ? JSON.stringify(bodyObj) : undefined
  });

  const text = await res.text();
  // Diagnostic: always log status + body, success or failure.
  console.log(`[airtable] ${method} ${path} → ${res.status} ${text}`);
  if (!res.ok) {
    console.error(`[airtable] write FAILED ${method} ${path} → ${res.status} ${text}`);
  }

  try { return JSON.parse(text); } catch { return null; }
}

// Log one message record into the "Messages" table.
function logMessage({ sessionId, role, message, turnNumber }) {
  return airtableRequest('POST', 'Messages', {
    fields: {
      session_id: sessionId,
      role,
      message,
      timestamp: new Date().toISOString(),
      turn_number: turnNumber
    }
  });
}

// Upsert the "Conversations" row for this session_id (text-keyed, no
// linked records). Create on first turn, otherwise update updated_at +
// message_count.
async function upsertConversation({ sessionId, messageCount }) {
  const nowIso = new Date().toISOString();
  const formula = encodeURIComponent(`{session_id}='${sessionId}'`);
  const found = await airtableRequest(
    'GET',
    `Conversations?filterByFormula=${formula}&maxRecords=1`
  );

  const existing = found && found.records && found.records[0];
  if (existing) {
    return airtableRequest('PATCH', `Conversations/${existing.id}`, {
      fields: {
        updated_at: nowIso,
        message_count: messageCount,
        status: 'active'
      }
    });
  }

  return airtableRequest('POST', 'Conversations', {
    fields: {
      session_id: sessionId,
      started_at: nowIso,
      updated_at: nowIso,
      message_count: messageCount,
      status: 'active'
    }
  });
}

// Orchestrates all Airtable writes for one turn. Fully guarded.
async function logTurn({ sessionId, userMessage, assistantReply, history }) {
  const priorUserTurns = (history || []).filter((m) => m.role === 'user').length;
  const turnNumber = priorUserTurns + 1;
  // Two new messages added this turn → total after this turn.
  const messageCount = (history || []).length + 2;

  await logMessage({ sessionId, role: 'user', message: userMessage, turnNumber });
  await logMessage({ sessionId, role: 'assistant', message: assistantReply, turnNumber });
  await upsertConversation({ sessionId, messageCount });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API key missing' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  const { _system, _history, _message } = body;

  if (!_message) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No message' })
    };
  }

  // Session id: use the one the frontend sends, else generate one and
  // return it so the frontend can hold on to it for subsequent turns.
  const sessionId =
    body.session_id ||
    (globalThis.crypto && globalThis.crypto.randomUUID
      ? globalThis.crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  const model = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
  const market = getMarket();

  const messages = [
    ...(_history || []),
    { role: 'user', content: _message }
  ];

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 600,
        system: _system || '',
        messages
      })
    });

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: data })
      };
    }

    const text = data.content?.find((c) => c.type === 'text')?.text || '';

    // Await the Airtable writes so they actually complete (and log) before
    // the serverless function returns and is frozen. Wrapped in try/catch so
    // a logging failure can never block the chat response — the user always
    // gets their reply; only the logging fails, and it fails loudly.
    try {
      await logTurn({
        sessionId,
        userMessage: _message,
        assistantReply: text,
        history: _history
      });
    } catch (err) {
      console.error('[airtable] logTurn error:', err);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ reply: text, market: market.locale, session_id: sessionId })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
