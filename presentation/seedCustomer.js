'use strict';
// SEED CUSTOMER — one consistent demo customer whose Reality graph the projection can show.
//
// Loaded via an INJECTABLE adapter (`loader`). Today the default loader builds the graph in-memory
// through the Engine facade; tomorrow a real persistence adapter (Airtable/Postgres) plugs into the
// same `loadSeedCustomer(loader)` signature without a rebuild — consistent with the Brok B
// persistence note. One fixed tenant; cross-tenant stays inert (tenantId lives on Brok B Memory, not
// on these Reality objects, so it is not needed for this Reality projection).
//
// This module is read/build-for-seed only; it exposes no write path into the Presentation layer.
const { Engine } = require('../engine');

// defaultSeedLoader — a coherent KMO graph: one Intent → two Goals → a Value Plan → two Operational
// Goals → linked Value Indicators, all activated so measurableValue is meaningful.
function defaultSeedLoader() {
  const engine = new Engine();

  const intent = engine.createStrategicIntent({ name: 'Groeien met gezonde marges' });

  const goalRevenue = engine.createStrategicGoal({ intentId: intent.id, name: 'Meer omzet uit bestaande klanten', targetValue: 250000, unit: 'EUR' });
  const goalRetention = engine.createStrategicGoal({ intentId: intent.id, name: 'Klanten die terugkomen', targetValue: 85, unit: '%' });
  engine.activateStrategicGoal(goalRevenue.id);
  engine.activateStrategicGoal(goalRetention.id);

  const plan = engine.createValuePlan({ goalId: goalRevenue.id });

  const ogFollowup = engine.createOperationalGoal({ valuePlanId: plan.id, name: 'Offertes sneller opvolgen' });
  const ogRepeat = engine.createOperationalGoal({ valuePlanId: plan.id, name: 'Herhaalaankopen stimuleren' });

  const viRevenue = engine.createValueIndicator({ name: 'Omzet', indicatorType: 'lagging', value: 180000, unit: 'EUR', supportedBy: [] });
  const viConversion = engine.createValueIndicator({ name: 'Offerte-conversie', indicatorType: 'leading', value: 42, unit: '%', supportedBy: [] });

  engine.linkIndicator(ogFollowup.id, viConversion.id);
  engine.linkIndicator(ogFollowup.id, viRevenue.id);
  engine.linkIndicator(ogRepeat.id, viRevenue.id); // shared indicator — dedup proven in aggregation

  engine.activateValuePlan(plan.id);
  engine.activateOperationalGoal(ogFollowup.id);
  engine.activateOperationalGoal(ogRepeat.id);

  return engine;
}

// loadSeedCustomer — the pluggable adapter entrypoint. Returns a populated Engine (the canonical
// Reality model) that the Presentation Read Model reads from.
function loadSeedCustomer(loader = defaultSeedLoader) {
  return loader();
}

module.exports = { loadSeedCustomer, defaultSeedLoader };
