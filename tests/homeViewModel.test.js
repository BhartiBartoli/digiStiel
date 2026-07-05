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
check('7. No re-interpretation: no computed priority/severity/score/urgency; generic contract shape', () => {
  const { tree, candidates, provider } = setup();
  const candidatesBefore = JSON.stringify(candidates);
  const vm = VM.buildHomeViewModel({ tree, provider });
  const serialized = JSON.stringify(vm);
  for (const key of ['score', 'urgency', 'rank', 'ranking', 'computedPriority', 'severityScore', 'priorityScore', 'weight']) {
    assert.ok(!serialized.includes(`"${key}"`), `derived field "${key}" must not appear`);
  }
  // priority & severity immutable: no modify/normalize/rescale/recompute — the input candidates are unchanged
  assert.strictEqual(JSON.stringify(provider.getAttentionCandidates()), candidatesBefore, 'candidates passed through immutably');
  // card is pure presentation shape: title + refinable summaryTemplate + tone + GENERIC navRef
  const card = vm.cards[0];
  assert.ok(card.title && card.tone, 'title + tone present');
  assert.ok('summaryTemplate' in card && !('summary' in card), 'summaryTemplate (refinable), not a fixed summary');
  assert.deepStrictEqual(Object.keys(card.navRef).sort(), ['destination', 'sourceId'], 'navRef is generic { sourceId, destination }');
  assert.ok(!serialized.includes('"target"'), 'no hardcoded screen-name key in the navigation contract');
});

// ── 9: orderPreference tiebreaks ONLY within equal DI priority; never overrides DI order ──
check('9. orderPreference sorts only between equal-priority candidates (never overrides DI order)', () => {
  const { tree } = setup();
  // Two candidates with DIFFERENT DI priority: preference must NOT reorder them.
  const diff = [
    { sourceRef: { sourceId: tree.intents[0].goals[0].sourceId }, signalType: 'confirmation', priority: 1, severity: 'normal' },
    { sourceRef: { sourceId: tree.intents[0].goals[0].plans[0].sourceId }, signalType: 'gate-pending', priority: 2, severity: 'normal' },
  ];
  const pDiff = VM.makeStubAttentionProvider(diff);
  const vmDiff = VM.buildHomeViewModel({ tree, provider: pDiff, orderPreference: ['gate-pending', 'confirmation'] });
  assert.strictEqual(vmDiff.cards[0].navRef.sourceId, diff[0].sourceRef.sourceId, 'DI priority wins; preference cannot override it');
  // Two candidates with EQUAL DI priority: preference decides the order.
  const eq = [
    { sourceRef: { sourceId: tree.intents[0].goals[0].sourceId }, signalType: 'confirmation', priority: 5, severity: 'normal' },
    { sourceRef: { sourceId: tree.intents[0].goals[0].plans[0].sourceId }, signalType: 'gate-pending', priority: 5, severity: 'normal' },
  ];
  const pEq = VM.makeStubAttentionProvider(eq);
  const vmEq = VM.buildHomeViewModel({ tree, provider: pEq, orderPreference: ['gate-pending', 'confirmation'] });
  assert.strictEqual(vmEq.cards[0].navRef.sourceId, eq[1].sourceRef.sourceId, 'within equal priority, M&S preference decides');
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

// Visible render of the three Home cards from the stub (customer language title + tone marker).
(function renderDemo() {
  const { tree, provider } = setup();
  const vm = VM.buildHomeViewModel({ tree, provider });
  console.log('\nHome-kaarten (stub — gate-pending / attention / confirmation):');
  for (const c of vm.cards) {
    console.log(`  • [${c.tone}] ${c.title}\n      ${c.summaryTemplate}  → ${c.navRef.destination}`);
  }
})();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
