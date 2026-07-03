'use strict';
// CUSTOMER VALIDATION GATE — a PRECONDITION on the Value Plan Proposed→Active transition.
//
// "Understanding precedes Automation." Before a Value Plan may be committed (activated), the
// As-Is understanding must have been validated by the customer. This gate checks a
// validatedAt/validatedBy flag on the SOURCE discovery/memory context that is passed in — it is
// NOT a field on the Value Plan and NOT a new stored object. Missing/empty validation → refused.
//
// GUARANTEE 1 — Validation is a PRECONDITION, not an Approval/Authorization/Decision. It only
// confirms that the As-Is situation was correctly understood. This gate is a factual check on
// "is the As-Is confirmed?", never authorization- or decision-logic.
//
// GUARANTEE 4 — The gate guards COMMITMENT, not interpretation. It may ONLY block the Value Plan
// activation/commitment transition — never knowledge-forming, never evaluation. Observation,
// Advice, Judgement, Trust and Governance Verdict always remain allowed, also without validation
// (see decision-intelligence/*.js — those are pure reads that never touch this gate).
//
// There is exactly ONE managed activation gate here (activateValuePlan); no second bypass path.
const { ConstraintViolation } = require('../../engine/errors');

// Pure precondition: the source context must carry a non-empty validatedAt AND validatedBy.
function assertCustomerValidated(validationContext) {
  const ctx = validationContext || {};
  const ok = !!ctx.validatedAt && !!ctx.validatedBy;
  if (!ok) {
    throw new ConstraintViolation('Value Plan activation requires validated As-Is understanding', {
      validatedAt: ctx.validatedAt || null,
      validatedBy: ctx.validatedBy || null,
    });
  }
}

// The single managed activation gate: validate As-Is, THEN delegate to the engine's Brok A
// Proposed→Active mechanic. Every managed activation flows through here — there is no second,
// ungated managed activation twin.
function activateValuePlan(engine, valuePlanId, validationContext) {
  assertCustomerValidated(validationContext); // precondition — refuses before any transition
  return engine.activateValuePlan(valuePlanId);
}

module.exports = { assertCustomerValidated, activateValuePlan };
