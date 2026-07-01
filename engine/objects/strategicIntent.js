'use strict';
// Strategic Intent — long-lived, qualitative. DEVIATES from the other objects:
// starts Active (no Proposed) and has no Achieved. Lifecycle: Active -> Retired.
const { newId } = require('../ids');
const { nowIso } = require('../clock');
const { initialStatus } = require('../lifecycle');

function createStrategicIntent({ name, description = '', brand = null } = {}) {
  const ts = nowIso();
  return {
    id: newId('si'),
    type: 'StrategicIntent',
    name,
    description,
    brand,                 // INERT (House of Brands V2) — drives no behaviour
    status: initialStatus('StrategicIntent'), // 'Active'
    createdAt: ts,
    updatedAt: ts,
  };
}

module.exports = { createStrategicIntent };
