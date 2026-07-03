'use strict';
// Decision Record — records a made decision, typically the answer to an Advice.
// IMMUTABLE after creation: no status cycle, no updates. A revised decision is a NEW
// record that supersedes the old (supersedesRef). Object.freeze is defense-in-depth;
// the facade additionally refuses any mutation with a typed ConstraintViolation.
const { newId } = require('../../engine/ids');
const { nowIso } = require('../../engine/clock');
const { ConstraintViolation } = require('../../engine/errors');

const OUTCOMES = ['accepted', 'rejected', 'deferred'];

// Brok C — identity-AGNOSTIC actor enums (no link to a concrete User/Partner/Agent type;
// that is the later Identity & Access Architecture). "Recording is not deciding": authority
// and recorder are kept as TWO separate fields, never folded together.
// decisionAuthority = who makes the business commitment. MVP-active value: 'customer'.
// The other three exist but are INERT (no code branches on them) — deel 3 will refuse
// 'autonomous-platform' etc.; here they only pass enum validation.
const AUTHORITIES = ['customer', 'autonomous-platform', 'partner', 'human-operator'];
// decisionRecorder = who registers the commitment. MVP-active value: 'platform'.
const RECORDERS = ['platform', 'customer', 'partner', 'human-operator'];

function createDecisionRecord({
  title,
  body,
  outcome,
  rationale,                 // REQUIRED (canonical field, mandatory on Decision)
  adviceRef = null,          // optional — a Decision without advice is allowed
  valuePlanId,               // flat id-ref, exactly one (validity checked in facade)
  decidedBy = null,          // INERT, identity-agnostic
  supersedesRef = null,      // points back to the decision this one revises
  decisionAuthority,         // required, defaults to 'customer'
  decisionRecorder,          // required, defaults to 'platform'
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
  // MVP defaults; both required (always set). Explicit values must be in-enum.
  const authority = decisionAuthority ?? 'customer';
  const recorder  = decisionRecorder  ?? 'platform';
  if (!AUTHORITIES.includes(authority)) {
    throw new ConstraintViolation('Decision decisionAuthority out of bounds', { decisionAuthority: authority, allowed: AUTHORITIES });
  }
  if (!RECORDERS.includes(recorder)) {
    throw new ConstraintViolation('Decision decisionRecorder out of bounds', { decisionRecorder: recorder, allowed: RECORDERS });
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
    // authority (who commits) and recorder (who registers) — SEPARATE fields, not folded.
    decisionAuthority: authority,
    decisionRecorder: recorder,
    supersedesRef,
    createdAt: nowIso(),
    // no updatedAt: a Decision Record is immutable; it never changes after creation.
  };
  return Object.freeze(rec); // defense-in-depth immutability (incl. the new Brok C fields)
}

module.exports = { createDecisionRecord, OUTCOMES, AUTHORITIES, RECORDERS };
