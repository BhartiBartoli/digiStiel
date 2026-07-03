'use strict';
// JUDGEMENT — a computed evaluation, NOT a stored object. "Judgement is transient."
// Derived from the canonical history (behaviour/governance/execution) + context at the
// moment of asking. Nothing is persisted; a historical judgement stays DERIVABLE by
// re-evaluating the same (history-snapshot, context) — no judgement snapshot is stored
// (Currentness is Computed).
//
// Pure function: no module-level state, no writes, deterministic for the same inputs.

function computeJudgement(world, subjectRef, context = {}) {
  const advice    = world.adviceFor(subjectRef);
  const decisions = world.decisionsFor(subjectRef);
  const now = context.now || null;

  // A simple, deterministic risk read from the history (illustrative, not persisted):
  // open questions/warnings raise risk; accepted decisions lower it; explicit context
  // signals can nudge it. The exact formula is not the point — statelessness is.
  const openConcerns = advice.filter(
    (a) => (a.adviceForm === 'Warning' || a.adviceForm === 'Question') && a.status !== 'Rejected'
  ).length;
  const settled = decisions.filter((d) => d.outcome === 'accepted').length;
  const signal = Number(context.riskSignal || 0);

  const score = openConcerns * 2 - settled + signal;
  const assessment = score >= 4 ? 'high' : score >= 1 ? 'medium' : 'low';

  return {
    kind: 'Judgement',
    subjectRef,
    assessment,          // 'low' | 'medium' | 'high'
    score,
    basis: {             // refs into the canonical history it was derived from
      adviceIds: advice.map((a) => a.id),
      decisionIds: decisions.map((d) => d.id),
    },
    computedAt: now,     // reflects the request-moment context, not a stored timestamp
  };
}

module.exports = { computeJudgement };
