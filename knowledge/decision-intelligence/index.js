'use strict';
// Decision Intelligence — the four computed evaluations over the canonical history.
// "Judgement is transient. Decision is persistent." These are PURE functions; the layer
// stores nothing and is never a second Knowledge layer. See each module for guarantees.
const { makeWorld } = require('./world');
const { computeJudgement } = require('./judgement');
const { computeTrust } = require('./trust');
const { computeGovernanceVerdict, VERDICTS } = require('./governanceVerdict');
const { computeAuthorization, MANDATE_SOURCES, ACTIVE_MANDATE_SOURCES } = require('./authorization');
// Brok C deel 3 — the boundary that guards action without autonomy (gate + guard + policy).
const { assertCustomerValidated, requestValuePlanActivation } = require('./gate');
const { assertChainStart, guardCommitmentChainEntry } = require('./chainGuard');
const { ACTIVE_COMMIT_AUTHORITIES, assertCommitAuthority, commitDecision } = require('./commitPolicy');

module.exports = {
  makeWorld,
  computeJudgement,
  computeTrust,
  computeGovernanceVerdict,
  computeAuthorization,
  VERDICTS,
  MANDATE_SOURCES,
  ACTIVE_MANDATE_SOURCES,
  // deel 3 — preconditions/refusals (no new stored objects)
  assertCustomerValidated,
  requestValuePlanActivation, // the single managed activation gate (no bypass path)
  assertChainStart,
  guardCommitmentChainEntry,
  ACTIVE_COMMIT_AUTHORITIES,
  assertCommitAuthority,
  commitDecision,
};
