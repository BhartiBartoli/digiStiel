'use strict';
// Operational Goal — measurable, execution-linked. Child of Value Plan (valuePlanId).
// HARD constraint (enforced at the join layer on the transition to Active):
// an Operational Goal cannot go Active without >=1 linked Value Indicator.
const { newId } = require('../ids');
const { nowIso } = require('../clock');
const { initialStatus } = require('../lifecycle');

function createOperationalGoal({ valuePlanId, name } = {}) {
  const ts = nowIso();
  return {
    id: newId('og'),
    type: 'OperationalGoal',
    valuePlanId,           // parent reference
    name,
    status: initialStatus('OperationalGoal'), // 'Proposed'
    createdAt: ts,
    updatedAt: ts,
  };
}

module.exports = { createOperationalGoal };
