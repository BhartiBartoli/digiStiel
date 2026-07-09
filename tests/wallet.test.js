'use strict';
// Wallet UI data snapshot — proofs over scripts/build-wallet.js (the build-time ViewModel snapshot the
// static UI consumes). The UI renders this read-only; these proofs guard that it computes nothing and
// that every number traces back to the frozen data layer. Exit 0 = all pass.
const assert = require('assert');
const P = require('../presentation');
const { buildWalletData, buildWalletBundle } = require('../scripts/build-wallet');
const { loadSeedCustomer, vanDijckAttentionCandidates } = require('../presentation/seedCustomer');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log(`PASS ✅  ${name}`); pass++; }
  catch (e) { console.log(`FAIL ❌  ${name}\n        ${e && e.message}`); fail++; }
}

// ── 1: Home shows the scenarios with the right tone-mapping + computed titles ──
check('1. Home cards carry computed titles + tone (mapped to semantic colour by the UI)', () => {
  const d = buildWalletData();
  assert.ok(d.home.cards.length >= 2 && d.home.cards.length <= 3, 'Top-N cap (2-3) honoured');
  const toneToSignal = { geruststellend: 'gate-pending', warm: 'confirmation', kalm: 'attention', feitelijk: 'attention' };
  for (const c of d.home.cards) {
    assert.ok(c.title.startsWith('je plan') || c.title.startsWith('je doel'), 'customer-language title');
    assert.strictEqual(toneToSignal[c.tone], c.signalType, 'tone matches signalType');
  }
  // computed plan-title present (not a bare "je plan")
  assert.ok(d.home.cards.some((c) => c.title.includes('Bekend worden in een grotere regio')), 'computed plan title present');
});

// ── 2: order comes from the ViewModel (DI priority); one gate at top; UI does not re-order/filter ──
check('2. Order = ViewModel DI order; exactly one gate at the top', () => {
  const d = buildWalletData();
  assert.strictEqual(d.home.cards[0].signalType, 'gate-pending', 'priority-1 gate first');
  assert.strictEqual(d.home.cards.filter((c) => c.signalType === 'gate-pending').length, 1, 'one gate within the cap');
  // the snapshot order equals the ViewModel order (no UI re-ordering)
  const VM = require('../presentation/viewmodel');
  const engine = loadSeedCustomer();
  const tree = P.projectWallet(P.makeReader(engine));
  const vm = VM.buildHomeViewModel({ tree, provider: VM.makeStubAttentionProvider(vanDijckAttentionCandidates(engine)),
    planTitles: require('../presentation/seedCustomer').vanDijckPlanTitles(engine) });
  assert.deepStrictEqual(d.home.cards.map((c) => c.title), vm.cards.map((c) => c.title), 'snapshot order == ViewModel order');
});

// ── 3: the success scenario has a working Executive Summary (the doorklik target) ──
check('3. Every Home scenario has a working Executive Summary (doorklik works for all)', () => {
  const d = buildWalletData();
  const success = d.home.cards.find((c) => c.signalType === 'confirmation');
  assert.ok(success && success.hasSummary, 'confirmation (success) card has a summary');
  assert.ok(d.executiveSummaries[success.sourceId], 'executive summary present for the success source');
  // Every shown card now routes to a working summary (this step wired all four scenarios).
  for (const c of d.home.cards) {
    assert.strictEqual(c.hasSummary, true, `card "${c.title}" routes to a working Executive Summary`);
    assert.ok(d.executiveSummaries[c.sourceId], `summary present for "${c.title}"`);
  }
});

// ── 4: Understanding → Explanation → Measurement present and structured ──
check('4. Executive Summary is Understanding → Explanation → Measurement', () => {
  const d = buildWalletData();
  const s = Object.values(d.executiveSummaries)[0];
  assert.ok(typeof s.understanding === 'string' && s.understanding.length > 0, 'understanding sentence');
  const kinds = s.reasons.map((r) => r.kind).sort();
  assert.deepStrictEqual(kinds, ['opportunity', 'strength'], 'two reasons: opportunity + strength');
  assert.strictEqual(s.metrics.length, 2, 'two metric cards');
});

// ── 5: every measurement number traces to the Tree/engine — NOT hardcoded ──
check('5. measurableValue + target come from the Tree (no hardcoded numbers)', () => {
  const { data: d, tree } = buildWalletBundle(); // same load → ids match
  const sid = Object.keys(d.executiveSummaries)[0];
  // find the goal node in the tree
  let goal = null;
  for (const g of tree.intents[0].goals) if (g.sourceId === sid) goal = g;
  assert.ok(goal, 'summary source is a goal in the Tree');
  const metrics = d.executiveSummaries[sid].metrics;
  const target = metrics.find((m) => m.label === 'Je jaardoel');
  assert.strictEqual(target.value, goal.target.value, 'target value == goal.target in the Tree');
  const current = metrics.find((m) => m.label === 'Waar je nu staat');
  // the "current" number must equal a computed measurableValue EUR of one of the goal's plans
  const treeEurs = goal.plans.map((p) => p.measurableValue.perUnit.EUR).filter((v) => v !== undefined);
  assert.ok(treeEurs.includes(current.value), 'current value == a computed measurableValue EUR from the Tree');
  assert.ok(current.reassurance.includes('berekend uit je eigen resultaten'), 'measurement reassurance present');
});

// ── 6: demo flag present (badge renders on both screens) ──
check('6. Demo flag present in the data (UI renders the demo badge)', () => {
  const d = buildWalletData();
  assert.strictEqual(d.demo, true, 'demo flag true');
  assert.strictEqual(d.customer, 'Van Dijck Wonen', 'customer name present');
});

// ── 7: static UI is light-mode only (no dark-mode code) ──
check('7. wallet.html is light-mode only (no dark-mode toggle/query)', () => {
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'wallet.html'), 'utf8');
  assert.ok(!/prefers-color-scheme:\s*dark/.test(html), 'no dark media query');
  assert.ok(!/data-theme/.test(html), 'no theme toggle');
});

// ── 8: UI does no computation/write — it only fetches + renders the snapshot ──
check('8. wallet.html consumes read-only: no engine/require of the data layer, no math on numbers', () => {
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'wallet.html'), 'utf8');
  assert.ok(/fetch\('wallet-data\.json'/.test(html), 'UI fetches the ViewModel snapshot');
  assert.ok(!/require\(|measurableValue|projectWallet|buildHomeViewModel/.test(html), 'UI does not touch the data layer directly');
});

// ── 9: semantic colours use the M&S-canonical MUTED tokens; --error defined, not applied ──
check('9. Card rails use M&S muted tokens (no bright #1E9E63/#C77D11); --error inert', () => {
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'wallet.html'), 'utf8');
  assert.ok(html.includes('--success:#2E8B6F'), 'muted teal-green success token');
  assert.ok(html.includes('--warning:#C08A2E'), 'muted amber warning token');
  assert.ok(!html.includes('#1E9E63') && !html.includes('#C77D11'), 'old bright values removed');
  // rails reference the tokens (not hardcoded hex)
  assert.ok(/\.card--success\{--tone:var\(--success\)/.test(html), 'success rail via token');
  assert.ok(/\.card--warning\{--tone:var\(--warning\)/.test(html), 'warning rail via token');
  // --error is DEFINED but NOT applied anywhere (Reserve, Don't Activate)
  assert.ok(html.includes('--error:#B0453C'), '--error token defined');
  assert.ok(!/var\(--error\)/.test(html), '--error not applied by any rule');
  assert.ok(!/card--error/.test(html), 'no severe/error card class');
});

// ── 10: Conversation-Centric Workspace shell (skelet-stap A) — structure only ──
check('10. Three-region shell: LEFT/RIGHT empty placeholders, CENTER (#view) + render/routing intact', () => {
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'wallet.html'), 'utf8');
  // three regions exist as structure
  assert.ok(/class="workspace"/.test(html), 'workspace grid present');
  assert.ok(/region region-left/.test(html) && /region region-right/.test(html), 'LEFT + RIGHT regions present');
  assert.ok(/<main id="view"/.test(html), 'CENTER #view preserved');
  // No step-C content yet (conversation / bubbles / context cards) and no chat-language nav.
  // (Step-B nav labels ARE present from wallet-workspace-skelet-b — asserted in proof 11.)
  for (const forbidden of ['Gesprek', 'context-card', 'message-bubble', 'sparring']) {
    assert.ok(!html.includes(forbidden), `no step-C/chat content yet: "${forbidden}"`);
  }
  // CENTER render + routing untouched
  for (const keep of ['function renderHome', 'function renderSummary', 'function renderSoon', "fetch('wallet-data.json'"]) {
    assert.ok(html.includes(keep), `interim render/routing intact: ${keep}`);
  }
  // light-mode only, demo badge present, no dark-mode drift
  assert.ok(!/prefers-color-scheme:\s*dark/.test(html) && !/data-theme/.test(html), 'light-mode only');
  assert.ok(/id="demoBadge"/.test(html), 'demo badge present');
  // demo-badge token drift fixed (no dangling --warning-dim, no old-amber rgba)
  assert.ok(!/var\(--warning-dim\)/.test(html), 'no dangling --warning-dim token');
  assert.ok(!/199,\s*125,\s*17/.test(html), 'no pre-muted amber rgba (old #C77D11)');
});

// ── 11: LEFT-nav (skelet-stap B) — labels + "Vandaag" active + VISUAL SELECTION ONLY ──
check('11. LEFT-nav: exact M&S labels, "Vandaag" active, visual-selection only (no routing)', () => {
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'wallet.html'), 'utf8');
  // the five exact labels, with "Mijn"
  for (const label of ['Vandaag', 'Mijn doelen', 'Mijn plannen', 'Mijn resultaten', 'Mijn beslissingen']) {
    assert.ok(html.includes('>' + label + '</button>'), `nav label present: ${label}`);
  }
  assert.ok(!html.includes('Documenten'), 'no Documenten (no documents view exists)');
  // nav items are buttons, not links (they do not navigate)
  const navBlock = html.slice(html.indexOf('<nav class="nav"'), html.indexOf('</nav>'));
  assert.ok(!/<a\s/.test(navBlock), 'no <a href> in the nav — buttons only');
  assert.ok(/type="button"/.test(navBlock), 'nav items are type=button');
  // "Vandaag" active on load
  assert.ok(/<button type="button" class="nav-item active" aria-current="true">Vandaag<\/button>/.test(html), '"Vandaag" active at load');
  // VISUAL SELECTION ONLY: the nav handler script touches no routing/render/#view
  const navScript = html.slice(html.indexOf('// LEFT-nav — skelet-stap B'), html.lastIndexOf('</script>'));
  for (const forbidden of ['location.hash', 'route(', 'renderHome', 'renderSummary', 'renderSoon', 'getElementById(\'view\')', '#view']) {
    assert.ok(!navScript.includes(forbidden), `nav handler must not touch routing/render: "${forbidden}"`);
  }
  assert.ok(/classList\.add\('active'\)/.test(navScript) && /classList\.remove\('active'\)/.test(navScript), 'nav handler only toggles the active class');
  // region-right still the Context placeholder (no step-C content)
  assert.ok(/region region-right[^]*?region-cap">Context/.test(html), 'RIGHT stays the Context placeholder');
});

// ── 12: all four scenarios have a working Executive Summary; copy literal; measurement from the Tree ──
check('12. Four Executive Summaries: literal M&S copy, U→E→M, numbers from the Tree (not hardcoded)', () => {
  const { data: d, tree } = buildWalletBundle();
  const summaries = d.executiveSummaries;
  assert.strictEqual(Object.keys(summaries).length, 4, 'four executive summaries (all scenarios)');
  // every Home card that is shown routes to a working summary
  for (const c of d.home.cards) assert.strictEqual(c.hasSummary, true, `card "${c.title}" has a summary`);

  // exact M&S sentences present (verbatim, no reformulation)
  const literal = [
    'Je bestaande klanten kopen de laatste weken wat minder online dan gewoonlijk. Nog geen groot verschil, maar het is het bekijken waard nu het net begint.',
    'Er ligt een plan voor je klaar om buiten je eigen buurt bekend te worden. Voor er iets start, kijk jij het eerst na — jij beslist of we ermee verdergaan.',
    'Je nieuwe interieur-projectendienst staat klaar om te beginnen. Er is nog weinig gebeurd — dit is het prille begin, en dat is precies zoals het hoort op dit punt.',
    'Wat je in je eigen buurt hebt opgebouwd — je naam, je aanpak — werkt daar al. Datzelfde kun je nu breder inzetten.',
    'Je hebt al een trouw klantenbestand en een gevestigde naam — een sterke basis om iets nieuws op te bouwen zonder bij nul te beginnen.',
  ];
  const blob = JSON.stringify(summaries);
  for (const s of literal) assert.ok(blob.includes(s), 'verbatim M&S copy present');

  // find a tree node by sourceId
  const nodeById = (id) => {
    let hit = null;
    const visit = (n) => { if (!n || hit) return; if (n.sourceId === id) { hit = n; return; }
      for (const c of [...(n.goals||[]), ...(n.plans||[]), ...(n.operationalGoals||[]), ...(n.results||[])]) visit(c); };
    for (const it of tree.intents) visit(it);
    return hit;
  };

  for (const [sid, s] of Object.entries(summaries)) {
    // U → E → M structure
    assert.ok(typeof s.understanding === 'string' && s.understanding.length > 0, 'understanding present');
    const kinds = s.reasons.map((r) => r.kind).sort();
    assert.deepStrictEqual(kinds, ['opportunity', 'strength'], 'two reasons: opportunity(amber) + strength(green)');
    assert.ok(s.metrics.length >= 1, 'at least one measurement');
    // predicted-percentage guard: no "%" inside the NARRATIVE text (understanding + reasons)
    const narrative = s.understanding + ' ' + s.reasons.map((r) => r.text).join(' ');
    assert.ok(!narrative.includes('%'), 'no percentage sharpened into the narrative copy');
    // every measurement number traces to the Tree (goal target/plan perUnit) — not hardcoded
    const node = nodeById(sid);
    for (const m of s.metrics) {
      if (m.value === null) continue;
      let fromTree;
      if (m.label === 'Je jaardoel') fromTree = node.target.value;                       // goal target
      else if (node.measurableValue) fromTree = node.measurableValue.perUnit[m.unit];     // plan own perUnit
      else fromTree = (node.plans || []).map((p) => p.measurableValue.perUnit[m.unit]).find((v) => v !== undefined); // goal via plan
      assert.strictEqual(m.value, fromTree, `metric "${m.label}" value comes from the Tree`);
    }
  }
});

// ── 13: CENTER conversation (skelet-stap C) — fixed copy, two build rules, no sender label ──
check('13. Conversation: fixed openers + topic-independent connectors; opener promises nothing; no sender label', () => {
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'wallet.html'), 'utf8');
  for (const opener of [
    'Dit is een van je doelen. Laten we samen kijken waar je staat en wat er speelt.',
    'Dit is een van je plannen. Ik loop met je door waar het over gaat en hoe het ervoor staat.',
    'Dit is een van je resultaten. Laten we bekijken wat het je vertelt.',
  ]) assert.ok(html.includes(opener), 'exact opener present');
  assert.ok(!/ik zoek (uit|op)/i.test(html), 'no "ik zoek uit" generation promise');
  assert.ok(/var CONNECTOR_WHY = 'Zal ik uitleggen waarom\?';/.test(html), 'connector 1 is a fixed literal');
  assert.ok(/var CONNECTOR_NUMBERS = 'Wil je de cijfers erbij zien\?';/.test(html), 'connector 2 is a fixed literal');
  assert.ok(!/Zal ik uitleggen waarom[^']*\$\{/.test(html) && !/cijfers erbij zien[^']*\$\{/.test(html), 'connectors are not subject-specific');
  assert.ok(!html.includes('digiStiel:') && !/>\s*AI\s*:/.test(html), 'no "digiStiel:"/"AI:" sender label');
  for (const field of ['s.understanding', 's.reasons', 's.metrics', 's.objectType', 's.context']) {
    assert.ok(html.includes(field), `conversation reads existing field ${field}`);
  }
});

// ── 14: RIGHT context = read-only Tree neighbours; objectType from sourceType; reasons strength→kans ──
check('14. RIGHT context is Tree neighbours; objectType present; all reasons strength→opportunity', () => {
  const { data: d, tree } = buildWalletBundle();
  const treeNames = new Set();
  const { vanDijckPlanTitles } = require('../presentation/seedCustomer');
  const planTitles = vanDijckPlanTitles(loadSeedCustomer());
  for (const it of tree.intents) for (const g of it.goals) {
    treeNames.add(g.name);
    for (const p of g.plans) for (const og of p.operationalGoals) for (const r of og.results) treeNames.add(r.name);
  }
  Object.values(planTitles).forEach((t) => treeNames.add(t));

  const CONTEXT_LABELS = new Set(['Je plannen bij dit doel', 'Wat dit doel meet', 'Dit plan hoort bij je doel', 'De resultaten die het beweegt', 'Dit resultaat telt mee voor']);
  for (const s of Object.values(d.executiveSummaries)) {
    assert.ok(['goal', 'plan', 'result'].includes(s.objectType), 'objectType from sourceType');
    assert.strictEqual(s.reasons[0].kind, 'strength', 'first reason is strength (green)');
    assert.strictEqual(s.reasons[1].kind, 'opportunity', 'second reason is opportunity (amber)');
    assert.ok(Array.isArray(s.context) && s.context.length >= 1, 'context present');
    for (const grp of s.context) {
      assert.ok(CONTEXT_LABELS.has(grp.label), `fixed M&S context label: ${grp.label}`);
      for (const item of grp.items) assert.ok(treeNames.has(item), `context item "${item}" is a real Tree neighbour`);
    }
  }
});

// ── 15: Value Story layer — literal seed narrative (temporary Narrative Provider), plan-only; goal inert ──
check('15. Value Story: literal seed narrative surfaced for plans, goal inert; Narrative-Provider rule in code + README', () => {
  const { data: d, engine } = buildWalletBundle();
  const { vanDijckValueStory } = require('../presentation/seedCustomer');
  const story = vanDijckValueStory(engine); // SAME engine as the bundle (ids are minted per load)

  // valueStory present+literal for every plan summary, null for the goal (goal layer inert)
  for (const [sid, s] of Object.entries(d.executiveSummaries)) {
    if (s.objectType === 'plan') {
      assert.ok(typeof s.valueStory === 'string' && s.valueStory.length > 0, `plan "${s.title}" has a Value Story`);
      // rendered LITERALLY — byte-identical to the seed Narrative Provider (no composition/parafrase)
      assert.strictEqual(s.valueStory, story[sid], `Value Story for "${s.title}" is the literal seed string`);
    } else {
      assert.strictEqual(s.valueStory, null, `non-plan "${s.title}" surfaces no Value Story (inert)`);
    }
  }

  // the four delivered strings are present verbatim in the seed
  const blob = JSON.stringify(story);
  for (const frag of [
    'Je bestaande klanten zijn de stevigste basis onder je groei',
    'In je eigen buurt zit je tegen je plafond',
    'Alles wat je nu doet — je winkel, je webshop, je klanten die terugkomen',
    'Dit is nog een klein begin, maar het hoort bij een grotere gedachte',
  ]) assert.ok(blob.includes(frag), 'delivered Value Story string present verbatim');

  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'wallet.html'), 'utf8');
  // connector is a plain literal, not subject-specific (no interpolation / +sourceId)
  assert.ok(/var CONNECTOR_STORY = 'Wil je zien hoe dit past in het grotere geheel\?';/.test(html), 'story connector is a fixed literal');
  assert.ok(!/grotere geheel[^']*\$\{/.test(html) && !/CONNECTOR_STORY[^;]*\+\s*sourceId/.test(html), 'story connector carries no interpolation/+sourceId');
  // the layer renders the seed string LITERALLY (dereference, no composition)
  assert.ok(html.includes("partnerInto(shell.conv, 'bubble--story', s.valueStory)"), 'Value Story rendered from s.valueStory directly');
  // the duplicate "Bekijk wat er precies loopt" exit is gone — the chain is entered via the prompt
  assert.ok(!html.includes('Bekijk wat er precies loopt'), 'duplicate story exit removed (single entry via prompt)');
  assert.ok(html.includes("location.hash = '#soon/story/' + sourceId"), 'story reached via the disclosure prompt');
  // Narrative-Provider architecture rule present in CODE and README (verbatim key sentence)
  const rule = 'The seed is a temporary Narrative Provider used to validate the Presentation architecture';
  const seedSrc = require('fs').readFileSync(require('path').join(__dirname, '..', 'presentation', 'seedCustomer.js'), 'utf8');
  const readme = require('fs').readFileSync(require('path').join(__dirname, '..', 'presentation', 'README.md'), 'utf8');
  assert.ok(seedSrc.includes(rule), 'Narrative-Provider rule documented in code');
  assert.ok(readme.includes(rule), 'Narrative-Provider rule documented in README');
});

// ── 16: Operational Detail layer — Operational-Goal nodes DIRECT from the Tree (no second mapping) ──
check('16. Operational Detail: OG nodes read direct from the Tree, plan-only; fixed intro; connector literal', () => {
  const { data: d, tree } = buildWalletBundle();
  const planOGnames = (planId) => {
    let hit = null;
    const visit = (n) => { if (!n || hit) return; if (n.sourceId === planId) { hit = n; return; }
      for (const c of [...(n.goals||[]), ...(n.plans||[]), ...(n.operationalGoals||[]), ...(n.results||[])]) visit(c); };
    for (const it of tree.intents) visit(it);
    return (hit.operationalGoals || []).map((og) => og.name);
  };
  for (const [sid, s] of Object.entries(d.executiveSummaries)) {
    if (s.objectType === 'plan') {
      assert.ok(Array.isArray(s.operationalDetail) && s.operationalDetail.length >= 1, `plan "${s.title}" has Operational Detail`);
      // items are the Tree OG nodes DIRECT — byte-identical, same order (dereference, no mapping/computation)
      assert.deepStrictEqual(s.operationalDetail, planOGnames(sid), `Operational Detail for "${s.title}" == Tree OG names`);
    } else {
      assert.strictEqual(s.operationalDetail, null, `non-plan "${s.title}" surfaces no Operational Detail (inert)`);
    }
  }

  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'wallet.html'), 'utf8');
  // fixed intro + connector are plain literals (no interpolation)
  assert.ok(/var DETAIL_INTRO = 'Dit is wat er concreet loopt om daar te komen:';/.test(html), 'detail intro is the exact fixed literal');
  assert.ok(/var CONNECTOR_DETAIL = 'Zal ik laten zien wat er concreet loopt\?';/.test(html), 'detail connector is a fixed literal');
  assert.ok(!/concreet loopt[^']*\$\{/.test(html), 'detail copy carries no interpolation');
  // the render reads the snapshot list DIRECT — no customer-language map/resolveLabel in this layer
  const detailFn = html.slice(html.indexOf('function renderDetail('), html.indexOf('function renderSoonPlaceholder('));
  assert.ok(detailFn.includes('s.operationalDetail.forEach'), 'Operational Detail rendered from s.operationalDetail directly');
  for (const forbidden of ['resolveLabel', 'customerLanguage', 'projectOperationalGoal', 'customerLang']) {
    assert.ok(!detailFn.includes(forbidden), `no second customer-language mapping in Operational Detail: "${forbidden}"`);
  }
  // build-wallet reads og.name directly, not through a mapping layer
  const bw = require('fs').readFileSync(require('path').join(__dirname, '..', 'scripts', 'build-wallet.js'), 'utf8');
  assert.ok(/operationalDetail:[^;]*\.map\(\(og\) => og\.name\)/.test(bw), 'build-wallet dereferences og.name directly');
});

// ── 17: Evidence layer — customer-language VALUES only; no mechanic/channel leak (build rule 3) ──
check('17. Evidence: Value-Indicator values from the Tree; no indicatorType/supportedBy/aggregation/channel; new intro', () => {
  const { data: d, tree } = buildWalletBundle();
  const nodeById = (id) => { let hit = null;
    const visit = (n) => { if (!n || hit) return; if (n.sourceId === id) { hit = n; return; }
      for (const c of [...(n.goals||[]), ...(n.plans||[]), ...(n.operationalGoals||[]), ...(n.results||[])]) visit(c); };
    for (const it of tree.intents) visit(it); return hit; };
  // Expected evidence rebuilt straight from the Tree plan node (dedup on sourceId) — dereference, no compute.
  const expectedEvidence = (planId) => {
    const seen = new Set(); const out = [];
    for (const og of nodeById(planId).operationalGoals || []) for (const r of og.results || []) {
      if (seen.has(r.sourceId)) continue; seen.add(r.sourceId);
      out.push({ label: r.label, name: r.name, value: r.value, unit: r.unit });
    }
    return out;
  };

  for (const [sid, s] of Object.entries(d.executiveSummaries)) {
    if (s.objectType === 'plan') {
      assert.ok(Array.isArray(s.evidence) && s.evidence.length >= 1, `plan "${s.title}" has Evidence`);
      // value-only shape + label; exact match to the Tree indicators (dedup, order, value, unit)
      for (const e of s.evidence) {
        assert.deepStrictEqual(Object.keys(e).sort(), ['label', 'name', 'unit', 'value'], 'evidence item is value-only');
        assert.strictEqual(e.label, 'je resultaat', 'projected customer-language label');
      }
      assert.deepStrictEqual(s.evidence, expectedEvidence(sid), `Evidence for "${s.title}" == Tree indicators (dereferenced, dedup)`);
    } else {
      assert.strictEqual(s.evidence, null, `non-plan "${s.title}" surfaces no Evidence (inert)`);
    }
  }

  // no mechanic/channel term anywhere in the Evidence output
  const evBlob = JSON.stringify(Object.values(d.executiveSummaries).map((s) => s.evidence));
  for (const term of ['indicatorType', 'supportedBy', 'aggregat', 'substrate', 'lagging', 'leading',
    'ERP', 'SEO', 'TikTok', 'affiliate', 'Meta ads', 'Google ads', ' ads']) {
    assert.ok(!evBlob.includes(term), `Evidence must not leak mechanic/channel: "${term}"`);
  }

  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'wallet.html'), 'utf8');
  assert.ok(/var EVIDENCE_INTRO = 'Dit steunt op je eigen resultaten:';/.test(html), 'evidence intro is the exact NEW literal (not the old memory-MD string)');
  assert.ok(/var CONNECTOR_EVIDENCE = 'Wil je weten waarop dit steunt\?';/.test(html), 'evidence connector is a fixed literal');
  const evFn = html.slice(html.indexOf('function renderEvidence('), html.indexOf('function renderSoon('));
  assert.ok(evFn.includes('s.evidence.forEach'), 'Evidence rendered from s.evidence directly');
  for (const forbidden of ['indicatorType', 'supportedBy', 'substrate', 'aggregat', 'resolveLabel', 'customerLanguage']) {
    assert.ok(!evFn.includes(forbidden), `Evidence render must not touch mechanic/mapping: "${forbidden}"`);
  }
  // structural guard: the Projection never exposes the mechanic on indicator nodes
  const proj = require('fs').readFileSync(require('path').join(__dirname, '..', 'presentation', 'projection.js'), 'utf8');
  const projInd = proj.slice(proj.indexOf('projectIndicator'), proj.indexOf('projectIndicator') + 260);
  assert.ok(!/indicatorType|supportedBy/.test(projInd), 'projectIndicator does not project indicatorType/supportedBy');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
