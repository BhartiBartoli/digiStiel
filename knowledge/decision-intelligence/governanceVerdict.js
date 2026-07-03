'use strict';
// GOVERNANCE VERDICT — a specialised computed Judgement with a bounded outcome. NOT a
// commitment: it produces a RECOMMENDATION that feeds the chain; the Decision Authority
// commits on it. A 'Stop' verdict in the MVP is a STRONG RECOMMENDATION that authorises
// the customer to stop — NOT an autonomous stop. It executes nothing and mutates no state.
//
// Composition (guarantee 4): it calls computeJudgement(world, …) and uses the return value
// IN-MEMORY — it never reads or writes a stored judgement (none exists). Pure function.
const { ConstraintViolation } = require('../../engine/errors');
const { computeJudgement } = require('./judgement');

const VERDICTS = ['Continue', 'Adapt', 'Pause', 'Stop', 'Merge'];

function computeGovernanceVerdict(world, valuePlanId, context = {}) {
  const judgement = computeJudgement(world, valuePlanId, context); // in-memory composition

  // Deterministic mapping from judgement + context to a bounded verdict (illustrative).
  let verdict;
  if (context.merge) verdict = 'Merge';
  else if (judgement.assessment === 'high') verdict = 'Stop';
  else if (judgement.assessment === 'medium') verdict = 'Adapt';
  else verdict = 'Continue';
  if (context.pause) verdict = 'Pause';

  // Output guard: a verdict outside the bounded enum is impossible by construction; assert
  // it defensively so any future logic change that broke the invariant fails loudly.
  if (!VERDICTS.includes(verdict)) {
    throw new ConstraintViolation('Governance Verdict out of bounds', { verdict, allowed: VERDICTS });
  }

  return {
    kind: 'GovernanceVerdict',
    valuePlanId,
    verdict,                         // one of VERDICTS
    // A verdict is only a recommendation — never a commitment, never an execution.
    isRecommendation: true,
    commitment: null,               // the Decision Authority commits; DI does not
    basis: { judgement },           // in-memory, not persisted
    computedAt: context.now || null,
  };
}

module.exports = { computeGovernanceVerdict, VERDICTS };
