'use strict';
// Brok B proofs — plain node, no infrastructure. Exit 0 = all proofs pass.
const assert = require('assert');
const { Engine } = require('../engine');
const { KnowledgeLayer } = require('../knowledge');
const { ReferenceViolation, LifecycleViolation, ConstraintViolation } = require('../engine/errors');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log(`PASS ✅  ${name}`); pass++; }
  catch (e) { console.log(`FAIL ❌  ${name}\n        ${e && e.message}`); fail++; }
}

// A real engine-backed Value Plan, so valuePlanId validity is a true cross-layer check.
function setup() {
  const engine = new Engine();
  const intent = engine.createStrategicIntent({ name: 'Growth' });
  const goal = engine.createStrategicGoal({ intentId: intent.id, name: 'Revenue', targetValue: 100000, unit: 'EUR' });
  engine.activateStrategicGoal(goal.id);
  const plan = engine.createValuePlan({ goalId: goal.id });
  engine.activateValuePlan(plan.id);
  const k = new KnowledgeLayer({ valuePlanExists: (id) => !!engine.get('valuePlans', id) });
  return { engine, k, planId: plan.id };
}

// ── Proof 1: Advice with invalid/missing valuePlanId → ReferenceViolation (no orphan) ──
check('1. Advice with invalid/missing valuePlanId is refused (ReferenceViolation)', () => {
  const { k } = setup();
  assert.throws(() => k.createAdvice({ valuePlanId: 'vp_nope', title: 'T', body: 'B', originType: 'ai' }), ReferenceViolation);
  assert.throws(() => k.createAdvice({ title: 'T', body: 'B', originType: 'human' }), ReferenceViolation);
});

// ── Proof 2: Advice lifecycle + superseded advice kept ──
check('2. Advice Proposed→Accepted / Proposed→Rejected work; Rejected→Accepted refused; superseded kept', () => {
  const { k, planId } = setup();
  const a1 = k.createAdvice({ valuePlanId: planId, title: 'A1', body: 'body', originType: 'ai' });
  assert.strictEqual(k.acceptAdvice(a1.id).status, 'Accepted');
  const a2 = k.createAdvice({ valuePlanId: planId, title: 'A2', body: 'body', originType: 'human' });
  assert.strictEqual(k.rejectAdvice(a2.id).status, 'Rejected');
  assert.throws(() => k.acceptAdvice(a2.id), LifecycleViolation, 'Rejected→Accepted is illegal');
  // supersede the accepted advice: new advice, old kept + marked Superseded
  const a3 = k.supersedeAdvice(a1.id, { valuePlanId: planId, title: 'A1b', body: 'better', originType: 'ai' });
  assert.strictEqual(k.get('adviceRecords', a1.id).status, 'Superseded', 'old still present, Superseded');
  assert.strictEqual(a3.supersedesRef, a1.id, 'successor points back');
  assert.deepStrictEqual(k.currentAdviceFor(planId).map((a) => a.id).sort(), [a3.id].sort(), 'only successor is current');
});

// ── Proof 3: Decision is immutable; revision only via a new superseding record ──
check('3. Decision Record is immutable; revision is a new record with supersedesRef', () => {
  const { k, planId } = setup();
  const d1 = k.recordDecision({ title: 'D1', body: 'b', outcome: 'accepted', rationale: 'because', valuePlanId: planId });
  assert.throws(() => k.updateDecision(d1.id), ConstraintViolation, 'mutation refused with typed error');
  assert.throws(() => k.setDecisionStatus(d1.id), ConstraintViolation);
  assert.throws(() => { d1.outcome = 'rejected'; }, TypeError, 'frozen object blocks direct write');
  assert.strictEqual(k.get('decisionRecords', d1.id).outcome, 'accepted', 'unchanged');
  const d2 = k.reviseDecision(d1.id, { title: 'D2', body: 'b2', outcome: 'rejected', rationale: 'revised', valuePlanId: planId });
  assert.strictEqual(d2.supersedesRef, d1.id);
  assert.deepStrictEqual(k.currentDecisionFor(planId).map((d) => d.id), [d2.id], 'old superseded, new current');
});

// ── Proof 4: Decision requires rationale + bounded outcome ──
check('4. Decision without rationale refused; invalid outcome refused', () => {
  const { k, planId } = setup();
  assert.throws(() => k.recordDecision({ title: 'T', body: 'b', outcome: 'accepted', valuePlanId: planId }), ConstraintViolation);
  assert.throws(() => k.recordDecision({ title: 'T', body: 'b', outcome: 'maybe', rationale: 'x', valuePlanId: planId }), ConstraintViolation);
});

// ── Proof 5: Memory current = computed; supersede preserves lineage ──
check('5. Memory current=computed; superseded entry kept (lineage)', () => {
  const { k } = setup();
  const m1 = k.rememberIfImpactful({ tenantId: 't1', sourceType: 'discovery', memoryType: 'Fact', content: 'sells bikes', impactRelevant: true });
  assert.ok(m1 && !m1.supersededByRef, 'new entry is current');
  assert.deepStrictEqual(k.currentMemory('t1').map((m) => m.id), [m1.id]);
  const m2 = k.supersedeMemory(m1.id, { tenantId: 't1', sourceType: 'interaction', memoryType: 'Fact', content: 'sells e-bikes', impactRelevant: true });
  assert.strictEqual(k.get('memoryEntries', m1.id).supersededByRef, m2.id, 'old points to successor');
  assert.ok(k.get('memoryEntries', m1.id), 'old entry still exists (lineage)');
  assert.deepStrictEqual(k.currentMemory('t1').map((m) => m.id), [m2.id], 'only successor is current');
});

// ── Proof 6: Memory trigger — impactRelevant:false is not stored ──
check('6. Memory trigger: impactRelevant=false leads to no storage', () => {
  const { k } = setup();
  const none = k.rememberIfImpactful({ tenantId: 't1', sourceType: 'interaction', memoryType: 'Observation', content: 'said hi', impactRelevant: false });
  assert.strictEqual(none, null, 'not impactful → not remembered');
  assert.strictEqual(k.currentMemory('t1').length, 0, 'nothing stored');
});

// ── Proof 7: inert fields exist but drive no behaviour ──
check('7. Inert fields (authorRef, decidedBy, supportedByMemoryRefs, volatility, tenantId) drive no behaviour', () => {
  const { k, planId } = setup();
  // Advice with inert fields set vs not — identical lifecycle outcome.
  const aInert = k.createAdvice({ valuePlanId: planId, title: 'X', body: 'b', originType: 'ai',
    authorRef: 'agent-x', supportedByMemoryRefs: [{ kind: 'memory', ref: 'mem_1' }] });
  const aPlain = k.createAdvice({ valuePlanId: planId, title: 'X', body: 'b', originType: 'ai' });
  assert.strictEqual(k.acceptAdvice(aInert.id).status, k.acceptAdvice(aPlain.id).status, 'inert advice fields do not alter lifecycle');
  // Decision with inert decidedBy vs not — identical outcome.
  const dInert = k.recordDecision({ title: 'D', body: 'b', outcome: 'deferred', rationale: 'r', valuePlanId: planId, decidedBy: 'someone' });
  const dPlain = k.recordDecision({ title: 'D', body: 'b', outcome: 'deferred', rationale: 'r', valuePlanId: planId });
  assert.strictEqual(dInert.outcome, dPlain.outcome);
  // Memory volatility inert; tenantId cross-tenant just partitions reads, no behaviour change.
  const mV = k.rememberIfImpactful({ tenantId: 't2', sourceType: 'discovery', memoryType: 'Preference', content: 'prefers email', impactRelevant: true, volatility: 'high' });
  assert.ok(!mV.supersededByRef, 'volatility does not affect currentness');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
