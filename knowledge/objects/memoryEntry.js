'use strict';
// Memory Entry — one tenant, simplified. One Entry = ONE value-relevant datum (not a
// whole conversation). ADDITIVE: entries are never mutated in content, only appended or
// superseded. Current version = COMPUTED (no supersededByRef). Lineage is preserved.
const { newId } = require('../../engine/ids');
const { nowIso } = require('../../engine/clock');
const { ConstraintViolation } = require('../../engine/errors');

const SOURCE_TYPES = ['discovery', 'interaction', 'advice_outcome'];
const MEMORY_TYPES  = ['Observation', 'Fact', 'Preference', 'Constraint', 'Question'];

function createMemoryEntry({
  tenantId,
  sourceType,
  memoryType,
  content,
  relatedRefs = [],       // collection of {kind, ref} — id-refs, never embedded copies
  impactRelevant,
  supersededByRef = null, // null = current version
  volatility = null,      // INERT
} = {}) {
  if (!tenantId) throw new ConstraintViolation('Memory Entry requires tenantId', { tenantId });
  if (!SOURCE_TYPES.includes(sourceType)) {
    throw new ConstraintViolation('Memory Entry sourceType out of bounds', { sourceType, allowed: SOURCE_TYPES });
  }
  if (!MEMORY_TYPES.includes(memoryType)) {
    throw new ConstraintViolation('Memory Entry memoryType out of bounds', { memoryType, allowed: MEMORY_TYPES });
  }
  if (content === undefined || content === null || content === '') {
    throw new ConstraintViolation('Memory Entry requires content', {});
  }
  if (typeof impactRelevant !== 'boolean') {
    throw new ConstraintViolation('Memory Entry requires impactRelevant (boolean)', { impactRelevant });
  }
  if (!Array.isArray(relatedRefs)) {
    throw new ConstraintViolation('relatedRefs must be a collection (array)', { relatedRefs });
  }
  for (const r of relatedRefs) {
    if (!r || typeof r.kind !== 'string' || r.ref === undefined) {
      throw new ConstraintViolation('relatedRefs entries must be { kind, ref }', { r });
    }
  }
  const ts = nowIso();
  return {
    id: newId('mem'),
    type: 'MemoryEntry',
    tenantId,
    sourceType,
    memoryType,
    content,
    relatedRefs: [...relatedRefs],
    impactRelevant,
    supersededByRef,
    volatility,
    createdAt: ts,
    updatedAt: ts,
  };
}

module.exports = { createMemoryEntry, SOURCE_TYPES, MEMORY_TYPES };
