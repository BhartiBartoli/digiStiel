'use strict';
// HOME VIEWMODEL — screen-specific, read-only, over the Canonical Presentation Tree.
//
// "Presentation never determines business priority." The Home ViewModel does NOT decide what matters.
// It reads a list of Attention Candidates produced by Decision Intelligence and chooses ONLY: how many
// (Top N), rendering, wording and tone. It computes NO new priority, ranking, urgency, severity or
// score, and never re-interprets the DI signals.
//
// Read-only AND write-forbidden: no save/update/create/put/link here. It reads the Tree + the
// candidates and returns a screen datastructure (no React/UI — that is a later building block).
const { resolveTone } = require('./tone');

// One-sentence M&S summary copy per signalType (presentation, not business logic).
const DEFAULT_SUMMARY = {
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

// Title in CUSTOMER LANGUAGE, read straight from the dereferenced Tree node (the Projection already
// mapped it — the ViewModel does NOT map). Nodes without a name (e.g. a plan) fall back to the label.
function titleFor(node) {
  return node.name ? `${node.label}: ${node.name}` : node.label;
}

// buildHomeViewModel — orders by the DI-provided candidate.priority (honouring DI's ranking, NOT
// computing one), applies an optional M&S order preference WITHIN equal priority (presentation
// tiebreak), takes Top N, and shapes each shown candidate into a Home card.
function buildHomeViewModel({ tree, provider, topN = 3, toneOverrides = {}, orderPreference = [] } = {}) {
  const byId = indexTree(tree);
  const candidates = provider.getAttentionCandidates();

  const prefIndex = (signalType) => {
    const i = orderPreference.indexOf(signalType);
    return i === -1 ? orderPreference.length : i; // unknown → after known preferences
  };
  // Stable order: DI priority first (asc = more important), then the M&S presentation tiebreak.
  const ordered = candidates
    .map((c, i) => ({ c, i }))
    .sort((a, b) => (a.c.priority - b.c.priority) || (prefIndex(a.c.signalType) - prefIndex(b.c.signalType)) || (a.i - b.i))
    .map((x) => x.c);

  const shown = ordered.slice(0, topN);

  const cards = shown.map((cand) => {
    const node = byId.get(cand.sourceRef.sourceId);
    if (!node) return null;
    return {
      title: titleFor(node),                                        // klanttaal, uit de Tree
      summary: DEFAULT_SUMMARY[cand.signalType] || null,            // M&S één-zin copy
      tone: resolveTone(cand.signalType, cand.severity, toneOverrides), // presentatie-metadata (leest severity)
      navRef: { target: 'executive-summary', sourceId: cand.sourceRef.sourceId },
    };
  }).filter(Boolean);

  return { cards };
}

module.exports = { buildHomeViewModel, DEFAULT_SUMMARY };
