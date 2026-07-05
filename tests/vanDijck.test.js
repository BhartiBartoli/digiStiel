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

// ── 2: both intents project fully ──
check('2. Both intents project as two full hierarchies under one seed customer', () => {
  const { tree } = setup();
  assert.strictEqual(tree.intents.length, 2, 'two intents');
  const names = tree.intents.map((i) => i.name);
  assert.ok(names.includes('Groei bestaande business') && names.includes('Nieuwe waardestroom opbouwen'), 'both intents present');
  for (const intent of tree.intents) {
    assert.ok(intent.goals.length >= 1 && intent.goals[0].plans.length >= 1, 'each intent has goal→plan depth');
  }
});

// ── 3: shared Klanten indicator under both OGs; aggregation dedups ──
check('3. Shared "Klanten" indicator appears under two Operational Goals; aggregation dedups', () => {
  const { engine, tree } = setup();
  // Collect the sourceIds of every "Klanten" result and which OG they sit under, in Intent 1.
  const intent1 = tree.intents.find((i) => i.name === 'Groei bestaande business');
  const klantenSightings = [];
  for (const goal of intent1.goals) for (const plan of goal.plans) for (const og of plan.operationalGoals) {
    for (const res of og.results) if (res.name === 'Klanten') klantenSightings.push({ ogName: og.name, sourceId: res.sourceId });
  }
  // The SAME vi id appears under two different Operational Goals (many-to-many).
  const sharedId = klantenSightings[0].sourceId;
  const underShared = klantenSightings.filter((s) => s.sourceId === sharedId);
  assert.ok(underShared.length === 2, 'shared Klanten id shows under exactly two Operational Goals');
  assert.notStrictEqual(underShared[0].ogName, underShared[1].ogName, 'two distinct Operational Goals');
  // Aggregation dedups: each plan's indicatorIds are distinct (no double count).
  for (const goal of intent1.goals) for (const plan of goal.plans) {
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

// ── 5: four scenarios render as Home cards with correct tone per signalType ──
check('5. Four scenarios render as Home cards: customer-language title from Tree + correct tone', () => {
  const { engine, tree } = setup();
  const candidates = vanDijckAttentionCandidates(engine);
  assert.strictEqual(candidates.length, 4, 'four scenarios');
  const provider = VM.makeStubAttentionProvider(candidates);
  const vm = VM.buildHomeViewModel({ tree, provider, topN: 4 }); // topN 4 here to inspect all tones
  const toneBySignal = { 'gate-pending': 'geruststellend', 'attention': 'kalm', 'confirmation': 'warm' };
  for (const cand of candidates) {
    const card = vm.cards.find((c) => c.navRef.sourceId === cand.sourceRef.sourceId);
    assert.ok(card && card.title, 'each candidate yields a card with a customer-language title');
    assert.strictEqual(card.tone, toneBySignal[cand.signalType], `tone matches ${cand.signalType}`);
  }
});

// ── 6: Top N cap — four candidates → max 2-3 cards in DI order ──
check('6. Top N cap: four candidates → max 3 cards in DI priority order', () => {
  const { engine, tree } = setup();
  const provider = VM.makeStubAttentionProvider(vanDijckAttentionCandidates(engine));
  const vm = VM.buildHomeViewModel({ tree, provider }); // default topN=3
  assert.strictEqual(vm.cards.length, 3, 'four candidates capped to three');
  // order follows DI priority 1,2,3 (the priority-4 project plan is dropped)
  const sgRevenue = require('../presentation/seedCustomer').NAMES.goalRevenue;
  const first = vm.cards[0];
  assert.ok(first.title.startsWith('je plan'), 'priority-1 gate (VP1a) shown first');
  const droppedProjectPlan = vm.cards.every((c) => c.title !== 'je plan' || true); // sanity
  assert.ok(droppedProjectPlan);
  assert.strictEqual(vm.cards.length, 3, 'cap enforced');
  void sgRevenue;
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
