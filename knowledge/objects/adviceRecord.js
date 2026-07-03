'use strict';
// Advice Record — advice on exactly one Value Plan; may be AI-generated (originType 'ai').
// Lifecycle in lifecycle.js. Superseded/Rejected advice is never deleted — history stays.
const { newId } = require('../../engine/ids');
const { nowIso } = require('../../engine/clock');
const { ConstraintViolation } = require('../../engine/errors');
const { adviceInitialStatus } = require('../lifecycle');

const ORIGIN_TYPES = ['ai', 'human'];

// Brok C — adviceForm classifies the KIND of knowledge. Critical semantic distinction:
// ONLY 'Recommendation' may later continue the reasoning chain toward Authorization/Decision.
// The other five (Observation/Insight/Warning/Question/Alternative) enrich the Knowledge
// layer only — they are NEVER a valid start for an Authorization/Decision chain. The chain
// guard itself is Brok C deel 3; here we only lay down the field + the isChainEligible
// distinction so deel 3 can build on it without a rebuild.
const ADVICE_FORMS = ['Observation', 'Insight', 'Warning', 'Question', 'Alternative', 'Recommendation'];

function createAdviceRecord({
  valuePlanId,               // flat id-ref, exactly one (validity checked in facade)
  title,
  body,
  rationale = null,          // optional here (canonical field; required on Decision)
  originType,
  adviceForm,                // required, bounded enum (ADVICE_FORMS)
  authorRef = null,          // INERT, identity-agnostic
  supersedesRef = null,      // points back to the advice this one supersedes
  supportedByMemoryRefs = [],// INERT collection {kind,ref} — Memory->Advice feeding is V2
} = {}) {
  if (!ORIGIN_TYPES.includes(originType)) {
    throw new ConstraintViolation('Advice originType out of bounds', { originType, allowed: ORIGIN_TYPES });
  }
  if (!ADVICE_FORMS.includes(adviceForm)) {
    throw new ConstraintViolation('Advice adviceForm out of bounds', { adviceForm, allowed: ADVICE_FORMS });
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
    adviceForm,
    authorRef,
    supersedesRef,
    supportedByMemoryRefs: [...supportedByMemoryRefs],
    createdAt: ts,
    updatedAt: ts,
  };
}

// Data-structure distinction for deel 3: only a 'Recommendation' is eligible to start a
// reasoning chain toward Authorization/Decision. This does NOT enforce a chain yet — it
// only exposes the distinction. Deel 3 adds the guard/gate.
function isChainEligible(advice) {
  return !!advice && advice.adviceForm === 'Recommendation';
}

module.exports = { createAdviceRecord, ORIGIN_TYPES, ADVICE_FORMS, isChainEligible };
