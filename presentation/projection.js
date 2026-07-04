'use strict';
// PROJECTION — produces the CANONICAL PRESENTATION TREE.
//
// "The Projection layer produces the Canonical Presentation Tree. Individual channels (Web, Mobile,
// PDF, API, AI and future clients) derive their own ViewModels from this tree without reinterpreting
// the domain model." The Projection layer is a channel-INDEPENDENT presentation contract; ViewModels
// stay channel-SPECIFIC; the domain is never re-interpreted downstream. (Symmetry: as the Read Model
// is the channel-agnostic READ boundary for Decision Intelligence, the Canonical Presentation Tree is
// the channel-agnostic PRESENTATION boundary for all clients.)
//
// "Projection transforms semantics, never presentation styling." It may ONLY project labels, structure
// and visibility. It must NOT format, round, compute percentages, choose colours/icons/badges, or
// affect layout — that is the future ViewModel layer.
//
// Projection is read-only AND write-forbidden: this module never mutates the source and exposes no
// write path. It reads through the Presentation Read Model and returns a fresh tree.
const { resolveLabel } = require('./customerLanguage');

// Each node carries:
//  - sourceId   : id-ref into the unchanged canonical object (Single Source of Truth, not a copy)
//  - sourceType : IMMUTABLE internal metadata, inherited straight from the canonical source object.
//                 It is a handle so later ViewModels need not re-dereference the engine. It is NOT
//                 customer language, it NEVER replaces a label, and Projection/ViewModels never
//                 mutate it. It must never surface as a customer-visible LABEL.
//  - label      : the customer-language projection (the customer-visible name of the level)
// plus the customer-visible payload for that level (name / value / unit / target). No internal
// mechanic is projected.

function node(sourceObj, overrides, extra) {
  return {
    sourceId: sourceObj.id,
    sourceType: sourceObj.type,          // immutable, inherited from the canonical source
    label: resolveLabel(sourceObj.type, overrides),
    ...extra,
  };
}

// Value Indicator → projected ONLY as a value ("je resultaat"). The internal mechanic
// (indicatorType/supportedBy/weightMechanism/substrate) is deliberately NOT projected.
function projectIndicator(vi, overrides) {
  return node(vi, overrides, { name: vi.name, value: vi.value, unit: vi.unit });
}

function projectOperationalGoal(og, reader, overrides) {
  return node(og, overrides, {
    name: og.name,
    results: reader.indicatorsFor(og.id).map((vi) => projectIndicator(vi, overrides)),
  });
}

function projectPlan(plan, reader, overrides) {
  // measurableValue: project ONLY the customer-visible end value (perUnit). indicatorIds/count are
  // the aggregation mechanic and are dropped; perUnit is NOT a per-indicator breakdown (that would
  // leak supportedBy/aggregation) — it is the aggregated end value, unformatted (no rounding).
  const mv = reader.measurableValueFor(plan.id);
  return node(plan, overrides, {
    operationalGoals: reader.operationalGoalsFor(plan.id).map((og) => projectOperationalGoal(og, reader, overrides)),
    measurableValue: { perUnit: mv.perUnit },
  });
}

function projectGoal(goal, reader, overrides) {
  return node(goal, overrides, {
    name: goal.name,
    target: { value: goal.targetValue, unit: goal.unit },
    plans: reader.plansFor(goal.id).map((p) => projectPlan(p, reader, overrides)),
  });
}

function projectIntent(intent, reader, overrides) {
  return node(intent, overrides, {
    name: intent.name,
    goals: reader.goalsFor(intent.id).map((g) => projectGoal(g, reader, overrides)),
  });
}

// projectWallet — the full Canonical Presentation Tree. Screen-agnostic: the COMPLETE hierarchy in
// natural order, no selection ("top N"), no sorting/priority (those are ViewModel/screen choices).
function projectWallet(reader, { labelOverrides = {} } = {}) {
  return {
    intents: reader.allIntents().map((si) => projectIntent(si, reader, labelOverrides)),
  };
}

module.exports = { projectWallet };
