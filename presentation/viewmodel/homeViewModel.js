'use strict';
// HOME VIEWMODEL — screen-specific, read-only, over the Canonical Presentation Tree.
//
// ViewModels consume two immutable sources:
//   • Canonical Presentation Tree
//   • Decision Intelligence contracts
// They never reinterpret either source.
//
// "Presentation never determines business priority." The Home ViewModel does NOT decide what matters.
// It reads a list of Attention Candidates produced by Decision Intelligence and chooses ONLY: how many
// (Top N), rendering, wording and tone. It computes NO new priority, ranking, urgency, severity or
// score, and never re-interprets the DI signals.
//
// Read-only AND write-forbidden: no save/update/create/put/link here. It reads the Tree + the
// candidates and returns a screen datastructure (no React/UI — that is a later building block).
const { resolveTone } = require('./tone');

// One-sentence M&S summary TEMPLATE per signalType (presentation, not business logic). A template, not
// a fixed final string: later it can be personalised/translated/AI-generated/channel-specific without
// breaking the contract.
// summaryTemplate expresses semantic intent, not presentation wording. (No HTML/Markdown/emoji in a
// template — markup would break channel independence; the channel decides the formatting.)
const DEFAULT_SUMMARY_TEMPLATES = {
  'gate-pending': 'Dit plan wacht op jouw akkoord om verder te gaan.',
  'attention':    'Een signaal om even in de gaten te houden.',
  'confirmation': 'Dit loopt voor op schema — mooi bezig.',
};

// Index every node of the Canonical Presentation Tree by its sourceId (id-ref dereference).
function indexTree(tree) {
  const byId = new Map();
  const visit = (n) => {
    if (!n || !n.sourceId) return;
    byId.set(n.sourceId, n);
    for (const child of [...(n.goals || []), ...(n.plans || []), ...(n.operationalGoals || []), ...(n.results || [])]) {
      visit(child);
    }
  };
  for (const intent of tree.intents) visit(intent);
  return byId;
}

// plan.sourceId → parent Goal name, read from the Tree (Goal nodes carry a name; Value Plans do not
// in Brok A). Used to give a plan card identifying context — from the model, not a plan-name field.
function goalNameByPlan(tree) {
  const map = new Map();
  for (const intent of tree.intents) {
    for (const goal of intent.goals) {
      for (const plan of goal.plans) map.set(plan.sourceId, goal.name);
    }
  }
  return map;
}

// Title in CUSTOMER LANGUAGE, read straight from the dereferenced Tree node (the Projection already
// mapped it — the ViewModel does NOT map). A node with a name → "label: name". A plan node (no name
// in Brok A) → "label · <goal-naam>", the goal context read from the Tree so two plans are
// distinguishable; without goal context it falls back to the bare label.
function titleFor(node, goalName) {
  if (node.name) return `${node.label}: ${node.name}`;
  return goalName ? `${node.label} · ${goalName}` : node.label;
}

// buildHomeViewModel — orders by the DI-provided candidate.priority (honouring DI's ranking, NOT
// computing one), applies an optional M&S order preference WITHIN equal priority (presentation
// tiebreak), takes Top N, and shapes each shown candidate into a Home card.
function buildHomeViewModel({ tree, provider, topN = 3, toneOverrides = {}, orderPreference = [], destination = 'executive-summary' } = {}) {
  const byId = indexTree(tree);
  const goalOfPlan = goalNameByPlan(tree);
  const candidates = provider.getAttentionCandidates();

  const prefIndex = (signalType) => {
    const i = orderPreference.indexOf(signalType);
    return i === -1 ? orderPreference.length : i; // unknown → after known preferences
  };
  // Stable order: DI priority first (asc = more important), then — ONLY within EQUAL DI priority — the
  // M&S presentation tiebreak (orderPreference). The tiebreak can never override the DI order.
  const ordered = candidates
    .map((c, i) => ({ c, i }))
    .sort((a, b) => (a.c.priority - b.c.priority) || (prefIndex(a.c.signalType) - prefIndex(b.c.signalType)) || (a.i - b.i))
    .map((x) => x.c);

  // Top N is a channel policy. Decision Intelligence determines what deserves attention. Presentation
  // determines how many items fit on the screen.
  const shown = ordered.slice(0, topN);

  const cards = shown.map((cand) => {
    const node = byId.get(cand.sourceRef.sourceId);
    if (!node) return null;
    return {
      title: titleFor(node, goalOfPlan.get(node.sourceId)),             // klanttaal, uit de Tree (+ goal-context)
      summaryTemplate: DEFAULT_SUMMARY_TEMPLATES[cand.signalType] || null, // M&S copy, refinable template
      tone: resolveTone(cand.signalType, cand.severity, toneOverrides),  // presentatie-metadata (leest severity)
      // Generic presentation navigation contract: the channel picks its own destination; no hardcoded
      // screen name baked into the contract.
      navRef: { sourceId: cand.sourceRef.sourceId, destination },
    };
  }).filter(Boolean);

  return { cards };
}

module.exports = { buildHomeViewModel, DEFAULT_SUMMARY_TEMPLATES };
