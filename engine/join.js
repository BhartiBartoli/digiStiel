'use strict';
// Operational Goal <-> Value Indicator: MANY-TO-MANY via a join table. There is NO
// parent-id on the Value Indicator — one indicator is shareable across many goals, and
// one goal has many indicators. This is the layer the HARD ">=1 indicator" precondition
// checks against (not a not-null column).
const { get } = require('./store/MemoryStore');
const { ReferenceViolation } = require('./errors');

function link(store, operationalGoalId, valueIndicatorId) {
  if (!get(store, 'operationalGoals', operationalGoalId)) {
    throw new ReferenceViolation('link: unknown Operational Goal', { operationalGoalId });
  }
  if (!get(store, 'valueIndicators', valueIndicatorId)) {
    throw new ReferenceViolation('link: unknown Value Indicator', { valueIndicatorId });
  }
  const exists = store.ogViLinks.some(
    (l) => l.operationalGoalId === operationalGoalId && l.valueIndicatorId === valueIndicatorId
  );
  if (!exists) store.ogViLinks.push({ operationalGoalId, valueIndicatorId });
  return { operationalGoalId, valueIndicatorId };
}

function indicatorIdsFor(store, operationalGoalId) {
  return store.ogViLinks
    .filter((l) => l.operationalGoalId === operationalGoalId)
    .map((l) => l.valueIndicatorId);
}

function goalIdsFor(store, valueIndicatorId) {
  return store.ogViLinks
    .filter((l) => l.valueIndicatorId === valueIndicatorId)
    .map((l) => l.operationalGoalId);
}

function hasAnyIndicator(store, operationalGoalId) {
  return store.ogViLinks.some((l) => l.operationalGoalId === operationalGoalId);
}

module.exports = { link, indicatorIdsFor, goalIdsFor, hasAnyIndicator };
