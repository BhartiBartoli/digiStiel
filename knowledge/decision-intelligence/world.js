'use strict';
// Read-only "world" adapter for the Decision Intelligence layer.
//
// The four evaluations (judgement/trust/governanceVerdict/authorization) are PURE
// functions over the canonical history. They receive a `world` — a read-ONLY view over
// Brok A Reality-state (engine store) + Brok B Memory/Advice/Decision (knowledge store).
// This adapter exposes ONLY read accessors; it has no put/create/write surface, so an
// evaluation physically cannot persist anything through it.
//
// Decision Intelligence must never become a second Knowledge layer: it stores nothing.
// (Any future cache would be a performance optimisation only — explicitly discardable and
//  fully derivable from this same history — never a source of truth.)

function makeWorld({ engine, knowledge }) {
  return {
    // Brok B (knowledge) — read-only.
    allAdvice()        { return [...knowledge.store.adviceRecords.values()]; },
    allDecisions()     { return [...knowledge.store.decisionRecords.values()]; },
    allMemory()        { return [...knowledge.store.memoryEntries.values()]; },
    adviceFor(vpId)    { return this.allAdvice().filter((a) => a.valuePlanId === vpId); },
    decisionsFor(vpId) { return this.allDecisions().filter((d) => d.valuePlanId === vpId); },

    // Brok A (engine reality-state) — read-only.
    valuePlanStatus(vpId) {
      const vp = engine && engine.get ? engine.get('valuePlans', vpId) : undefined;
      return vp ? vp.status : undefined;
    },
  };
}

module.exports = { makeWorld };
