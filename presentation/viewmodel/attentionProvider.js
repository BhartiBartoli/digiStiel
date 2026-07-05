'use strict';
// ATTENTION CANDIDATES — provider interface + stub.
//
// Ownership boundary (Platform + M&S, frozen): "what deserves attention today" is BUSINESS PRIORITY
// and belongs to Decision Intelligence, NOT to Presentation. DI produces Attention Candidates from
// Recommendation / Governance-Verdict / Gate signals; that real production is a FUTURE Platform
// implementation. Here we define the interface and a replaceable stub.
//
//   Provider interface:  getAttentionCandidates() → [AttentionCandidate]
//   AttentionCandidate = {
//     sourceRef: { sourceId },              // → a node in the Canonical Presentation Tree
//     signalType: 'gate-pending' | 'attention' | 'confirmation',
//     priority:  <number>,                  // DI-decided ranking (asc = more important). READ, not computed.
//     severity:  'normal' | 'severe',       // DI-decided. READ, not computed.
//   }
//
// The ViewModel READS priority/severity — it never derives them. The real DI provider plugs into the
// SAME getAttentionCandidates() interface without a rebuild (Reserve, Don't Activate).

// A stub provider around a fixed candidate list. Any object with getAttentionCandidates() satisfies
// the interface — the real DI provider is a drop-in replacement.
function makeStubAttentionProvider(candidates) {
  const list = [...candidates];
  return { getAttentionCandidates() { return list; } };
}

// seedDemoCandidates(tree) — a fixed list covering the three demo situations, referencing REAL nodes
// in the given Canonical Presentation Tree. Priorities/severity are DI-decided values (here: fixed).
//   - gate-pending  : a Value Plan waiting for the customer's go-ahead
//   - attention     : a leading indicator that deviates (here marked severe to exercise the variant)
//   - confirmation  : a goal running ahead
function seedDemoCandidates(tree) {
  const intent = tree.intents[0];
  const goal = intent.goals[0];
  const plan = goal.plans[0];
  const leadingResult = plan.operationalGoals[0].results[0]; // Offerte-conversie (leading)

  return [
    { sourceRef: { sourceId: plan.sourceId },          signalType: 'gate-pending',  priority: 1, severity: 'normal' },
    { sourceRef: { sourceId: leadingResult.sourceId }, signalType: 'attention',     priority: 2, severity: 'severe' },
    { sourceRef: { sourceId: goal.sourceId },          signalType: 'confirmation',  priority: 3, severity: 'normal' },
  ];
}

module.exports = { makeStubAttentionProvider, seedDemoCandidates };
