'use strict';
// Brok C deel 1 proofs — field additions on Decision & Advice. Exit 0 = all pass.
const assert = require('assert');
const { Engine } = require('../engine');
const { KnowledgeLayer } = require('../knowledge');
const { ConstraintViolation } = require('../engine/errors');
const { isChainEligible, ADVICE_FORMS } = require('../knowledge/objects/adviceRecord');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log(`PASS ✅  ${name}`); pass++; }
  catch (e) { console.log(`FAIL ❌  ${name}\n        ${e && e.message}`); fail++; }
}

// Engine-backed valid Value Plan, as in brokB.
function setup() {
  const engine = new Engine();
  const intent = engine.createStrategicIntent({ name: 'Growth' });
  const goal = engine.createStrategicGoal({ intentId: intent.id, name: 'Revenue', targetValue: 100000, unit: 'EUR' });
  engine.activateStrategicGoal(goal.id);
  const plan = engine.createValuePlan({ goalId: goal.id });
  engine.activateValuePlan(plan.id);
  const k = new KnowledgeLayer({ valuePlanExists: (id) => !!engine.get('valuePlans', id) });
  return { k, planId: plan.id };
}
const advice = (k, planId, extra = {}) =>
  k.createAdvice({ valuePlanId: planId, title: 'T', body: 'b', originType: 'ai', adviceForm: 'Observation', ...extra });

// ── 1: Decision defaults authority=customer, recorder=platform ──
check('1. Decision defaults: decisionAuthority=customer, decisionRecorder=platform', () => {
  const { k, planId } = setup();
  const d = k.recordDecision({ title: 'D', body: 'b', outcome: 'accepted', rationale: 'r', valuePlanId: planId });
  assert.strictEqual(d.decisionAuthority, 'customer', 'default authority');
  assert.strictEqual(d.decisionRecorder, 'platform', 'default recorder');
});

// ── 2: authority and recorder are SEPARATE, not folded ──
check('2. decisionAuthority and decisionRecorder are independent fields (not folded)', () => {
  const { k, planId } = setup();
  const d = k.recordDecision({ title: 'D', body: 'b', outcome: 'accepted', rationale: 'r', valuePlanId: planId,
    decisionAuthority: 'customer', decisionRecorder: 'platform' });
  assert.strictEqual(d.decisionAuthority, 'customer');
  assert.strictEqual(d.decisionRecorder, 'platform');
  assert.notStrictEqual(d.decisionAuthority, d.decisionRecorder, 'distinct values, distinct fields');
  assert.ok('decisionAuthority' in d && 'decisionRecorder' in d, 'both present separately');
});

// ── 3: out-of-enum authority refused ──
check('3. Out-of-enum decisionAuthority is refused (ConstraintViolation)', () => {
  const { k, planId } = setup();
  assert.throws(() => k.recordDecision({ title: 'D', body: 'b', outcome: 'accepted', rationale: 'r', valuePlanId: planId, decisionAuthority: 'foo' }), ConstraintViolation);
  // recorder is likewise bounded
  assert.throws(() => k.recordDecision({ title: 'D', body: 'b', outcome: 'accepted', rationale: 'r', valuePlanId: planId, decisionRecorder: 'nope' }), ConstraintViolation);
});

// ── 4: inert authority values accepted but drive no behaviour ──
check('4. Inert authority values (autonomous-platform/partner/human-operator) accepted, no behaviour change', () => {
  const { k, planId } = setup();
  const base = k.recordDecision({ title: 'D', body: 'b', outcome: 'accepted', rationale: 'r', valuePlanId: planId });
  for (const inert of ['autonomous-platform', 'partner', 'human-operator']) {
    const d = k.recordDecision({ title: 'D', body: 'b', outcome: 'accepted', rationale: 'r', valuePlanId: planId, decisionAuthority: inert });
    assert.strictEqual(d.decisionAuthority, inert, 'value stored');
    // same shape/outcome as the customer-default one — the inert value triggers nothing extra.
    assert.strictEqual(d.outcome, base.outcome);
    assert.strictEqual(d.type, base.type);
    assert.strictEqual(d.decisionRecorder, base.decisionRecorder, 'recorder unaffected by authority');
  }
});

// ── 5: Advice requires adviceForm ──
check('5. Advice without adviceForm is refused; out-of-enum refused', () => {
  const { k, planId } = setup();
  assert.throws(() => k.createAdvice({ valuePlanId: planId, title: 'T', body: 'b', originType: 'ai' }), ConstraintViolation);
  assert.throws(() => advice(k, planId, { adviceForm: 'Bogus' }), ConstraintViolation);
});

// ── 6: chain-eligibility distinction sits in the data structure ──
check('6. isChainEligible true only for Recommendation; false for the other five', () => {
  const { k, planId } = setup();
  const rec = advice(k, planId, { adviceForm: 'Recommendation' });
  assert.strictEqual(isChainEligible(rec), true, 'Recommendation is chain-eligible');
  for (const form of ['Observation', 'Insight', 'Warning', 'Question', 'Alternative']) {
    const a = advice(k, planId, { adviceForm: form });
    assert.strictEqual(isChainEligible(a), false, `${form} is NOT chain-eligible`);
  }
  assert.strictEqual(ADVICE_FORMS.length, 6, 'six bounded forms');
});

// ── 7: the new Decision fields are immutable after creation ──
check('7. Decision Brok C fields are immutable after creation (frozen)', () => {
  const { k, planId } = setup();
  const d = k.recordDecision({ title: 'D', body: 'b', outcome: 'accepted', rationale: 'r', valuePlanId: planId });
  assert.throws(() => { d.decisionAuthority = 'partner'; }, TypeError, 'frozen: authority not writable');
  assert.throws(() => { d.decisionRecorder = 'partner'; }, TypeError, 'frozen: recorder not writable');
  assert.strictEqual(k.get('decisionRecords', d.id).decisionAuthority, 'customer', 'unchanged');
});

// ══════════════════════════════════════════════════════════════════════════════
// Brok C deel 2 — the four COMPUTED evaluations (Decision Intelligence).
// Pure functions over the canonical history; they store nothing.
// ══════════════════════════════════════════════════════════════════════════════
const DI = require('../knowledge/decision-intelligence');

// Engine + knowledge with some history, plus the read-only world adapter.
function setupDI() {
  const engine = new Engine();
  const intent = engine.createStrategicIntent({ name: 'Growth' });
  const goal = engine.createStrategicGoal({ intentId: intent.id, name: 'Revenue', targetValue: 100000, unit: 'EUR' });
  engine.activateStrategicGoal(goal.id);
  const plan = engine.createValuePlan({ goalId: goal.id });
  engine.activateValuePlan(plan.id);
  const k = new KnowledgeLayer({ valuePlanExists: (id) => !!engine.get('valuePlans', id) });
  // seed history
  k.createAdvice({ valuePlanId: plan.id, title: 'W', body: 'risk', originType: 'ai', adviceForm: 'Warning' });
  k.recordDecision({ title: 'D', body: 'b', outcome: 'accepted', rationale: 'r', valuePlanId: plan.id });
  k.rememberIfImpactful({ tenantId: 't1', sourceType: 'discovery', memoryType: 'Fact', content: 'x', impactRelevant: true });
  const world = DI.makeWorld({ engine, knowledge: k });
  return { engine, k, planId: plan.id, world };
}
// Full serialisable snapshot of the knowledge store (proof of "nothing persisted").
function storeSnapshot(k) {
  return JSON.stringify({
    advice: [...k.store.adviceRecords.values()],
    decisions: [...k.store.decisionRecords.values()],
    memory: [...k.store.memoryEntries.values()],
  });
}
function storeCounts(k) {
  return {
    advice: k.store.adviceRecords.size,
    decisions: k.store.decisionRecords.size,
    memory: k.store.memoryEntries.size,
  };
}

// ── 8: Judgement is a function/derivation, not a stored record ──
check('8. Judgement is computed (function returns evaluation; nothing stored)', () => {
  const { k, planId, world } = setupDI();
  const before = storeSnapshot(k);
  const j = DI.computeJudgement(world, planId, { now: '2026-07-03', riskSignal: 3 });
  assert.strictEqual(j.kind, 'Judgement');
  assert.ok(['low', 'medium', 'high'].includes(j.assessment));
  assert.strictEqual(storeSnapshot(k), before, 'store unchanged — no judgement record');
});

// ── 9: Trust is computed, not stored ──
check('9. Trust is computed (function returns evaluation; nothing stored)', () => {
  const { k, planId, world } = setupDI();
  const before = storeSnapshot(k);
  const t = DI.computeTrust(world, planId, { now: '2026-07-03' });
  assert.strictEqual(t.kind, 'Trust');
  assert.ok(['low', 'medium', 'high'].includes(t.level));
  assert.strictEqual(storeSnapshot(k), before, 'store unchanged — no trust record');
});

// ── 10: Governance Verdict is bounded; 'Stop' is a recommendation, not an autonomous action ──
check("10. Governance Verdict ∈ enum; 'Stop' recommends, creates no Decision, mutates nothing", () => {
  const { k, planId, world } = setupDI();
  const before = storeSnapshot(k);
  const beforeDecisions = storeCounts(k).decisions;
  const v = DI.computeGovernanceVerdict(world, planId, { now: 'n', riskSignal: 10 }); // force high → Stop
  assert.ok(DI.VERDICTS.includes(v.verdict), 'verdict within bounded enum');
  assert.strictEqual(v.verdict, 'Stop', 'high risk → Stop');
  assert.strictEqual(v.isRecommendation, true, 'Stop is a recommendation');
  assert.strictEqual(v.commitment, null, 'no commitment produced');
  assert.strictEqual(storeCounts(k).decisions, beforeDecisions, 'no Decision created by a Stop');
  assert.strictEqual(storeSnapshot(k), before, 'store unchanged');
});

// ── 11: Authorization needs an active mandate; writes no permission record ──
check('11. Authorization: active mandate → judged; inert/no mandate → not authorized; nothing written', () => {
  const { k, planId, world } = setupDI();
  const before = storeSnapshot(k);
  const action = { type: 'transition', valuePlanId: planId };

  const ok = DI.computeAuthorization(world, action, { source: 'customer-approval' }, {});
  assert.strictEqual(ok.kind, 'Authorization');
  assert.strictEqual(ok.authorized, true, 'customer-approval → judged authorized');

  const inert = DI.computeAuthorization(world, action, { source: 'goal-budget' }, {});
  assert.strictEqual(inert.authorized, false, 'inert mandate source drives no authorization');
  assert.strictEqual(inert.reason, 'inert-mandate-source');

  const none = DI.computeAuthorization(world, action, null, {});
  assert.strictEqual(none.authorized, false, 'no mandate → not authorized (never mandateless)');
  assert.strictEqual(none.reason, 'no-mandate');

  assert.strictEqual(storeSnapshot(k), before, 'no authorization/permission record written');
});

// ── 12: STATELESS overall — calling all four (incl. composition) leaves the store identical ──
check('12. Stateless: the full store is unchanged after all four evaluations (incl. composition)', () => {
  const { k, planId, world } = setupDI();
  const before = storeSnapshot(k);
  DI.computeJudgement(world, planId, { now: 'n' });
  DI.computeTrust(world, planId, { now: 'n' });
  DI.computeGovernanceVerdict(world, planId, { now: 'n' });          // composes judgement in-memory
  DI.computeAuthorization(world, { valuePlanId: planId }, { source: 'customer-approval' }, { now: 'n' }); // composes verdict in-memory
  assert.strictEqual(storeSnapshot(k), before, 'no evaluation (or composition) persisted anything');
});

// ── 13: No new Knowledge output — Advice/Decision/Memory counts unchanged ──
check('13. Decision Intelligence produces no Knowledge (Advice/Decision/Memory counts unchanged)', () => {
  const { k, planId, world } = setupDI();
  const before = storeCounts(k);
  DI.computeJudgement(world, planId, {});
  DI.computeTrust(world, planId, {});
  DI.computeGovernanceVerdict(world, planId, {});
  DI.computeAuthorization(world, { valuePlanId: planId }, { source: 'customer-approval' }, {});
  assert.deepStrictEqual(storeCounts(k), before, 'no new Advice/Decision/Memory');
});

// ══════════════════════════════════════════════════════════════════════════════
// Brok C deel 3 — the boundary that guards action WITHOUT autonomy.
// Gate (validation precondition) + chain guard + commit-authority policy.
// Preconditions/refusals only: no new stored objects, no Execution layer.
// (Proofs 14–15 intentionally skipped per spec numbering.)
// ══════════════════════════════════════════════════════════════════════════════

// A Value Plan left in Proposed (NOT activated) so the gate governs its activation.
function setupGate() {
  const engine = new Engine();
  const intent = engine.createStrategicIntent({ name: 'Growth' });
  const goal = engine.createStrategicGoal({ intentId: intent.id, name: 'Revenue', targetValue: 100000, unit: 'EUR' });
  engine.activateStrategicGoal(goal.id);
  const plan = engine.createValuePlan({ goalId: goal.id }); // Proposed
  const k = new KnowledgeLayer({ valuePlanExists: (id) => !!engine.get('valuePlans', id) });
  const world = DI.makeWorld({ engine, knowledge: k });
  return { engine, k, planId: plan.id, world };
}

// ── 16: Value Plan cannot go Active without confirmed validation; with it, it can ──
check('16. Gate: activation refused without validation (typed error), allowed with it', () => {
  const { engine, planId } = setupGate();
  assert.strictEqual(engine.get('valuePlans', planId).status, 'Proposed');
  assert.throws(() => DI.activateValuePlan(engine, planId, {}), ConstraintViolation, 'no validation → refused');
  assert.throws(() => DI.activateValuePlan(engine, planId, { validatedAt: '2026-07-03' }), ConstraintViolation, 'validatedBy missing → refused');
  assert.strictEqual(engine.get('valuePlans', planId).status, 'Proposed', 'still Proposed after refusal');

  const res = DI.activateValuePlan(engine, planId, { validatedAt: '2026-07-03', validatedBy: 'customer' });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(engine.get('valuePlans', planId).status, 'Active', 'validated → Active');
});

// ── 17: the gate guards COMMITMENT, not interpretation (guarantee 1 + 4) ──
check('17. Gate guards commitment only: Advice/Judgement/Trust/Governance Verdict run without validation', () => {
  const { engine, k, planId, world } = setupGate(); // NO validation anywhere
  // Knowledge-forming is always allowed:
  const a = k.createAdvice({ valuePlanId: planId, title: 'T', body: 'b', originType: 'ai', adviceForm: 'Observation' });
  assert.strictEqual(a.type, 'AdviceRecord', 'Advice creatable without validation');
  // Evaluation is always allowed:
  assert.strictEqual(DI.computeJudgement(world, planId, {}).kind, 'Judgement');
  assert.strictEqual(DI.computeTrust(world, planId, {}).kind, 'Trust');
  assert.ok(DI.VERDICTS.includes(DI.computeGovernanceVerdict(world, planId, {}).verdict), 'Governance Verdict runs');
  // Only commitment (activation) is gated:
  assert.throws(() => DI.activateValuePlan(engine, planId, {}), Error);
});

// ── 18: reasoning chain may only start from a Recommendation; guard weighs no content (guarantee 2) ──
check('18. Chain guard: Recommendation starts a chain; the other five are refused; only the form decides', () => {
  const { k, planId } = setupGate();
  const rec = k.createAdvice({ valuePlanId: planId, title: 'T', body: 'same body', originType: 'ai', adviceForm: 'Recommendation' });
  const started = DI.startReasoningChain(rec);
  assert.strictEqual(started.start, 'Recommendation');
  assert.strictEqual(started.adviceId, rec.id);
  // Identical body/title — only adviceForm differs — proving the guard weighs FORM, not content.
  for (const form of ['Observation', 'Insight', 'Warning', 'Question', 'Alternative']) {
    const a = k.createAdvice({ valuePlanId: planId, title: 'T', body: 'same body', originType: 'ai', adviceForm: form });
    assert.throws(() => DI.startReasoningChain(a), ConstraintViolation, `${form} may not start a chain`);
  }
});

// ── 19: only 'customer' may commit; the inert authorities are refused as commit authority ──
check("19. Commit-authority: 'customer' commits; autonomous-platform/partner/human-operator refused", () => {
  const { k, planId } = setupGate();
  const d = DI.commitDecision(k, { title: 'D', body: 'b', outcome: 'accepted', rationale: 'r', valuePlanId: planId });
  assert.strictEqual(d.decisionAuthority, 'customer', 'default customer commits');
  const c = DI.commitDecision(k, { title: 'D', body: 'b', outcome: 'accepted', rationale: 'r', valuePlanId: planId, decisionAuthority: 'customer' });
  assert.strictEqual(c.decisionAuthority, 'customer');
  for (const inert of ['autonomous-platform', 'partner', 'human-operator']) {
    assert.throws(() => DI.commitDecision(k, { title: 'D', body: 'b', outcome: 'accepted', rationale: 'r', valuePlanId: planId, decisionAuthority: inert }), ConstraintViolation, `${inert} refused as commit authority`);
  }
});

// ── 20: the refusal is MVP-POLICY, not a hardcoded ban (guarantee 3) ──
check('20. MVP-policy: refusal references ACTIVE_COMMIT_AUTHORITIES; widening the policy lifts it', () => {
  const { assertCommitAuthority, ACTIVE_COMMIT_AUTHORITIES, AUTHORITIES } = require('../knowledge/decision-intelligence/commitPolicy');
  assert.deepStrictEqual(ACTIVE_COMMIT_AUTHORITIES, ['customer'], 'MVP: only customer active');
  // 'partner' is refused under the MVP policy…
  assert.throws(() => assertCommitAuthority({ decisionAuthority: 'partner' }), ConstraintViolation);
  // …but widening the POLICY CONSTANT (not the structure) lifts the refusal — proof it is policy.
  assert.doesNotThrow(() => assertCommitAuthority({ decisionAuthority: 'partner' }, ['customer', 'partner']));
  // The category never left the architecture: it is still a valid structural enum value.
  assert.ok(AUTHORITIES.includes('partner') && AUTHORITIES.includes('autonomous-platform') && AUTHORITIES.includes('human-operator'),
    'reserved authorities remain in the enum (Reserve, Don\'t Activate)');
});

// ── 21: no bypass path — activation always goes through the gate ──
check('21. No bypass: the DI layer exposes exactly one activation route, and it enforces the gate', () => {
  const activationExports = Object.keys(DI).filter((k) => /^activate/i.test(k));
  assert.deepStrictEqual(activationExports, ['activateValuePlan'], 'exactly one managed activation export');
  const { engine, planId } = setupGate();
  // The single route cannot reach Active without validation…
  assert.throws(() => DI.activateValuePlan(engine, planId, {}), ConstraintViolation);
  assert.strictEqual(engine.get('valuePlans', planId).status, 'Proposed', 'no ungated route activated it');
  // …and there is no second DI function that activates while skipping the validation check.
  assert.strictEqual(typeof DI.activateValuePlan, 'function');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
