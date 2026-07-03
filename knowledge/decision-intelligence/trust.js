'use strict';
// TRUST — exact same pattern as Judgement: a computed evaluation, NOT an object. Derived
// from the canonical history + context. Nothing persisted. Pure function.

function computeTrust(world, subjectRef, context = {}) {
  const decisions = world.decisionsFor(subjectRef);
  const accepted = decisions.filter((d) => d.outcome === 'accepted').length;
  const rejected = decisions.filter((d) => d.outcome === 'rejected').length;
  const total = decisions.length;

  // Deterministic trust read from decision history (illustrative, not persisted).
  const ratio = total === 0 ? 0.5 : accepted / total;
  const level = ratio >= 0.66 ? 'high' : ratio >= 0.34 ? 'medium' : 'low';

  return {
    kind: 'Trust',
    subjectRef,
    level,               // 'low' | 'medium' | 'high'
    ratio,
    basis: { accepted, rejected, total, decisionIds: decisions.map((d) => d.id) },
    computedAt: context.now || null,
  };
}

module.exports = { computeTrust };
