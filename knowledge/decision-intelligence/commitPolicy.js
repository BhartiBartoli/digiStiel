'use strict';
// AUTONOMOUS-AUTHORITY REFUSAL — a Decision (commitment) requires a decisionAuthority; in the
// MVP (Managed Execution) only 'customer' may commit. 'autonomous-platform', 'partner' and
// 'human-operator' are refused as commitment authority.
//
// GUARANTEE 3 — This refusal is MVP-POLICY, not an architecture limit. The categories
// autonomous-platform/partner/human-operator REMAIN part of the architecture — they exist in the
// deel-1 AUTHORITIES enum, are structurally provided for, and are merely non-active in the MVP.
// The refusal references the MVP-policy constant ACTIVE_COMMIT_AUTHORITIES, NOT a hardcoded
// "autonomous is forbidden". These authorities are inert tot mandaat/Identity & Access, geen
// fundamentele beperking — latere activering wijzigt de policy-constante, niet de structuur
// (Reserve, Don't Activate).
const { ConstraintViolation } = require('../../engine/errors');
const { AUTHORITIES } = require('../objects/decisionRecord'); // deel-1 enum — reused, not rebuilt

// MVP policy: the ONLY authority that may commit. Widening this constant (not the structure)
// re-activates a reserved authority.
const ACTIVE_COMMIT_AUTHORITIES = ['customer'];

// Pure precondition. `activeAuthorities` defaults to the policy constant; it is an injectable
// parameter purely so a caller/test can demonstrate that widening the POLICY (not the code)
// lifts the refusal — proof that this is policy, not a hardcoded ban.
function assertCommitAuthority(spec, activeAuthorities = ACTIVE_COMMIT_AUTHORITIES) {
  // Derive the authority exactly as createDecisionRecord does (default 'customer').
  const authority = (spec && spec.decisionAuthority) || 'customer';
  if (!activeAuthorities.includes(authority)) {
    throw new ConstraintViolation('Commit authority not active in MVP policy', {
      authority,
      active: activeAuthorities,
    });
  }
}

// The single managed commit gate: enforce the commit-authority policy, THEN delegate to the
// knowledge layer's Decision recorder. The inert enum values stay valid at record level (deel 1);
// this gate refuses them only as ACTIVE commit authority.
function commitDecision(knowledge, spec, activeAuthorities = ACTIVE_COMMIT_AUTHORITIES) {
  assertCommitAuthority(spec, activeAuthorities);
  return knowledge.recordDecision(spec);
}

module.exports = { ACTIVE_COMMIT_AUTHORITIES, assertCommitAuthority, commitDecision, AUTHORITIES };
