'use strict';
// Precondition checks used at status transitions. Hard constraints throw typed errors;
// the soft constraint returns warnings. These are pure functions over the store.
const { get, all } = require('./store/MemoryStore');
const { hasAnyIndicator } = require('./join');
const { ConstraintViolation, ReferenceViolation } = require('./errors');

const MAX_ACTIVE_OPERATIONAL_GOALS = 5; // SOFT

// HARD: an Operational Goal cannot go Active without >=1 linked Value Indicator.
// Enforced on the JOIN layer (presence of a join row), not a not-null column.
function assertOperationalGoalActivatable(store, operationalGoalId) {
  if (!hasAnyIndicator(store, operationalGoalId)) {
    throw new ConstraintViolation(
      'Operational Goal cannot go Active without at least one Value Indicator',
      { operationalGoalId }
    );
  }
}

// HARD: a Value Plan going Active must reference an EXISTING and ACTIVE Strategic Goal
// (Active layer: an Active Value Plan belongs to exactly one Active Strategic Goal).
function assertValuePlanActivatable(store, valuePlan) {
  const goal = valuePlan.goalId && get(store, 'strategicGoals', valuePlan.goalId);
  if (!goal) {
    throw new ReferenceViolation('Value Plan has no valid goalId', {
      valuePlanId: valuePlan.id, goalId: valuePlan.goalId,
    });
  }
  if (goal.status !== 'Active') {
    throw new ConstraintViolation('Value Plan can only go Active under an Active Strategic Goal', {
      valuePlanId: valuePlan.id, goalId: goal.id, goalStatus: goal.status,
    });
  }
}

// SOFT: warn (do not block) when a Value Plan would exceed 5 active Operational Goals.
function activeOperationalGoalWarnings(store, valuePlanId) {
  const activeCount = all(store, 'operationalGoals')
    .filter((og) => og.valuePlanId === valuePlanId && og.status === 'Active').length;
  if (activeCount > MAX_ACTIVE_OPERATIONAL_GOALS) {
    return [`Value Plan ${valuePlanId} has ${activeCount} active Operational Goals (soft max ${MAX_ACTIVE_OPERATIONAL_GOALS})`];
  }
  return [];
}

module.exports = {
  MAX_ACTIVE_OPERATIONAL_GOALS,
  assertOperationalGoalActivatable,
  assertValuePlanActivatable,
  activeOperationalGoalWarnings,
};
