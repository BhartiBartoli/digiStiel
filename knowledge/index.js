'use strict';
// KnowledgeLayer facade — Brok B. Stores and anchors Memory, Advice, Decision. Reads the
// engine only through an injected `valuePlanExists(id)` so the dependency stays one-way
// (knowledge -> engine, never the reverse). All failures are typed engine errors.
const { createKnowledgeStore, get, put } = require('./store/KnowledgeStore');
const { nowIso } = require('../engine/clock');
const { ReferenceViolation } = require('../engine/errors');

const { createMemoryEntry }   = require('./objects/memoryEntry');
const { createAdviceRecord }  = require('./objects/adviceRecord');
const { createDecisionRecord }= require('./objects/decisionRecord');
const { assertCanTransitionAdvice } = require('./lifecycle');
const { assertValuePlanRef, refuseDecisionMutation } = require('./constraints');
const currentness = require('./currentness');

class KnowledgeLayer {
  constructor({ valuePlanExists } = {}) {
    if (typeof valuePlanExists !== 'function') {
      throw new ReferenceViolation('KnowledgeLayer requires valuePlanExists(id) to validate Value Plan refs', {});
    }
    this.valuePlanExists = valuePlanExists;
    this.store = createKnowledgeStore();
  }

  // ── Memory (additive; trigger = value-impact) ──
  // Intake respects the storage trigger: memory arises on value-impact only.
  rememberIfImpactful(spec) {
    if (spec.impactRelevant !== true) return null; // not impactful → not stored
    return put(this.store, 'memoryEntries', createMemoryEntry({ ...spec, impactRelevant: true }));
  }

  supersedeMemory(oldId, newSpec) {
    const old = this._req('memoryEntries', oldId);
    const next = put(this.store, 'memoryEntries', createMemoryEntry({ ...newSpec, impactRelevant: newSpec.impactRelevant !== false }));
    old.supersededByRef = next.id; // additive supersede; content untouched, lineage kept
    old.updatedAt = nowIso();
    return next;
  }

  // ── Advice (may be AI-generated) ──
  createAdvice(spec) {
    assertValuePlanRef(this.valuePlanExists, spec.valuePlanId, 'Advice');
    return put(this.store, 'adviceRecords', createAdviceRecord(spec));
  }

  acceptAdvice(id) { return this._adviceTransition(id, 'Accepted'); }
  rejectAdvice(id) { return this._adviceTransition(id, 'Rejected'); }

  supersedeAdvice(oldId, newSpec) {
    const old = this._req('adviceRecords', oldId);
    assertCanTransitionAdvice(old.status, 'Superseded'); // only Accepted -> Superseded
    assertValuePlanRef(this.valuePlanExists, newSpec.valuePlanId, 'Advice');
    const next = put(this.store, 'adviceRecords', createAdviceRecord({ ...newSpec, supersedesRef: oldId }));
    old.status = 'Superseded';
    old.updatedAt = nowIso();
    return next;
  }

  _adviceTransition(id, to) {
    const a = this._req('adviceRecords', id);
    assertCanTransitionAdvice(a.status, to); // throws LifecycleViolation
    a.status = to;
    a.updatedAt = nowIso();
    return a;
  }

  // ── Decision (immutable) ──
  recordDecision(spec) {
    assertValuePlanRef(this.valuePlanExists, spec.valuePlanId, 'Decision');
    if (spec.adviceRef && !get(this.store, 'adviceRecords', spec.adviceRef)) {
      throw new ReferenceViolation('Decision references unknown Advice', { adviceRef: spec.adviceRef });
    }
    return put(this.store, 'decisionRecords', createDecisionRecord(spec));
  }

  // A revision is a NEW Decision that supersedes the old; the old is never mutated.
  reviseDecision(oldId, newSpec) {
    this._req('decisionRecords', oldId);
    return this.recordDecision({ ...newSpec, supersedesRef: oldId });
  }

  // Any attempt to mutate/status-change a Decision is refused with a typed error.
  updateDecision(id) { return refuseDecisionMutation(id); }
  setDecisionStatus(id) { return refuseDecisionMutation(id); }

  // ── reads / computed currentness ──
  get(coll, id) { return get(this.store, coll, id); }
  currentMemory(tenantId) { return currentness.currentMemory(this.store, tenantId); }
  currentAdviceFor(valuePlanId) { return currentness.currentAdviceFor(this.store, valuePlanId); }
  currentDecisionFor(valuePlanId) { return currentness.currentDecisionFor(this.store, valuePlanId); }

  _req(coll, id) {
    const o = get(this.store, coll, id);
    if (!o) throw new ReferenceViolation(`unknown ${coll} '${id}'`, { coll, id });
    return o;
  }
}

module.exports = { KnowledgeLayer };
