'use strict';
// The hidden substrate: in-memory collections + the many-to-many join table.
// The ONLY store implementation today (see store/README.md for the split-trigger).
// A later persistence adapter replaces this without touching object/constraint logic.
//
// activities[] and rawData[] are laid ready but INERT in Brok A — the future Value
// Measurement substrate (supportedBy references) plugs in here without a rebuild.

function createStore() {
  return {
    strategicIntents:  new Map(),
    strategicGoals:    new Map(),
    valuePlans:        new Map(),
    operationalGoals:  new Map(),
    valueIndicators:   new Map(),

    // Many-to-many join: Operational Goal <-> Value Indicator.
    // Rows are { operationalGoalId, valueIndicatorId }. NO parent-id on the child.
    ogViLinks: [],

    // Inert substrate for later layers (Activities / Raw Data). Unused in V1.
    activities: [],
    rawData:    [],
  };
}

function put(store, coll, obj) { store[coll].set(obj.id, obj); return obj; }
function get(store, coll, id)  { return store[coll].get(id); }
function all(store, coll)      { return [...store[coll].values()]; }

module.exports = { createStore, put, get, all };
