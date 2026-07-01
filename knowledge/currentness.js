'use strict';
// "Current = computed" — never an active flag. Currentness is derived from the
// supersede chains: a Memory Entry is current if it has no supersededByRef; an Advice
// or Decision is current if no other record supersedes it (via supersedesRef).
const { all } = require('./store/KnowledgeStore');

function isCurrentMemory(entry) { return !entry.supersededByRef; }

function currentMemory(store, tenantId) {
  return all(store, 'memoryEntries').filter(
    (e) => isCurrentMemory(e) && (tenantId === undefined || e.tenantId === tenantId)
  );
}

function isSuperseded(store, coll, id) {
  return all(store, coll).some((r) => r.supersedesRef === id);
}

function currentAdviceFor(store, valuePlanId) {
  return all(store, 'adviceRecords').filter(
    (a) => a.valuePlanId === valuePlanId && a.status !== 'Rejected' && !isSuperseded(store, 'adviceRecords', a.id)
  );
}

function currentDecisionFor(store, valuePlanId) {
  return all(store, 'decisionRecords').filter(
    (d) => d.valuePlanId === valuePlanId && !isSuperseded(store, 'decisionRecords', d.id)
  );
}

module.exports = { isCurrentMemory, currentMemory, isSuperseded, currentAdviceFor, currentDecisionFor };
