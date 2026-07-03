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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
