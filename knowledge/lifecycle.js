'use strict';
// Lifecycle rules for the knowledge layer.
// - Advice Record: a small state machine (assertCanTransition throws LifecycleViolation).
// - Memory Entry: ADDITIVE — no status machine; supersede is the only allowed change.
// - Decision Record: IMMUTABLE — no machine at all (enforced in constraints/facade).
const { LifecycleViolation } = require('../engine/errors');

const ADVICE = {
  initial: 'Proposed',
  transitions: {
    Proposed:   ['Accepted', 'Rejected'],
    Accepted:   ['Superseded'],
    Rejected:   [],   // terminal — kept, never deleted
    Superseded: [],   // terminal — kept, never deleted
  },
};

function adviceInitialStatus() { return ADVICE.initial; }

function assertCanTransitionAdvice(from, to) {
  if (!(ADVICE.transitions[from] || []).includes(to)) {
    throw new LifecycleViolation(`illegal Advice transition ${from} -> ${to}`, { from, to });
  }
}

module.exports = { ADVICE, adviceInitialStatus, assertCanTransitionAdvice };
