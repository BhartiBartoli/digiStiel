'use strict';
// SEED CUSTOMER — "Van Dijck Wonen": one consistent demo customer whose Reality graph the projection
// can show. A fictional established local home/interior scale-up (~€3,2M revenue, ~28–35 staff).
//
// Loaded via an INJECTABLE adapter (`loader`). Today the default loader builds the graph in-memory
// through the Engine facade; tomorrow a real persistence adapter (Airtable/Postgres) plugs into the
// same `loadSeedCustomer(loader)` signature without a rebuild. One fixed tenant; cross-tenant inert.
//
// READING LENS (hard): the channels (ERP, Meta/Google ads, SEO, TikTok-affiliate, webshop) are the
// underlying signals (supportedBy/substrate), NOT wallet objects. The customer sees only value — the
// channel mechanics never appear in objects or in the projection. All figures are illustrative (data,
// not proven results); the visible "illustrative" marking is a later UI step.
//
// This module is read/build-for-seed only; it exposes no write path into the Presentation layer.
const { Engine } = require('../engine');
const { all } = require('../engine/store/MemoryStore');

// Named handles used by the demo so callers need not hardcode generated ids.
const NAMES = {
  intent:    'Groeien',
  goalGrow:  'Bestaande business laten groeien',
  goalNewStream: 'Een nieuwe waardestroom opbouwen',
};

// defaultSeedLoader — the Van Dijck Wonen hierarchy: ONE overarching Intent "Groeien" with TWO
// Strategic Goals under it. All activated so measurableValue is meaningful. No new object types —
// only data through the existing facade. (Brok A allows multiple Strategic Goals per Intent;
// createStrategicGoal only validates the Intent exists.)
function defaultSeedLoader() {
  const engine = new Engine();

  const intent = engine.createStrategicIntent({ name: NAMES.intent });

  // ── Strategic Goal 1: grow the existing business ─────────────────────────────────────
  const goal1 = engine.createStrategicGoal({ intentId: intent.id, name: NAMES.goalGrow, targetValue: 3500000, unit: 'EUR' });
  engine.activateStrategicGoal(goal1.id);

  // VP-A — "Lokale klanten kopen meer via de webshop"
  const vpA = engine.createValuePlan({ goalId: goal1.id });
  const ogA1 = engine.createOperationalGoal({ valuePlanId: vpA.id, name: 'Bestaande klanten vinden en gebruiken de webshop' });
  const ogA2 = engine.createOperationalGoal({ valuePlanId: vpA.id, name: 'Klanten kopen ook online, niet enkel in de winkel' });

  // VP-B — "Bekend worden in een grotere regio"
  const vpB = engine.createValuePlan({ goalId: goal1.id });
  const ogB1 = engine.createOperationalGoal({ valuePlanId: vpB.id, name: 'Mensen buiten de buurt vinden de winkel online' });
  const ogB2 = engine.createOperationalGoal({ valuePlanId: vpB.id, name: 'Tevreden klanten in de regio brengen nieuwe klanten aan' });

  // Value Indicators for Goal 1 (illustrative). Conversie lightly declining → feeds the attention scenario on VP-A.
  const viOmzet     = engine.createValueIndicator({ name: 'Omzet',     indicatorType: 'lagging', value: 2170000, unit: 'EUR',     supportedBy: [] });
  const viConversie = engine.createValueIndicator({ name: 'Conversie', indicatorType: 'leading', value: 2.8,     unit: '%',       supportedBy: [] });
  const viKlanten   = engine.createValueIndicator({ name: 'Klanten',   indicatorType: 'leading', value: 48,      unit: 'klanten', supportedBy: [] }); // SHARED A↔B
  const viRetentie  = engine.createValueIndicator({ name: 'Retentie',  indicatorType: 'lagging', value: 31,      unit: '%',       supportedBy: [] });

  // Klanten is SHARED between OG-A2 (VP-A) and OG-B1 (VP-B) — same vi id (within Goal 1). Omzet is
  // shared within VP-A (OG-A1+OG-A2) → within-plan dedup. Conversie is shared across VP-A/VP-B.
  engine.linkIndicator(ogA1.id, viOmzet.id);
  engine.linkIndicator(ogA1.id, viConversie.id);
  engine.linkIndicator(ogA2.id, viOmzet.id);
  engine.linkIndicator(ogA2.id, viKlanten.id);   // shared indicator
  engine.linkIndicator(ogB1.id, viKlanten.id);   // shared indicator (same id)
  engine.linkIndicator(ogB1.id, viConversie.id);
  engine.linkIndicator(ogB2.id, viRetentie.id);

  engine.activateValuePlan(vpA.id);
  engine.activateValuePlan(vpB.id);
  [ogA1, ogA2, ogB1, ogB2].forEach((og) => engine.activateOperationalGoal(og.id));

  // ── Strategic Goal 2: build a new value stream (early, little data) ───────────────────
  const goal2 = engine.createStrategicGoal({ intentId: intent.id, name: NAMES.goalNewStream, targetValue: 25, unit: 'projectklanten' });
  engine.activateStrategicGoal(goal2.id);

  const vpC = engine.createValuePlan({ goalId: goal2.id });
  const ogC1 = engine.createOperationalGoal({ valuePlanId: vpC.id, name: 'Eerste offertes voor projecten' });
  const vpD = engine.createValuePlan({ goalId: goal2.id });
  const ogD1 = engine.createOperationalGoal({ valuePlanId: vpD.id, name: 'Een vast projectstappenplan' });

  const viKlantenP    = engine.createValueIndicator({ name: 'Klanten',     indicatorType: 'leading', value: 2,  unit: 'projectklanten', supportedBy: [] });
  const viEfficientie = engine.createValueIndicator({ name: 'Efficiëntie', indicatorType: 'leading', value: 40, unit: '%',              supportedBy: [] });

  engine.linkIndicator(ogC1.id, viKlantenP.id);
  engine.linkIndicator(ogD1.id, viEfficientie.id);

  engine.activateValuePlan(vpC.id);
  engine.activateValuePlan(vpD.id);
  engine.activateOperationalGoal(ogC1.id);
  engine.activateOperationalGoal(ogD1.id);

  return engine;
}

// loadSeedCustomer — the pluggable adapter entrypoint. Returns a populated Engine (the canonical
// Reality model) that the Presentation Read Model reads from.
function loadSeedCustomer(loader = defaultSeedLoader) {
  return loader();
}

// vanDijckAttentionCandidates(engine) — the four Home scenarios as a fixed candidate list, imitating
// the DI-owned AttentionCandidate contract (priority/severity are DI-decided; here fixed). sourceIds
// are resolved from the ENGINE (goals by name; plans by their parent goal in creation order), because
// projected plan nodes carry no name — only a label.
function vanDijckAttentionCandidates(engine) {
  const store = engine.store;
  const goalByName = (name) => all(store, 'strategicGoals').find((g) => g.name === name);
  const plansOfGoal = (goalId) => all(store, 'valuePlans').filter((p) => p.goalId === goalId); // creation order

  const goal1 = goalByName(NAMES.goalGrow);
  const goal2 = goalByName(NAMES.goalNewStream);
  const [vpA, vpB] = plansOfGoal(goal1.id);
  const [vpC] = plansOfGoal(goal2.id);

  // Stub priorities follow the M&S tone canon (an input wish toward DI, refinable without a rebuild):
  // action → confirmation → ordinary attention, with ONE gate at the top. The second gate (early
  // project plan) gets priority 4 so it falls OUTSIDE the Top-3 cap — the Home never shows two gates
  // at the top. This one-gate outcome is STUB PRIORITISATION (M&S tone input toward DI), NOT a
  // ViewModel signalType filter: the ViewModel reads priority and shows Top-N in DI order.
  return [
    // 1 — action: the region plan (Goal 1) waits for the customer's go-ahead (gate).
    { sourceRef: { sourceId: vpB.id },   signalType: 'gate-pending', priority: 1, severity: 'normal' },
    // 2 — confirmation: the growth goal is running ahead of schedule.
    { sourceRef: { sourceId: goal1.id }, signalType: 'confirmation', priority: 2, severity: 'normal' },
    // 3 — ordinary (non-severe) attention: webshop conversion slipping on VP-A.
    { sourceRef: { sourceId: vpA.id },   signalType: 'attention',    priority: 3, severity: 'normal' },
    // 4 — action: the early project plan (Goal 2) awaits go-ahead — outside the Top-3 cap.
    { sourceRef: { sourceId: vpC.id },   signalType: 'gate-pending', priority: 4, severity: 'normal' },
  ];
}

module.exports = { loadSeedCustomer, defaultSeedLoader, vanDijckAttentionCandidates, NAMES };
