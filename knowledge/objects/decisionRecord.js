'use strict';
// Decision Record — records a made decision, typically the answer to an Advice.
// IMMUTABLE after creation: no status cycle, no updates. A revised decision is a NEW
// record that supersedes the old (supersedesRef). Object.freeze is defense-in-depth;
// the facade additionally refuses any mutation with a typed ConstraintViolation.
const { newId } = require('../../engine/ids');
const { nowIso } = require('../../engine/clock');
const { ConstraintViolation } = require('../../engine/errors');

const OUTCOMES = ['accepted', 'rejected', 'deferred'];

function createDecisionRecord({
  title,
  body,
  outcome,
  rationale,                 // REQUIRED (canonical field, mandatory on Decision)
  adviceRef = null,          // optional — a Decision without advice is allowed
  valuePlanId,               // flat id-ref, exactly one (validity checked in facade)
  decidedBy = null,          // INERT, identity-agnostic
  supersedesRef = null,      // points back to the decision this one revises
} = {}) {
  if (!title) throw new ConstraintViolation('Decision requires title', {});
  if (body === undefined || body === null || body === '') {
    throw new ConstraintViolation('Decision requires body', {});
  }
  if (!OUTCOMES.includes(outcome)) {
    throw new ConstraintViolation('Decision outcome out of bounds', { outcome, allowed: OUTCOMES });
  }
  if (rationale === undefined || rationale === null || rationale === '') {
    throw new ConstraintViolation('Decision requires rationale', {});
  }
  const rec = {
    id: newId('dec'),
    type: 'DecisionRecord',
    title,
    body,
    outcome,
    rationale,
    adviceRef,
    valuePlanId,
    decidedBy,
    supersedesRef,
    createdAt: nowIso(),
    // no updatedAt: a Decision Record is immutable; it never changes after creation.
  };
  return Object.freeze(rec); // defense-in-depth immutability
}

module.exports = { createDecisionRecord, OUTCOMES };
