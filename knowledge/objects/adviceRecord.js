'use strict';
// Advice Record — advice on exactly one Value Plan; may be AI-generated (originType 'ai').
// Lifecycle in lifecycle.js. Superseded/Rejected advice is never deleted — history stays.
const { newId } = require('../../engine/ids');
const { nowIso } = require('../../engine/clock');
const { ConstraintViolation } = require('../../engine/errors');
const { adviceInitialStatus } = require('../lifecycle');

const ORIGIN_TYPES = ['ai', 'human'];

function createAdviceRecord({
  valuePlanId,               // flat id-ref, exactly one (validity checked in facade)
  title,
  body,
  rationale = null,          // optional here (canonical field; required on Decision)
  originType,
  authorRef = null,          // INERT, identity-agnostic
  supersedesRef = null,      // points back to the advice this one supersedes
  supportedByMemoryRefs = [],// INERT collection {kind,ref} — Memory->Advice feeding is V2
} = {}) {
  if (!ORIGIN_TYPES.includes(originType)) {
    throw new ConstraintViolation('Advice originType out of bounds', { originType, allowed: ORIGIN_TYPES });
  }
  if (!title) throw new ConstraintViolation('Advice requires title', {});
  // body must be non-empty from Proposed onward (created as Proposed).
  if (body === undefined || body === null || body === '') {
    throw new ConstraintViolation('Advice body must not be empty from Proposed', {});
  }
  if (!Array.isArray(supportedByMemoryRefs)) {
    throw new ConstraintViolation('supportedByMemoryRefs must be a collection (array)', { supportedByMemoryRefs });
  }
  const ts = nowIso();
  return {
    id: newId('adv'),
    type: 'AdviceRecord',
    valuePlanId,
    title,
    body,
    rationale,
    status: adviceInitialStatus(), // 'Proposed'
    originType,
    authorRef,
    supersedesRef,
    supportedByMemoryRefs: [...supportedByMemoryRefs],
    createdAt: ts,
    updatedAt: ts,
  };
}

module.exports = { createAdviceRecord, ORIGIN_TYPES };
