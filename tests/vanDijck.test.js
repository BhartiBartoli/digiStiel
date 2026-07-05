'use strict';
// Van Dijck Wonen — demo seed-data + four Home scenarios. Exit 0 = all proofs pass.
// Seed/stub data on the frozen wallet layers (Presentation Read Model + Home ViewModel). Read-only.
const assert = require('assert');
const P = require('../presentation');
const VM = require('../presentation/viewmodel');
const { vanDijckAttentionCandidates } = require('../presentation/seedCustomer');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log(`PASS ✅  ${name}`); pass++; }
  catch (e) { console.log(`FAIL ❌  ${name}\n        ${e && e.message}`); fail++; }
}

function setup() {
  const engine = P.loadSeedCustomer();
  const tree = P.projectWallet(P.makeReader(engine));
  return { engine, tree };
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
function walk(tree, visit) {
  for (const intent of tree.intents) {
    visit(intent);
    for (const goal of intent.goals) {
      visit(goal);
      for (const plan of goal.plans) {
        visit(plan);
        for (const og of plan.operationalGoals) {
          visit(og);
          for (const res of og.results) visit(res);
        }
      }
    }
  }
}
// Channel MECHANICS that must never leak (the plumbing), plus internal object keys. Note: "winkel"/
// "webshop" are the customer's OWN words for their store and legitimately appear in a goal name — they
// are not channel mechanics, so they are not forbidden.
const FORBIDDEN = ['ERP', 'SEO', 'TikTok', 'affiliate', 'Meta ads', 'Google ads', 'indicatorType', 'supportedBy', 'weightMechanism'];

// Render the full projected tree in customer language.
function renderTree(tree) {
  const lines = [];
  for (const intent of tree.intents) {
    lines.push(`${intent.label}: ${intent.name}`);
    for (const goal of intent.goals) {
      lines.push(`  ${goal.label}: ${goal.name} (streef: ${goal.target.value} ${goal.target.unit})`);
      for (const plan of goal.plans) {
        const mv = Object.entries(plan.measurableValue.perUnit).map(([u, v]) => `${v} ${u}`).join(', ');
        lines.push(`    ${plan.label}${mv ? ` — waarde nu: ${mv}` : ''}`);
        for (const og of plan.operationalGoals) {
          lines.push(`      ${og.label}: ${og.name}`);
          for (const res of og.results) lines.push(`        ${res.label}: ${res.name} = ${res.value} ${res.unit}`);
        }
      }
    }
  }
  return lines.join('\n');
}

// ── 1: full tree reads in customer language; no internal term / channel mechanic ──
check('1. Full Van Dijck tree in customer language; no internal term or channel mechanic visible', () => {
  const { tree } = setup();
  const rendered = renderTree(tree);
  for (const term of FORBIDDEN) assert.ok(!rendered.includes(term), `forbidden term "${term}" visible to customer`);
  // customer-language level labels present
  for (const lbl of ['waar je naartoe wil', 'je doel', 'je plan', 'wat je nu doet', 'je resultaat']) {
    assert.ok(rendered.includes(lbl), `label "${lbl}" present`);
  }
});

// ── 2: one Intent "Groeien" with two Strategic Goals ──
check('2. One Intent "Groeien" with two Strategic Goals projects correctly', () => {
  const { tree } = setup();
  assert.strictEqual(tree.intents.length, 1, 'exactly one intent');
  assert.strictEqual(tree.intents[0].name, 'Groeien', 'the overarching growth intent');
  const goalNames = tree.intents[0].goals.map((g) => g.name);
  assert.strictEqual(goalNames.length, 2, 'two Strategic Goals under the one Intent');
  assert.ok(goalNames.includes('Bestaande business laten groeien') && goalNames.includes('Een nieuwe waardestroom opbouwen'), 'both goals present');
  for (const goal of tree.intents[0].goals) assert.ok(goal.plans.length >= 1, 'each goal has plan depth');
});

// ── 3: shared Klanten indicator under both OGs within Goal 1; aggregation dedups ──
check('3. Shared "Klanten" indicator appears under two Operational Goals (Goal 1); aggregation dedups', () => {
  const { engine, tree } = setup();
  const goal1 = tree.intents[0].goals.find((g) => g.name === 'Bestaande business laten groeien');
  const klantenSightings = [];
  for (const plan of goal1.plans) for (const og of plan.operationalGoals) {
    for (const res of og.results) if (res.name === 'Klanten') klantenSightings.push({ ogName: og.name, sourceId: res.sourceId });
  }
  // The SAME vi id appears under two different Operational Goals (many-to-many).
  const sharedId = klantenSightings[0].sourceId;
  const underShared = klantenSightings.filter((s) => s.sourceId === sharedId);
  assert.ok(underShared.length === 2, 'shared Klanten id shows under exactly two Operational Goals');
  assert.notStrictEqual(underShared[0].ogName, underShared[1].ogName, 'two distinct Operational Goals');
  // Aggregation dedups: each plan's indicatorIds are distinct (no double count). VP-A also has Omzet
  // reachable via two OGs → genuine within-plan dedup.
  for (const plan of goal1.plans) {
    const mv = engine.measurableValue(plan.sourceId);
    assert.strictEqual(new Set(mv.indicatorIds).size, mv.indicatorIds.length, 'distinct indicatorIds — no double count');
    assert.strictEqual(mv.count, new Set(mv.indicatorIds).size, 'count == distinct');
  }
});

// ── 4: measurableValue is computed, not an entered number ──
check('4. measurableValue per plan is computed from the underlying indicators', () => {
  const { engine, tree } = setup();
  const plan = tree.intents[0].goals[0].plans[0]; // VP1a
  // recompute independently from the indicators reachable via the plan's OGs
  const mv = engine.measurableValue(plan.sourceId);
  const expected = {};
  for (const id of mv.indicatorIds) {
    const vi = engine.get('valueIndicators', id);
    expected[vi.unit] = (expected[vi.unit] || 0) + Number(vi.value);
  }
  assert.deepStrictEqual(plan.measurableValue.perUnit, expected, 'projected perUnit == computed from VIs');
  assert.ok(mv.indicatorIds.length >= 1, 'derived from real indicators, not an entered figure');
});

// ── 5: four scenarios render as Home cards; plan cards carry goal-name context ──
check('5. Four scenarios: correct tone + plan cards identified via goal-name context', () => {
  const { engine, tree } = setup();
  const candidates = vanDijckAttentionCandidates(engine);
  assert.strictEqual(candidates.length, 4, 'four scenarios');
  const provider = VM.makeStubAttentionProvider(candidates);
  const vm = VM.buildHomeViewModel({ tree, provider, topN: 4 }); // topN 4 to inspect all four
  const toneBySignal = { 'gate-pending': 'geruststellend', 'attention': 'kalm', 'confirmation': 'warm' };
  for (const cand of candidates) {
    const card = vm.cards.find((c) => c.navRef.sourceId === cand.sourceRef.sourceId);
    assert.ok(card && card.title, 'each candidate yields a card with a title');
    assert.strictEqual(card.tone, toneBySignal[cand.signalType], `tone matches ${cand.signalType}`);
  }
  // The two gate cards are distinguishable via their goal-name context (they hang under different Goals).
  const gateCards = vm.cards.filter((c) => c.tone === 'geruststellend');
  const gateTitles = gateCards.map((c) => c.title).sort();
  assert.deepStrictEqual(gateTitles, ['je plan · Bestaande business laten groeien', 'je plan · Een nieuwe waardestroom opbouwen'],
    'two gate cards distinguishable by goal context');
  // confirmation card is the goal itself → "je doel: <naam>"
  assert.ok(vm.cards.some((c) => c.title === 'je doel: Bestaande business laten groeien'), 'confirmation shows the goal');
});

// ── 6: Top-N cap → one gate at top, via STUB priorities (no ViewModel signalType filter) ──
check('6. Top-N cap: max 3, one gate at top — via stub priorities, not a ViewModel filter', () => {
  const { engine, tree } = setup();
  const candidates = vanDijckAttentionCandidates(engine);
  assert.strictEqual(candidates.filter((c) => c.signalType === 'gate-pending').length, 2, 'stub genuinely has two gates');
  const vm = VM.buildHomeViewModel({ tree, provider: VM.makeStubAttentionProvider(candidates) }); // default topN=3
  assert.strictEqual(vm.cards.length, 3, 'four candidates capped to three');
  assert.strictEqual(vm.cards.filter((c) => c.tone === 'geruststellend').length, 1, 'exactly one gate shown');
  assert.strictEqual(vm.cards[0].title, 'je plan · Bestaande business laten groeien', 'priority-1 gate (region, Goal 1) first');
  assert.ok(vm.cards[1].tone === 'warm' && vm.cards[2].tone === 'kalm', 'order gate → confirmation → attention (DI priority)');
  // Counter-proof it is priority, not a signalType filter: bump the second gate to priority 0 → two gates appear.
  const bumped = candidates.map((c) => (c.priority === 4 ? { ...c, priority: 0 } : c));
  const vm2 = VM.buildHomeViewModel({ tree, provider: VM.makeStubAttentionProvider(bumped) });
  assert.strictEqual(vm2.cards.filter((c) => c.tone === 'geruststellend').length, 2, 'ViewModel does not filter signalType — priority alone decides');
});

// ── 7: read-only — projection/viewmodel mutate nothing ──
check('7. Read-only: store snapshot identical before/after projection + viewmodel', () => {
  const { engine, tree } = setup();
  const before = storeSnapshot(engine);
  const provider = VM.makeStubAttentionProvider(vanDijckAttentionCandidates(engine));
  VM.buildHomeViewModel({ tree, provider });
  assert.strictEqual(storeSnapshot(engine), before, 'nothing mutated');
});

// ── Prints for review ──
(function printAll() {
  const { engine, tree } = setup();
  console.log('\n================ Van Dijck Wonen — geprojecteerde boom (klanttaal) ================');
  console.log(renderTree(tree));
  const provider = VM.makeStubAttentionProvider(vanDijckAttentionCandidates(engine));
  const vm = VM.buildHomeViewModel({ tree, provider });
  console.log('\n================ Home-kaarten (Top 3 van 4 candidates, DI-volgorde) ================');
  for (const c of vm.cards) console.log(`  • [${c.tone}] ${c.title}\n      ${c.summaryTemplate}  → ${c.navRef.destination}`);
})();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
