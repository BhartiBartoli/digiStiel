'use strict';
// Value Indicator — own object (Value Measurement Architecture). Linked to Operational
// Goals many-to-many via the join table (NO parent-id here).
//
// supportedBy is a FIRST-CLASS, ACTIVE, REQUIRED multiple reference collection of
// {kind, ref} entries (cumulative / multi-cause — never single-cause). It may be empty
// and is extensible: later kinds (Activities, Raw Data) plug in without a rebuild. Only
// the LINKAGE to those not-yet-built layers is inert, not the collection itself.
const { newId } = require('../ids');
const { nowIso } = require('../clock');
const { ConstraintViolation } = require('../errors');

const INDICATOR_TYPES = ['leading', 'lagging'];

function createValueIndicator({
  name,
  indicatorType,
  value = 0,
  unit,
  supportedBy = [],
  weightMechanism = null, // INERT — the weighting for supportedBy is reserved, not active
} = {}) {
  if (!INDICATOR_TYPES.includes(indicatorType)) {
    throw new ConstraintViolation("Value Indicator requires indicatorType 'leading' | 'lagging'", {
      object: 'ValueIndicator', indicatorType,
    });
  }
  if (!Array.isArray(supportedBy)) {
    throw new ConstraintViolation('Value Indicator supportedBy must be a collection (array)', {
      object: 'ValueIndicator', supportedBy,
    });
  }
  for (const ref of supportedBy) {
    if (!ref || typeof ref.kind !== 'string' || ref.ref === undefined) {
      throw new ConstraintViolation('supportedBy entries must be { kind, ref }', {
        object: 'ValueIndicator', ref,
      });
    }
  }
  const ts = nowIso();
  return {
    id: newId('vi'),
    type: 'ValueIndicator',
    name,
    indicatorType,
    value,
    unit,
    supportedBy: [...supportedBy], // first-class, active, required collection
    weightMechanism,
    createdAt: ts,
    updatedAt: ts,
  };
}

module.exports = { createValueIndicator, INDICATOR_TYPES };
