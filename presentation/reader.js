'use strict';
// PRESENTATION READ MODEL over the CANONICAL REALITY MODEL.
//
// This is NOT an "engine adapter" and NOT bound to a storage implementation. It reads the
// CANONICAL Reality model (Brok A: Strategic Intent → Strategic Goal → Value Plan → Operational
// Goal ↔ Value Indicator). Today that model happens to live in an in-memory MemoryStore; tomorrow
// it may be Airtable/Postgres/other persistence — the Presentation Layer stays fully independent of
// how it is stored. It hangs on the canonical Reality model, never on the storage mechanism.
//
// It is the presentation-side counterpart of knowledge/decision-intelligence/world.js: exactly as
// world.js reads the domain for the Decision-Intelligence compute WITHOUT interpreting, this Read
// Model reads Reality WITHOUT interpreting or mutating. It exposes ONLY read accessors — there is no
// put/create/link/write surface, so a projection physically cannot persist anything through it.
//
// Projection is read-only AND write-forbidden (hard rule): this module deliberately contains no
// save/update/create/put/link — not even "for later".
const { get, all } = require('../engine/store/MemoryStore');
const { indicatorIdsFor } = require('../engine/join');

function makeReader(engine) {
  const store = engine.store;
  return {
    // Canonical Reality — read-only, in natural (store) order; no sorting/priority (that would be a
    // screen choice → ViewModel, not here).
    allIntents()            { return all(store, 'strategicIntents'); },
    goalsFor(intentId)      { return all(store, 'strategicGoals').filter((g) => g.intentId === intentId); },
    plansFor(goalId)        { return all(store, 'valuePlans').filter((p) => p.goalId === goalId); },
    operationalGoalsFor(vpId) { return all(store, 'operationalGoals').filter((og) => og.valuePlanId === vpId); },
    indicatorsFor(ogId)     { return indicatorIdsFor(store, ogId).map((id) => get(store, 'valueIndicators', id)).filter(Boolean); },

    // Computed customer-visible end value only. measurableValue returns { perUnit, indicatorIds, count };
    // the caller (projection) takes ONLY perUnit — indicatorIds/count are the aggregation MECHANIC.
    measurableValueFor(vpId) { return engine.measurableValue(vpId); },
  };
}

module.exports = { makeReader };
