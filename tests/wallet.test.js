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
check('3. Success scenario (confirmation) has a working Executive Summary; others route to "binnenkort"', () => {
  const d = buildWalletData();
  const success = d.home.cards.find((c) => c.signalType === 'confirmation');
  assert.ok(success.hasSummary, 'confirmation card has a summary (doorklik works)');
  assert.ok(d.executiveSummaries[success.sourceId], 'executive summary present for the success source');
  for (const c of d.home.cards.filter((x) => x.signalType !== 'confirmation')) {
    assert.strictEqual(c.hasSummary, false, 'non-success cards route to binnenkort');
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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
