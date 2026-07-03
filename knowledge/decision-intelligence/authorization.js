'use strict';
// AUTHORIZATION — a computed judgement: may this transition/action proceed, given a mandate?
// It NEVER exists mandateless. It is ONLY a judgement: no object, no lifecycle, no record,
// no stored permission. It answers "may this action proceed within the mandate?" and
// executes nothing; the actual permission stays part of the business commitment (the
// Decision). It writes no "authorization granted" record.
//
// Mandate sources are INERT in the MVP (Managed Execution) except 'customer-approval', the
// ONLY active source. The other three exist as concept but no code path branches on them.
// Composition (guarantee 4): may call the verdict/judgement functions in-memory; persists nothing.
const { computeGovernanceVerdict } = require('./governanceVerdict');

const MANDATE_SOURCES = ['customer-approval', 'goal-budget', 'autonomy-budget', 'organizational-policy'];
const ACTIVE_MANDATE_SOURCES = ['customer-approval']; // MVP: only customer-approval is active

function computeAuthorization(world, action, mandate = null, context = {}) {
  // No mandate, or an inert (non-active) mandate source → no authorization. Never mandateless.
  const source = mandate && mandate.source;
  if (!source || !ACTIVE_MANDATE_SOURCES.includes(source)) {
    return {
      kind: 'Authorization',
      action,
      authorized: false,
      mandateSource: source || null,
      reason: !source ? 'no-mandate' : 'inert-mandate-source',
      computedAt: context.now || null,
    };
  }

  // Active mandate (customer-approval): judge against the value-plan governance in-memory.
  const verdict = action && action.valuePlanId
    ? computeGovernanceVerdict(world, action.valuePlanId, context)
    : null;
  // A 'Stop' verdict is a strong recommendation; it does not itself deny authorization —
  // the customer holds the mandate. Authorization here reflects mandate presence + validity.
  const authorized = true;

  return {
    kind: 'Authorization',
    action,
    authorized,
    mandateSource: source,
    reason: 'customer-approval',
    basis: { verdict },     // in-memory composition, not persisted
    computedAt: context.now || null,
  };
}

module.exports = { computeAuthorization, MANDATE_SOURCES, ACTIVE_MANDATE_SOURCES };
