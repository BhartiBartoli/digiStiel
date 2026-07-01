'use strict';
// Cross-layer and record-level constraint checks. All throw typed engine errors.
const { ReferenceViolation, ConstraintViolation } = require('../engine/errors');

// A Value Plan reference must resolve (no orphan Advice/Decision). valuePlanExists is
// injected by the facade (backed by the engine) so the engine stays unaware of knowledge.
function assertValuePlanRef(valuePlanExists, valuePlanId, context) {
  if (!valuePlanId || !valuePlanExists(valuePlanId)) {
    throw new ReferenceViolation(`${context}: unknown or missing valuePlanId`, { valuePlanId });
  }
}

// Decision Records are immutable — any mutation/status-change attempt is refused with a
// typed error (not a generic Error), directing the caller to create a superseding record.
function refuseDecisionMutation(decisionId) {
  throw new ConstraintViolation(
    'Decision Record is immutable; create a new record with supersedesRef instead',
    { decisionId }
  );
}

module.exports = { assertValuePlanRef, refuseDecisionMutation };
