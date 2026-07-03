'use strict';
// REASONING-CHAIN GUARD — enforces the chain sequence:
//   Judgement → Recommendation → Authorization → Decision → Execution.
//
// An Authorization/Decision chain may ONLY start from an Advice whose adviceForm is
// 'Recommendation'. Starting from Observation/Insight/Warning/Question/Alternative is refused —
// there is no shortcut from an Observation straight to a Decision.
//
// GUARANTEE 2 — The guard bewaakt ONLY the STRUCTURE. It uses solely isChainEligible (the deel-1
// hook — reused, never rebuilt) and guards only the allowed reasoning SEQUENCE. It explicitly
// does NOT judge: the quality of a Recommendation, the strength of the evidence, or the
// correctness of a Judgement — that remains entirely Decision Intelligence (the deel-2 compute
// functions). This is a structural gatekeeper (checks the FORM of the chain), not a content
// weighing. The Escalating Evidence Principle is enforced as ORDER, not built as evidence-weighing.
const { ConstraintViolation } = require('../../engine/errors');
const { isChainEligible } = require('../objects/adviceRecord');

// Pure precondition: the chain may only start from a chain-eligible Advice (a Recommendation).
function assertChainStart(advice) {
  if (!isChainEligible(advice)) {
    throw new ConstraintViolation('Reasoning chain may only start from a Recommendation', {
      adviceForm: (advice && advice.adviceForm) || null,
    });
  }
}

// Runs the structural guard and returns an in-memory chain-start descriptor. Stores NOTHING.
function startReasoningChain(advice) {
  assertChainStart(advice);
  return { start: 'Recommendation', adviceId: advice.id };
}

module.exports = { assertChainStart, startReasoningChain };
