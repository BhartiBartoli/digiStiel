'use strict';
// Strategic Goal — time-bound, quantifiable. Child of Strategic Intent (intentId).
// Create-constraint: targetValue + unit are REQUIRED (quantification at the source).
const { newId } = require('../ids');
const { nowIso } = require('../clock');
const { initialStatus } = require('../lifecycle');
const { ConstraintViolation } = require('../errors');

function createStrategicGoal({ intentId, name, targetValue, unit, weight = null } = {}) {
  if (targetValue === undefined || targetValue === null || unit === undefined || unit === null || unit === '') {
    throw new ConstraintViolation('Strategic Goal requires targetValue and unit', {
      object: 'StrategicGoal', targetValue, unit,
    });
  }
  const ts = nowIso();
  return {
    id: newId('sg'),
    type: 'StrategicGoal',
    intentId,              // parent reference
    name,
    targetValue,
    unit,
    weight,                // customer-set (optional)
    status: initialStatus('StrategicGoal'), // 'Proposed'
    createdAt: ts,
    updatedAt: ts,
  };
}

module.exports = { createStrategicGoal };
