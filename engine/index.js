'use strict';
// Engine facade — the deterministic business core. Holds a store, creates canonical
// objects (validating parent references), and moves them through their lifecycles.
// EVERY mutation touches updatedAt in one place (`_transition`), so the field can
// never go stale. All failures are typed errors (errors.js), never generic Error.

const { createStore, get, put } = require('./store/MemoryStore');
const { nowIso } = require('./clock');
const { assertCanTransition } = require('./lifecycle');
const { ReferenceViolation } = require('./errors');

const { createStrategicIntent } = require('./objects/strategicIntent');
const { createStrategicGoal }   = require('./objects/strategicGoal');
const { createValuePlan }       = require('./objects/valuePlan');
const { createOperationalGoal } = require('./objects/operationalGoal');
const { createValueIndicator }  = require('./objects/valueIndicator');

const join = require('./join');
const {
  assertOperationalGoalActivatable,
  assertValuePlanActivatable,
  activeOperationalGoalWarnings,
} = require('./constraints');
const { computeMeasurableValue } = require('./aggregation');

class Engine {
  constructor() { this.store = createStore(); }

  // ── creation (parent before child; refs validated with typed errors) ──
  createStrategicIntent(spec) {
    return put(this.store, 'strategicIntents', createStrategicIntent(spec));
  }

  createStrategicGoal(spec) {
    if (!get(this.store, 'strategicIntents', spec.intentId)) {
      throw new ReferenceViolation('Strategic Goal references unknown Strategic Intent', { intentId: spec.intentId });
    }
    return put(this.store, 'strategicGoals', createStrategicGoal(spec));
  }

  createValuePlan(spec) {
    if (!get(this.store, 'strategicGoals', spec.goalId)) {
      throw new ReferenceViolation('Value Plan references unknown Strategic Goal', { goalId: spec.goalId });
    }
    return put(this.store, 'valuePlans', createValuePlan(spec));
  }

  createOperationalGoal(spec) {
    if (!get(this.store, 'valuePlans', spec.valuePlanId)) {
      throw new ReferenceViolation('Operational Goal references unknown Value Plan', { valuePlanId: spec.valuePlanId });
    }
    return put(this.store, 'operationalGoals', createOperationalGoal(spec));
  }

  createValueIndicator(spec) {
    return put(this.store, 'valueIndicators', createValueIndicator(spec));
  }

  // ── many-to-many link ──
  linkIndicator(operationalGoalId, valueIndicatorId) {
    return join.link(this.store, operationalGoalId, valueIndicatorId);
  }

  // ── the ONE mutation point: lifecycle check -> hard guard -> mutate + touch -> soft warn ──
  _transition(type, obj, next, hardGuard, softWarn) {
    assertCanTransition(type, obj.status, next); // throws LifecycleViolation
    if (hardGuard) hardGuard();                  // throws ConstraintViolation / ReferenceViolation
    obj.status = next;
    obj.updatedAt = nowIso();                    // never stale
    return { ok: true, warnings: softWarn ? softWarn() : [] };
  }

  activateStrategicGoal(id) {
    return this._transition('StrategicGoal', this._req('strategicGoals', id), 'Active');
  }

  activateValuePlan(id) {
    const vp = this._req('valuePlans', id);
    return this._transition('ValuePlan', vp, 'Active',
      () => assertValuePlanActivatable(this.store, vp));
  }

  activateOperationalGoal(id) {
    const og = this._req('operationalGoals', id);
    return this._transition('OperationalGoal', og, 'Active',
      () => assertOperationalGoalActivatable(this.store, og.id),
      () => activeOperationalGoalWarnings(this.store, og.valuePlanId));
  }

  // generic terminal-ish transitions (no guards): Achieve / Retire
  achieve(type, coll, id) { return this._transition(type, this._req(coll, id), 'Achieved'); }
  retire(type, coll, id)  { return this._transition(type, this._req(coll, id), 'Retired'); }

  // Retiring a Goal preserves the historical relation: Value Plans keep their goalId.
  retireStrategicGoal(id) { return this.retire('StrategicGoal', 'strategicGoals', id); }
  retireStrategicIntent(id) { return this.retire('StrategicIntent', 'strategicIntents', id); }

  // ── computed measurable value (consumed, never stored) ──
  measurableValue(valuePlanId) { return computeMeasurableValue(this.store, valuePlanId); }

  // ── read helpers ──
  get(coll, id) { return get(this.store, coll, id); }
  _req(coll, id) {
    const o = get(this.store, coll, id);
    if (!o) throw new ReferenceViolation(`unknown ${coll} '${id}'`, { coll, id });
    return o;
  }
}

module.exports = { Engine };
