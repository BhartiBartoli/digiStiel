'use strict';
// Decision Intelligence — the four computed evaluations over the canonical history.
// "Judgement is transient. Decision is persistent." These are PURE functions; the layer
// stores nothing and is never a second Knowledge layer. See each module for guarantees.
const { makeWorld } = require('./world');
const { computeJudgement } = require('./judgement');
const { computeTrust } = require('./trust');
const { computeGovernanceVerdict, VERDICTS } = require('./governanceVerdict');
const { computeAuthorization, MANDATE_SOURCES, ACTIVE_MANDATE_SOURCES } = require('./authorization');

module.exports = {
  makeWorld,
  computeJudgement,
  computeTrust,
  computeGovernanceVerdict,
  computeAuthorization,
  VERDICTS,
  MANDATE_SOURCES,
  ACTIVE_MANDATE_SOURCES,
};
