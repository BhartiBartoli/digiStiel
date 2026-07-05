'use strict';
// Home ViewModel — proofs. Exit 0 = all pass. Screen-specific, read-only, no business-priority compute.
const assert = require('assert');
const P = require('../presentation');
const VM = require('../presentation/viewmodel');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log(`PASS ✅  ${name}`); pass++; }
  catch (e) { console.log(`FAIL ❌  ${name}\n        ${e && e.message}`); fail++; }
}

function setup() {
  const engine = P.loadSeedCustomer();
  const tree = P.projectWallet(P.makeReader(engine));
  const candidates = VM.seedDemoCandidates(tree);
  const provider = VM.makeStubAttentionProvider(candidates);
  return { engine, tree, candidates, provider };
}
function storeSnapshot(engine) {
  const s = engine.store;
  const dump = {};
  for (const coll of ['strategicIntents', 'strategicGoals', 'valuePlans', 'operationalGoals', 'valueIndicators']) {
    dump[coll] = [...s[coll].values()];
  }
  dump.ogViLinks = s.ogViLinks;
  return JSON.stringify(dump);
}

// ── 1: order follows candidate priority, not a ViewModel-computed ranking ──
check('1. Order follows DI candidate priority (swap priorities → order swaps)', () => {
  const { tree, candidates, provider } = setup();
  const gate = candidates.find((c) => c.signalType === 'gate-pending');
  const conf = candidates.find((c) => c.signalType === 'confirmation');
  const gateTitle = VM.buildHomeViewModel({ tree, provider }).cards[0].title;
  assert.ok(gateTitle.startsWith('je plan'), 'priority 1 (gate) shown first by default');
  // swap priorities in the stub: confirmation becomes most important
  gate.priority = 3; conf.priority = 1;
  const swapped = VM.buildHomeViewModel({ tree, provider });
  assert.strictEqual(swapped.cards[0].navRef.sourceId, conf.sourceRef.sourceId, 'order follows candidate priority, not own sort');
});

// ── 2: Top N (2-3) ──
check('2. Top N caps the shown cards, in DI order', () => {
  const { tree, provider } = setup();
  assert.strictEqual(VM.buildHomeViewModel({ tree, provider, topN: 2 }).cards.length, 2, 'topN=2 → 2 cards');
  assert.strictEqual(VM.buildHomeViewModel({ tree, provider, topN: 3 }).cards.length, 3, 'topN=3 → 3 cards');
});

// ── 3: title is customer language read FROM the Tree (not mapped by the ViewModel) ──
check('3. Title comes from the Canonical Presentation Tree node (not a ViewModel mapping)', () => {
  const engine = P.loadSeedCustomer();
  // Re-project with an override so the Tree label changes; the card title must follow the Tree.
  const tree = P.projectWallet(P.makeReader(engine), { labelOverrides: { StrategicGoal: 'jouw doelstelling' } });
  const provider = VM.makeStubAttentionProvider(VM.seedDemoCandidates(tree));
  const confCard = VM.buildHomeViewModel({ tree, provider }).cards.find((c) => c.title.includes('jouw doelstelling'));
  assert.ok(confCard, 'card title reflects the Tree override label — read from Tree, not self-mapped');
});

// ── 4: tone markers per signalType (default + M&S override without rebuild) ──
check('4. Tone markers per signalType: defaults work; overrides apply without rebuild', () => {
  assert.strictEqual(VM.resolveTone('gate-pending', 'normal'), 'geruststellend');
  assert.strictEqual(VM.resolveTone('attention', 'normal'), 'kalm');
  assert.strictEqual(VM.resolveTone('confirmation', 'normal'), 'warm');
  assert.strictEqual(VM.resolveTone('confirmation', 'normal', { confirmation: 'vierend' }), 'vierend', 'override honoured');
});

// ── 5: severity variant — read from candidate, not computed ──
check("5. 'attention' + severity 'severe' → directer tone marker (severity is read from candidate)", () => {
  assert.strictEqual(VM.resolveTone('attention', 'normal'), 'kalm', 'normal → kalm');
  assert.strictEqual(VM.resolveTone('attention', 'severe'), 'feitelijk', 'severe → directer, not alarmerend');
  const { tree, provider, candidates } = setup();
  const severe = candidates.find((c) => c.signalType === 'attention');
  assert.strictEqual(severe.severity, 'severe', 'severity is provided by the candidate (DI), not derived');
  const card = VM.buildHomeViewModel({ tree, provider }).cards.find((c) => c.tone === 'feitelijk');
  assert.ok(card, 'the severe attention candidate yields the severe tone marker');
});

// ── 6: read-only — no write API; store unchanged ──
check('6. Read-only: no write API in the ViewModel layer; store snapshot identical', () => {
  const WRITE = /save|update|create|put|link|write|persist|delete|mutat|insert|remove/i;
  const mods = {
    index: require('../presentation/viewmodel'),
    attentionProvider: require('../presentation/viewmodel/attentionProvider'),
    tone: require('../presentation/viewmodel/tone'),
    homeViewModel: require('../presentation/viewmodel/homeViewModel'),
  };
  for (const [m, mod] of Object.entries(mods)) {
    for (const key of Object.keys(mod)) assert.ok(!WRITE.test(key), `${m} exports write-like "${key}"`);
  }
  const { engine, tree, provider } = setup();
  const before = storeSnapshot(engine);
  VM.buildHomeViewModel({ tree, provider });
  assert.strictEqual(storeSnapshot(engine), before, 'building the ViewModel mutated nothing');
});

// ── 7: no re-interpretation — priority/severity passed through, nothing computed ──
check('7. No re-interpretation: no computed priority/severity/score/urgency in output', () => {
  const { tree, provider } = setup();
  const vm = VM.buildHomeViewModel({ tree, provider });
  const serialized = JSON.stringify(vm);
  for (const key of ['score', 'urgency', 'rank', 'ranking', 'computedPriority', 'severityScore', 'priorityScore', 'weight']) {
    assert.ok(!serialized.includes(`"${key}"`), `derived field "${key}" must not appear`);
  }
  // the candidate priority/severity are used as-is (order == priority order), never rewritten onto a new field
  const cards = vm.cards;
  assert.ok(cards.length >= 2 && cards[0].tone && cards[0].title, 'cards are pure presentation shape');
});

// ── 8: stub covers the three demo situations; a second provider plugs into the same interface ──
check('8. Stub covers gate-pending/attention/confirmation; interface is provider-agnostic', () => {
  const { candidates, tree } = setup();
  const kinds = candidates.map((c) => c.signalType).sort();
  assert.deepStrictEqual(kinds, ['attention', 'confirmation', 'gate-pending'], 'three demo situations covered');
  // a different provider object with the same getAttentionCandidates() is a drop-in replacement
  const altProvider = { getAttentionCandidates: () => [candidates[0]] };
  const vm = VM.buildHomeViewModel({ tree, provider: altProvider });
  assert.strictEqual(vm.cards.length, 1, 'the real DI provider plugs into the same interface without rebuild');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
