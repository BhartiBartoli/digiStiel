'use strict';
// Brok A proofs — plain node, no infrastructure. Exit 0 = all proofs pass.
const assert = require('assert');
const { Engine } = require('../engine');
const {
  ConstraintViolation, ReferenceViolation, LifecycleViolation,
} = require('../engine/errors');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log(`PASS ✅  ${name}`); pass++; }
  catch (e) { console.log(`FAIL ❌  ${name}\n        ${e && e.message}`); fail++; }
}

// Helper: a fully valid, Active chain intent→goal→plan.
function activeChain() {
  const e = new Engine();
  const intent = e.createStrategicIntent({ name: 'Growth' });
  const goal = e.createStrategicGoal({ intentId: intent.id, name: 'More revenue', targetValue: 100000, unit: 'EUR' });
  e.activateStrategicGoal(goal.id);
  const plan = e.createValuePlan({ goalId: goal.id });
  e.activateValuePlan(plan.id);
  return { e, intent, goal, plan };
}

// ── Proof 1: OG without Value Indicator rejected at Active (hard, join layer) ──
check('1. Operational Goal without Value Indicator is refused at Active; with one it activates', () => {
  const { e, plan } = activeChain();
  const og = e.createOperationalGoal({ valuePlanId: plan.id, name: 'Ship feature' });
  assert.throws(() => e.activateOperationalGoal(og.id), ConstraintViolation, 'should refuse without indicator');
  assert.strictEqual(e.get('operationalGoals', og.id).status, 'Proposed', 'stays Proposed after refusal');
  const vi = e.createValueIndicator({ name: 'Signups', indicatorType: 'leading', value: 10, unit: 'count', supportedBy: [] });
  e.linkIndicator(og.id, vi.id);
  const r = e.activateOperationalGoal(og.id);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(e.get('operationalGoals', og.id).status, 'Active', 'activates once linked');
});

// ── Proof 2: Value Plan without valid goalId gets no Active ──
check('2. Value Plan with no valid goalId cannot go Active; with an Active goal it can', () => {
  const e = new Engine();
  // Creating a plan against a missing goal is refused at creation (ReferenceViolation).
  assert.throws(() => e.createValuePlan({ goalId: 'sg_does_not_exist' }), ReferenceViolation);
  // A plan under a goal that is NOT active also cannot activate.
  const intent = e.createStrategicIntent({ name: 'Loyalty' });
  const goal = e.createStrategicGoal({ intentId: intent.id, name: 'Retention', targetValue: 90, unit: '%' });
  const plan = e.createValuePlan({ goalId: goal.id }); // goal still Proposed
  assert.throws(() => e.activateValuePlan(plan.id), ConstraintViolation, 'goal not Active → refuse');
  assert.strictEqual(e.get('valuePlans', plan.id).status, 'Proposed');
  e.activateStrategicGoal(goal.id);
  assert.strictEqual(e.activateValuePlan(plan.id).ok, true, 'activates under Active goal');
});

// ── Proof 3: many-to-many — one Value Indicator on two Operational Goals ──
check('3. One Value Indicator links to two Operational Goals (many-to-many)', () => {
  const { e, plan } = activeChain();
  const og1 = e.createOperationalGoal({ valuePlanId: plan.id, name: 'OG1' });
  const og2 = e.createOperationalGoal({ valuePlanId: plan.id, name: 'OG2' });
  const shared = e.createValueIndicator({ name: 'NPS', indicatorType: 'lagging', value: 50, unit: 'score', supportedBy: [] });
  e.linkIndicator(og1.id, shared.id);
  e.linkIndicator(og2.id, shared.id);
  const join = require('../engine/join');
  assert.deepStrictEqual(join.goalIdsFor(e.store, shared.id).sort(), [og1.id, og2.id].sort());
});

// ── Proof 4: aggregation dedups a shared Value Indicator (per unit) ──
check('4. measurableValue does not double-count a shared indicator (grouped per unit)', () => {
  const { e, plan } = activeChain();
  const og1 = e.createOperationalGoal({ valuePlanId: plan.id, name: 'OG1' });
  const og2 = e.createOperationalGoal({ valuePlanId: plan.id, name: 'OG2' });
  const shared = e.createValueIndicator({ name: 'Revenue', indicatorType: 'lagging', value: 100, unit: 'EUR', supportedBy: [] });
  const a = e.createValueIndicator({ name: 'A', indicatorType: 'leading', value: 10, unit: 'EUR', supportedBy: [] });
  const b = e.createValueIndicator({ name: 'B', indicatorType: 'leading', value: 5, unit: 'EUR', supportedBy: [] });
  const hrs = e.createValueIndicator({ name: 'Time saved', indicatorType: 'leading', value: 3, unit: 'hours', supportedBy: [] });
  e.linkIndicator(og1.id, shared.id); e.linkIndicator(og1.id, a.id); e.linkIndicator(og1.id, hrs.id);
  e.linkIndicator(og2.id, shared.id); e.linkIndicator(og2.id, b.id); // shared appears on both
  const mv = e.measurableValue(plan.id);
  assert.strictEqual(mv.count, 4, 'four DISTINCT indicators');
  assert.strictEqual(mv.perUnit.EUR, 115, 'EUR = 100 (once) + 10 + 5, not 215');
  assert.strictEqual(mv.perUnit.hours, 3, 'other unit grouped separately');
});

// ── Proof 5: inert fields exist but drive no behaviour ──
check('5. Inert fields exist but change no behaviour', () => {
  const e = new Engine();
  const intent = e.createStrategicIntent({ name: 'Profit', brand: 'someBrand' });
  assert.strictEqual(intent.brand, 'someBrand', 'brand stored');
  const goal = e.createStrategicGoal({ intentId: intent.id, name: 'G', targetValue: 1, unit: 'x' });
  e.activateStrategicGoal(goal.id);
  // Identity-agnostic refs: arbitrary opaque values, no validation, no effect.
  const plan = e.createValuePlan({
    goalId: goal.id,
    accountableRef: 'whatever-123', responsibleRefs: ['x', 'y'],
    playbookRef: 'pb-1', volatility: 'high',
  });
  const r1 = e.activateValuePlan(plan.id);
  // A second identical plan with NO inert fields set must behave identically.
  const plan2 = e.createValuePlan({ goalId: goal.id });
  const r2 = e.activateValuePlan(plan2.id);
  assert.deepStrictEqual([r1.ok, r1.warnings], [r2.ok, r2.warnings], 'inert fields do not alter outcome');
  assert.strictEqual(e.get('valuePlans', plan.id).status, e.get('valuePlans', plan2.id).status);
});

// ── Proof 6: updatedAt changes on transition; createdAt does not ──
check('6. updatedAt advances on a transition, createdAt stays fixed', () => {
  const { e, goal } = activeChain(); // goal already went Proposed→Active
  const g = e.get('strategicGoals', goal.id);
  assert.notStrictEqual(g.updatedAt, g.createdAt, 'updatedAt advanced past createdAt');
  const before = g.updatedAt;
  e.achieve('StrategicGoal', 'strategicGoals', goal.id);
  const after = e.get('strategicGoals', goal.id);
  assert.ok(after.updatedAt > before, 'updatedAt advances again');
  assert.strictEqual(after.createdAt, g.createdAt, 'createdAt unchanged');
});

// ── Proof 7: rejected activation throws the CORRECT typed error ──
check('7. A rejected activation throws a typed error, not a generic Error', () => {
  const { e, plan } = activeChain();
  const og = e.createOperationalGoal({ valuePlanId: plan.id, name: 'X' });
  let caught;
  try { e.activateOperationalGoal(og.id); } catch (err) { caught = err; }
  assert.ok(caught instanceof ConstraintViolation, 'ConstraintViolation, not generic Error');
  assert.strictEqual(caught.name, 'ConstraintViolation');
  assert.ok(caught.details && caught.details.operationalGoalId === og.id, 'carries structured details');
  // and an illegal lifecycle move is a LifecycleViolation
  assert.throws(() => e.retire('OperationalGoal', 'operationalGoals', og.id) && e.activateOperationalGoal(og.id),
    LifecycleViolation);
});

// ── Extra proof: Retire Goal preserves the Value Plan's goalId (audit) ──
check('Extra. Retiring a Goal preserves the Value Plan → Goal relation', () => {
  const { e, goal, plan } = activeChain();
  e.retireStrategicGoal(goal.id);
  assert.strictEqual(e.get('strategicGoals', goal.id).status, 'Retired');
  assert.strictEqual(e.get('valuePlans', plan.id).goalId, goal.id, 'goalId still points to the retired goal');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
