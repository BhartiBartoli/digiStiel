'use strict';
// Value Plan — the primary operational object. Child of Strategic Goal (single goalId).
// measurableValue is NOT stored — it is a computed aggregation (see aggregation.js);
// a Value Plan only CONSUMES that value, it never persists it.
const { newId } = require('../ids');
const { nowIso } = require('../clock');
const { initialStatus } = require('../lifecycle');

function createValuePlan({
  goalId,
  accountableRef = null,     // INERT, identity-AGNOSTIC — opaque, no User/Partner/Agent link
  responsibleRefs = [],      // INERT, identity-AGNOSTIC — opaque list
  playbookRef = null,        // INERT (Playbook -> Value Plan reference, V2)
  volatility = null,         // INERT (context-signal volatility, V2)
} = {}) {
  const ts = nowIso();
  return {
    id: newId('vp'),
    type: 'ValuePlan',
    goalId,                  // single parent reference
    accountableRef,
    responsibleRefs,
    playbookRef,
    volatility,
    status: initialStatus('ValuePlan'), // 'Proposed'
    createdAt: ts,
    updatedAt: ts,
  };
}

module.exports = { createValuePlan };
