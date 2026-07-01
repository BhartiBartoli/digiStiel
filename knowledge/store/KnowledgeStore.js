'use strict';
// Brok B substrate — the knowledge/persistence layer, ABOVE the engine.
// In-memory today; a persistence adapter (Airtable/Postgres) replaces this without
// touching object/constraint logic (see store/README.md split-trigger).
//
// Right-to-be-forgotten: the Map-based store STRUCTURALLY permits deletion
// (Map.delete). The governed erase operation itself is Brok C — no public erase flow
// is built here; only the capability is laid ready.

function createKnowledgeStore() {
  return {
    memoryEntries:   new Map(),
    adviceRecords:   new Map(),
    decisionRecords: new Map(),
  };
}

function put(store, coll, obj) { store[coll].set(obj.id, obj); return obj; }
function get(store, coll, id)  { return store[coll].get(id); }
function all(store, coll)      { return [...store[coll].values()]; }

module.exports = { createKnowledgeStore, put, get, all };
