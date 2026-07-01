'use strict';
// Typed errors from day one. Governance (and any caller) must be able to branch on
// the FAILURE TYPE without parsing a string. Every engine failure is one of these.

class EngineError extends Error {
  constructor(message, details) {
    super(message);
    this.name = this.constructor.name;
    this.details = details || {};
  }
}

// A hard business rule was violated (e.g. Operational Goal Active without a Value Indicator).
class ConstraintViolation extends EngineError {}
// An illegal lifecycle transition was attempted (e.g. Retired -> Active).
class LifecycleViolation extends EngineError {}
// A referenced object is missing or invalid (e.g. Value Plan with no valid goalId).
class ReferenceViolation extends EngineError {}
// Aggregation could not be computed coherently.
class AggregationError extends EngineError {}

module.exports = {
  EngineError,
  ConstraintViolation,
  LifecycleViolation,
  ReferenceViolation,
  AggregationError,
};
