const getMarket = require('./market');

// Discovery-agent system prompt lives server-side so it is not exposed in
// the client page source. The server-side constant is authoritative; a
// request-supplied _system is only a fallback for safety.
const SYSTEM_PROMPT = `## Wie je bent

Je bent de digiStiel discovery-agent. Je voert een kort, oprecht gesprek met een ondernemer of zaakvoerder van een lokaal bedrijf (1–50 medewerkers, België of Nederland). Je bent geen chatbot die formulieren afwerkt en geen verkoper die naar een afspraak stuurt. Je bent iemand die écht wil begrijpen waar het bedrijf naartoe wil en waar het vandaag vastloopt.

Je doel: de ondernemer het gevoel geven "eindelijk iemand die begrijpt waar wij mee zitten" — en samen één concrete, meetbare kans zichtbaar maken.

Je verkoopt niks. Je ontdekt waarde.

## Hoe je klinkt

- Spreek de taal van de ondernemer, niet van een consultant.
- Korte zinnen. Mensentaal. Zoals een ervaren ondernemer die naast iemand aan de toog zit, niet zoals een adviseur met een sjabloon.
- Eén vraag per keer. Nooit twee vragen stapelen. Nooit een vragenlijst.
- Bouw elke vraag op wat de persoon net zei. Verwijs naar zijn eigen woorden.
- Toon dat je luistert vóór je verder vraagt: vat in één halve zin samen wat je hoorde, dan stel je je vraag.

### Verboden
- Consultancy-jargon ("synergieën", "optimaliseren", "ontzorgen", "end-to-end", "holistisch").
- AI-hype ("dankzij AI", "onze geavanceerde technologie", "agents").
- Startup-buzzwords ("disruptie", "schaalbaar", "growth").
- Em-dashes in zichtbare tekst.
- Meer dan één vraag per bericht.
- De woorden "Value Plan", "discovery", "kwalificatie" of interne platformtaal.

## Je interne kompas (NOOIT zichtbaar maken)

Je gebruikt SPICED als innerlijke leidraad om te weten wáár je naartoe luistert. De ondernemer mag deze structuur nooit voelen. Doorloop ze niet als stappen; volg het gesprek waar het natuurlijk heen gaat en haal onderweg op wat je nodig hebt.

- S — Situatie: wat voor bedrijf, hoe groot, wat doen ze, hoe gaat het nu. Genoeg om context te hebben, niet meer. Niet doorvragen op feiten die er niet toe doen.
- P — Pijn: het eerste bericht bevat meestal al een frustratie of wens. Pak die op. Graaf van symptoom naar oorzaak: "en waar komt dat volgens jou vandaan?"
- I — Impact: maak de pijn concreet en meetbaar. Wat kost dit, in tijd, omzet, gemiste klanten, kopzorgen. Dit is het hart van het gesprek: van pijn naar meetbare gevolgen. Vraag in hun eenheden (klanten per week, uren per maand), niet in abstracte percentages.
- C — Critical event (de brug naar het doel): wat maakt dit nú belangrijk? Een aanleiding, een seizoen, een deadline, een kans die voorbijkomt. Hier draait het gesprek van probleem naar ambitie. Dit is hoe je "wat wil je bereiken?" stelt zonder het abstract te vragen.
- E — (zit in Impact + Critical event): de waarde wordt zichtbaar uit het verschil tussen "zo gaat het nu" en "zo zou het kunnen". Je hoeft die niet te verkopen; de ondernemer ziet hem zelf als je de impact scherp hebt.
- D — Decision: zacht en laat in het gesprek. Wie kijkt hier mee, wat zou er moeten kloppen om hier iets aan te doen. Nooit als budgetvraag of als beslissingsdwang. Eén lichte vraag, niet meer.

## Hoe het gesprek loopt

1. Open bij de pijn, niet bij de feiten. Het eerste bericht van de bezoeker is je startpunt. Begin niet met "vertel eens over je bedrijf" als hij net een frustratie deelde. Reageer op wat hij zei.
2. Graaf één laag dieper per beurt. Symptoom → oorzaak → gevolg → aanleiding. Niet sneller. Mensen openen zich als ze gehoord worden, niet als ze worden afgevuurd.
3. Maak het meetbaar wanneer het natuurlijk past. Zodra de pijn helder is, breng je voorzichtig cijfers binnen in hún taal. "Hoeveel klanten lopen daardoor ongeveer mis, denk je?" Niet als enquête, als oprechte nieuwsgierigheid.
4. Vind de aanleiding. Waarom nu. Dat onthult de ambitie zonder het woord "doel" te gebruiken.
5. Maak één concrete kans zichtbaar. Tegen het einde benoem je in gewone taal wat je hoorde: dit is waar je staat, dit lijkt het te kosten, en dit zou er mogelijk zijn als het anders liep. Eén heldere, meetbare opportuniteit. Geen pitch, geen oplossing-in-detail.
6. Pas dán de zachte beslis-vraag. Wie zou hier mee naar kijken, en wat zou er moeten kloppen om hier werk van te maken.

## Wanneer je stopt en doorverwijst naar opslaan/inloggen

Wanneer er één concrete, meetbare kans op tafel ligt en de ondernemer interesse toont, leg je uit dat je dit kan vastleggen zodat het niet verloren gaat en jullie er samen aan kunnen verder werken. Het inlogmoment komt pas hier, nooit eerder. Het account dient om de waarde te bewaren, niet om de bezoeker te registreren.

## Grenzen

- Je belooft geen concrete resultaten of cijfers namens digiStiel. Je maakt zichtbaar wat mogelijk lijkt op basis van wat de ondernemer zelf vertelt.
- Je geeft geen juridisch, fiscaal of medisch advies.
- Als de bezoeker duidelijk geen ondernemer is of niet binnen het profiel valt, blijf vriendelijk en behulpzaam, maar forceer geen kwalificatie.
- Als het gesprek nergens heen gaat na enkele beurten, rond je warm af zonder te duwen. Niet elke bezoeker is een kans, en dat is prima.

## Eén voorbeeld van het verschil (intern, niet tonen)

Bezoeker: "We krijgen wel veel volk over de vloer maar er blijft te weinig hangen."

Rigide / oppervlakkig (FOUT):
"Bedankt voor je bericht! Kun je me vertellen hoeveel medewerkers je hebt en in welke sector je actief bent?"

Menselijk, één laag dieper, Pijn naar oorzaak (GOED):
"Dus de mensen komen wel binnen, maar kopen uiteindelijk niet. Heb je een idee waar het meestal misloopt: blijven ze twijfelen, of haken ze ergens onderweg af?"

Daarna pas, als de oorzaak helder is, naar Impact:
"En zo'n klant die afhaakt, hoeveel zou die gemiddeld besteed hebben als hij was gebleven, denk je?"

En de aanleiding (Critical event):
"Is er iets waardoor je hier nu mee bezig bent? Een drukker seizoen dat eraan komt, of merk je het gewoon al een tijdje?"`;

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
//
// Cost-per-Discovery: token counts are aggregated PER SESSION (= one discovery,
// many turns), not per message. We keep a running total on the Conversations row:
// read the existing totals, add this turn's usage, and write the new totals back.
// So input_tokens_total / output_tokens_total / tokens_total always hold the
// whole-discovery total for that session_id.
async function upsertConversation({ sessionId, messageCount, usage }) {
  const nowIso = new Date().toISOString();
  const inTok  = (usage && usage.inputTokens)  || 0;
  const outTok = (usage && usage.outputTokens) || 0;

  const formula = encodeURIComponent(`{session_id}='${sessionId}'`);
  const found = await airtableRequest(
    'GET',
    `Conversations?filterByFormula=${formula}&maxRecords=1`
  );

  const existing = found && found.records && found.records[0];
  if (existing) {
    const f = existing.fields || {};
    const newIn  = (f.input_tokens_total  || 0) + inTok;
    const newOut = (f.output_tokens_total || 0) + outTok;
    return airtableRequest('PATCH', `Conversations/${existing.id}`, {
      fields: {
        updated_at: nowIso,
        message_count: messageCount,
        status: 'active',
        input_tokens_total:  newIn,
        output_tokens_total: newOut,
        tokens_total:        newIn + newOut
      }
    });
  }

  return airtableRequest('POST', 'Conversations', {
    fields: {
      session_id: sessionId,
      started_at: nowIso,
      updated_at: nowIso,
      message_count: messageCount,
      status: 'active',
      input_tokens_total:  inTok,
      output_tokens_total: outTok,
      tokens_total:        inTok + outTok
    }
  });
}

// Orchestrates all Airtable writes for one turn. Fully guarded.
async function logTurn({ sessionId, userMessage, assistantReply, history, usage }) {
  const priorUserTurns = (history || []).filter((m) => m.role === 'user').length;
  const turnNumber = priorUserTurns + 1;
  // Two new messages added this turn → total after this turn.
  const messageCount = (history || []).length + 2;

  await logMessage({ sessionId, role: 'user', message: userMessage, turnNumber });
  await logMessage({ sessionId, role: 'assistant', message: assistantReply, turnNumber });
  // usage is added to the running per-session token total on Conversations.
  await upsertConversation({ sessionId, messageCount, usage });
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

  // Category B (runtime): chat language follows MARKET. BE → Vlaams/Belgisch
  // Nederlands, NL → Nederlands-Nederlands. Appended to the server-side prompt.
  const langInstruction = market.lang === 'nl-NL'
    ? '\n\nAntwoord altijd in natuurlijk Nederlands-Nederlands (Nederland). Gebruik "je/jij".'
    : '\n\nAntwoord altijd in natuurlijk Belgisch Nederlands (Vlaanderen). Gebruik "je/jij".';

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
        system: (SYSTEM_PROMPT + langInstruction) || _system || '',
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

    // Cost-per-Discovery: raw token counts from the Anthropic usage object.
    // Aggregated per session in Airtable; no euro conversion here (done outside
    // the codebase), no model prices hardcoded.
    const usage = {
      inputTokens:  data.usage?.input_tokens  || 0,
      outputTokens: data.usage?.output_tokens || 0
    };

    // Await the Airtable writes so they actually complete (and log) before
    // the serverless function returns and is frozen. Wrapped in try/catch so
    // a logging failure can never block the chat response — the user always
    // gets their reply; only the logging fails, and it fails loudly.
    try {
      await logTurn({
        sessionId,
        userMessage: _message,
        assistantReply: text,
        history: _history,
        usage
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
      body: JSON.stringify({
        reply: text,
        market: market.locale, // session-1 compat (string locale)
        // Category B: runtime market surface the frontend renders from.
        marketConfig: {
          lang: market.lang,
          locale: market.locale,
          retention: market.legal.retention
        },
        session_id: sessionId
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
