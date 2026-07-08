#!/usr/bin/env node
'use strict';

// ── Build-time wallet data snapshot ───────────────────────────────────────────
// The wallet UI is static (no framework, no bundler) and the ViewModel is CommonJS
// Node code, so it cannot run in the browser. This script runs the frozen data layer
// ONCE at build time and writes wallet-data.json — the UI renders that JSON read-only.
// Every number comes from the Canonical Presentation Tree / engine (computed there);
// nothing is calculated or hardcoded here or in the UI. Narrative copy is M&S-authored
// presentation data from the seed.
//
// Usage:
//   node scripts/build-wallet.js            # write ./wallet-data.json
//   node scripts/build-wallet.js --print    # print the data, no write
const fs = require('fs');
const path = require('path');

const P = require('../presentation');
const VM = require('../presentation/viewmodel');
const {
  loadSeedCustomer, vanDijckAttentionCandidates, vanDijckPlanTitles,
  vanDijckHomeCopy, vanDijckExecutiveSummaries, vanDijckValueStory,
} = require('../presentation/seedCustomer');

// Walk the tree to find a node by its sourceId (read-only dereference).
function findNode(tree, sourceId) {
  let hit = null;
  const visit = (n) => {
    if (!n || hit) return;
    if (n.sourceId === sourceId) { hit = n; return; }
    for (const c of [...(n.goals || []), ...(n.plans || []), ...(n.operationalGoals || []), ...(n.results || [])]) visit(c);
  };
  for (const intent of tree.intents) visit(intent);
  return hit;
}

// Resolve a measurement metric's NUMBER from the Tree (never entered by hand).
function resolveMetric(metric, node) {
  if (metric.kind === 'goal-target') {
    return { label: metric.label, value: node.target.value, unit: node.target.unit };
  }
  if (metric.kind === 'measurable') {
    // Goal node: read the computed measurableValue for the requested unit from the goal's plans.
    for (const plan of node.plans || []) {
      const perUnit = plan.measurableValue && plan.measurableValue.perUnit;
      if (perUnit && perUnit[metric.unit] !== undefined) {
        return { label: metric.label, value: perUnit[metric.unit], unit: metric.unit, reassurance: metric.reassurance };
      }
    }
  }
  if (metric.kind === 'plan-measurable') {
    // Plan node: read its OWN computed measurableValue for the requested unit (Tree value, not computed here).
    const perUnit = node.measurableValue && node.measurableValue.perUnit;
    if (perUnit && perUnit[metric.unit] !== undefined) {
      return { label: metric.label, value: perUnit[metric.unit], unit: metric.unit, reassurance: metric.reassurance };
    }
  }
  return { label: metric.label, value: null, unit: metric.unit || null };
}

// objectType from the canonical sourceType (presentation metadata; no domain meaning invented).
function objectTypeOf(node) {
  return node.sourceType === 'StrategicGoal' ? 'goal'
    : node.sourceType === 'ValuePlan' ? 'plan'
    : node.sourceType === 'ValueIndicator' ? 'result' : 'other';
}

// Conversation-bound context = the DIRECT Tree neighbours of the open subject (read-only filter, no
// computation). Labels are the fixed M&S phrasings; items are neighbour names already in the Tree.
function buildContext(node, tree, planTitles) {
  const distinct = (arr) => [...new Set(arr)];
  if (node.sourceType === 'StrategicGoal') {
    const plans = (node.plans || []).map((p) => planTitles[p.sourceId] || p.label);
    const indicators = distinct((node.plans || []).flatMap((p) =>
      (p.operationalGoals || []).flatMap((og) => (og.results || []).map((r) => r.name))));
    return [
      { label: 'Je plannen bij dit doel', items: plans },
      { label: 'Wat dit doel meet', items: indicators },
    ];
  }
  if (node.sourceType === 'ValuePlan') {
    let goalName = null;
    for (const it of tree.intents) for (const g of it.goals) if ((g.plans || []).some((p) => p.sourceId === node.sourceId)) goalName = g.name;
    const results = distinct((node.operationalGoals || []).flatMap((og) => (og.results || []).map((r) => r.name)));
    return [
      { label: 'Dit plan hoort bij je doel', items: goalName ? [goalName] : [] },
      { label: 'De resultaten die het beweegt', items: results },
    ];
  }
  if (node.sourceType === 'ValueIndicator') {
    return [{ label: 'Dit resultaat telt mee voor', items: [] }]; // sparse; no result scenario in the demo
  }
  return [];
}

// buildWalletBundle — returns the data plus the engine/tree it was built from, so tests can verify
// numbers against the SAME load (ids are minted per load).
function buildWalletBundle() {
  const engine = loadSeedCustomer();
  const tree = P.projectWallet(P.makeReader(engine));
  const candidates = vanDijckAttentionCandidates(engine);
  const planTitles = vanDijckPlanTitles(engine);
  const valueStory = vanDijckValueStory(engine); // temporary Narrative Provider (demo seed)
  const provider = VM.makeStubAttentionProvider(candidates);

  // Home cards straight from the ViewModel (Top-N + DI order — not re-ordered here).
  const vm = VM.buildHomeViewModel({ tree, provider, planTitles });
  const signalBySource = Object.fromEntries(candidates.map((c) => [c.sourceRef.sourceId, c.signalType]));

  const execRaw = vanDijckExecutiveSummaries(engine);
  const executiveSummaries = {};
  for (const [sid, content] of Object.entries(execRaw)) {
    const node = findNode(tree, sid);
    // Title consistent with the Home card: goal → "je doel: <name>"; plan (no Brok A name) →
    // "je plan: <computed title>" via planTitles; else the bare label.
    const title = node.name ? `${node.label}: ${node.name}`
      : (planTitles[sid] ? `${node.label}: ${planTitles[sid]}` : node.label);
    const objectType = objectTypeOf(node);
    executiveSummaries[sid] = {
      title: title,
      objectType: objectType,                              // 'goal' | 'plan' | 'result' → picks the opener
      understanding: content.understanding,
      reasons: content.reasons,
      metrics: content.metrics.map((m) => resolveMetric(m, node)),
      context: buildContext(node, tree, planTitles),        // RIGHT: direct Tree neighbours (read-only)
      // Value Story — literal seed narrative (temporary Narrative Provider), surfaced only for plans;
      // the goal layer stays inert (Reserve, Don't Activate). Presentation renders it, never builds one.
      valueStory: objectType === 'plan' ? (valueStory[sid] || null) : null,
    };
  }

  const cards = vm.cards.map((c) => ({
    sourceId: c.navRef.sourceId,
    title: c.title,
    summary: c.summaryTemplate,
    tone: c.tone,
    signalType: signalBySource[c.navRef.sourceId],
    hasSummary: Boolean(executiveSummaries[c.navRef.sourceId]), // does a working Executive Summary exist?
  }));

  const copy = vanDijckHomeCopy();
  const data = {
    customer: 'Van Dijck Wonen',
    demo: true,
    home: { greeting: copy.greeting, intro: copy.intro, cards },
    executiveSummaries,
    generatedBy: 'scripts/build-wallet.js (read-only over the frozen data layer)',
  };
  return { data, engine, tree };
}

function buildWalletData() {
  return buildWalletBundle().data;
}

if (require.main === module) {
  const data = buildWalletData();
  if (process.argv.includes('--print')) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    const out = path.join(__dirname, '..', 'wallet-data.json');
    fs.writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
    console.log(`wrote ${out} (${data.home.cards.length} cards, ${Object.keys(data.executiveSummaries).length} executive summaries)`);
  }
}

module.exports = { buildWalletData, buildWalletBundle };
