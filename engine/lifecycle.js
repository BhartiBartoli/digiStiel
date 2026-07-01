'use strict';
// Lifecycle state machines for the canonical objects. Each type declares its
// allowed status transitions. `assertCanTransition` throws a typed
// LifecycleViolation on an illegal move; the actual mutation (status + updatedAt)
// happens in the Engine facade so every mutation touches updatedAt in one place.

const { LifecycleViolation } = require('./errors');

// Strategic Intent deviates: starts Active, Active -> Retired, no Proposed/Achieved.
const INTENT = {
  initial: 'Active',
  transitions: { Active: ['Retired'], Retired: [] },
};

// Goal / Value Plan / Operational Goal share the full cycle.
const FULL = {
  initial: 'Proposed',
  transitions: {
    Proposed: ['Active', 'Retired'],
    Active:   ['Achieved', 'Retired'],
    Achieved: ['Retired'],
    Retired:  [],
  },
};

const MACHINES = {
  StrategicIntent:  INTENT,
  StrategicGoal:    FULL,
  ValuePlan:        FULL,
  OperationalGoal:  FULL,
};

function machine(type) {
  const m = MACHINES[type];
  if (!m) throw new LifecycleViolation(`unknown lifecycle type '${type}'`, { type });
  return m;
}

function initialStatus(type) { return machine(type).initial; }

function canTransition(type, from, to) {
  return (machine(type).transitions[from] || []).includes(to);
}

function assertCanTransition(type, from, to) {
  if (!canTransition(type, from, to)) {
    throw new LifecycleViolation(`illegal ${type} transition ${from} -> ${to}`, { type, from, to });
  }
}

module.exports = { MACHINES, initialStatus, canTransition, assertCanTransition };
