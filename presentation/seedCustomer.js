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
  goalRevenue:  'Meer omzet uit de bestaande winkel + webshop',
  goalProjects: 'Een winstgevende interieur-projectendienst lanceren',
};

// defaultSeedLoader — the Van Dijck Wonen two-intent hierarchy, all activated so measurableValue is
// meaningful. No new object types — only data through the existing facade.
function defaultSeedLoader() {
  const engine = new Engine();

  // ── Intent 1: grow the existing business ─────────────────────────────────────────────
  const intent1 = engine.createStrategicIntent({ name: 'Groei bestaande business' });
  const sgRevenue = engine.createStrategicGoal({ intentId: intent1.id, name: NAMES.goalRevenue, targetValue: 3500000, unit: 'EUR' });
  engine.activateStrategicGoal(sgRevenue.id);

  // VP1a — "Meer klanten uit de buurt"
  const vp1a = engine.createValuePlan({ goalId: sgRevenue.id });
  const og1 = engine.createOperationalGoal({ valuePlanId: vp1a.id, name: 'Meer mensen vinden de winkel online' });
  const og2 = engine.createOperationalGoal({ valuePlanId: vp1a.id, name: 'Meer bezoekers worden koper' });

  // VP1b — "Bestaande klanten komen vaker terug"
  const vp1b = engine.createValuePlan({ goalId: sgRevenue.id });
  const og3 = engine.createOperationalGoal({ valuePlanId: vp1b.id, name: 'Klanten kopen ook online, niet enkel in de winkel' });
  const og4 = engine.createOperationalGoal({ valuePlanId: vp1b.id, name: 'Tevreden klanten brengen nieuwe klanten aan' });

  // Value Indicators for Intent 1 (illustrative values + units).
  const viKlanten    = engine.createValueIndicator({ name: 'Klanten',   indicatorType: 'leading', value: 48,      unit: 'klanten', supportedBy: [] }); // SHARED
  const viConvLead   = engine.createValueIndicator({ name: 'Conversie', indicatorType: 'leading', value: 3.1,     unit: '%',       supportedBy: [] });
  const viConvLag    = engine.createValueIndicator({ name: 'Conversie', indicatorType: 'lagging', value: 2.4,     unit: '%',       supportedBy: [] });
  const viOmzet      = engine.createValueIndicator({ name: 'Omzet',     indicatorType: 'lagging', value: 2170000, unit: 'EUR',     supportedBy: [] });
  const viRetentie   = engine.createValueIndicator({ name: 'Retentie',  indicatorType: 'lagging', value: 31,      unit: '%',       supportedBy: [] });

  // Many-to-many links. Klanten is SHARED between OG1 (VP1a) and OG3 (VP1b) — same vi id.
  engine.linkIndicator(og1.id, viKlanten.id);
  engine.linkIndicator(og1.id, viConvLead.id);
  engine.linkIndicator(og2.id, viConvLag.id);
  engine.linkIndicator(og3.id, viOmzet.id);
  engine.linkIndicator(og3.id, viKlanten.id); // shared indicator
  engine.linkIndicator(og4.id, viRetentie.id);

  engine.activateValuePlan(vp1a.id);
  engine.activateValuePlan(vp1b.id);
  [og1, og2, og3, og4].forEach((og) => engine.activateOperationalGoal(og.id));

  // ── Intent 2: build a new value stream (early, little data) ───────────────────────────
  const intent2 = engine.createStrategicIntent({ name: 'Nieuwe waardestroom opbouwen' });
  const sgProjects = engine.createStrategicGoal({ intentId: intent2.id, name: NAMES.goalProjects, targetValue: 25, unit: 'projectklanten' });
  engine.activateStrategicGoal(sgProjects.id);

  const vp2a = engine.createValuePlan({ goalId: sgProjects.id });
  const og5 = engine.createOperationalGoal({ valuePlanId: vp2a.id, name: 'Eerste offertes voor projecten' });
  const vp2b = engine.createValuePlan({ goalId: sgProjects.id });
  const og6 = engine.createOperationalGoal({ valuePlanId: vp2b.id, name: 'Een vast projectstappenplan' });

  const viKlantenP    = engine.createValueIndicator({ name: 'Klanten',     indicatorType: 'leading', value: 2,  unit: 'projectklanten', supportedBy: [] });
  const viEfficientie = engine.createValueIndicator({ name: 'Efficiëntie', indicatorType: 'leading', value: 40, unit: '%',              supportedBy: [] });

  engine.linkIndicator(og5.id, viKlantenP.id);
  engine.linkIndicator(og6.id, viEfficientie.id);

  engine.activateValuePlan(vp2a.id);
  engine.activateValuePlan(vp2b.id);
  engine.activateOperationalGoal(og5.id);
  engine.activateOperationalGoal(og6.id);

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

  const sgRevenue = goalByName(NAMES.goalRevenue);
  const sgProjects = goalByName(NAMES.goalProjects);
  const [vp1a, vp1b] = plansOfGoal(sgRevenue.id);
  const [vp2a] = plansOfGoal(sgProjects.id);

  return [
    // Plan waiting for the customer's go-ahead (gate) — shown first.
    { sourceRef: { sourceId: vp1a.id },       signalType: 'gate-pending', priority: 1, severity: 'normal' },
    // Early warning: repeat purchases slipping (calm tone).
    { sourceRef: { sourceId: vp1b.id },       signalType: 'attention',    priority: 2, severity: 'normal' },
    // Success: the revenue goal is running ahead of schedule.
    { sourceRef: { sourceId: sgRevenue.id },  signalType: 'confirmation', priority: 3, severity: 'normal' },
    // Early initiative: the first project plan awaits go-ahead — beyond the Top-N cap.
    { sourceRef: { sourceId: vp2a.id },       signalType: 'gate-pending', priority: 4, severity: 'normal' },
  ];
}

module.exports = { loadSeedCustomer, defaultSeedLoader, vanDijckAttentionCandidates, NAMES };
