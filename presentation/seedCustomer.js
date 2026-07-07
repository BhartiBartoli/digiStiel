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

// vanDijckPlanTitles(engine) — the four M&S computed plan titles as a PRESENTATION mapping
// { planSourceId → computed title }, fed to the ViewModel card-shape. Each title is a customer-language
// OUTCOME (the value the plan pursues), NOT an Operational-Goal activity name and NOT a mechanical
// derivation from the OG names. M&S-refinable without a rebuild; this same map is the seam a later
// generic title deriver would populate for non-demo plans (inert until then — Reserve, Don't Activate).
function vanDijckPlanTitles(engine) {
  const store = engine.store;
  const goalByName = (name) => all(store, 'strategicGoals').find((g) => g.name === name);
  const plansOfGoal = (goalId) => all(store, 'valuePlans').filter((p) => p.goalId === goalId); // creation order

  const [vpA, vpB] = plansOfGoal(goalByName(NAMES.goalGrow).id);
  const [vpC, vpD] = plansOfGoal(goalByName(NAMES.goalNewStream).id);
  return {
    [vpA.id]: 'Meer online omzet uit bestaande klanten', // webshop-plan
    [vpB.id]: 'Bekend worden in een grotere regio',      // regio-plan
    [vpC.id]: 'Eerste projectklanten winnen',            // projectklanten-plan
    [vpD.id]: 'Een vlotter projectproces',               // projectproces-plan
  };
}

// vanDijckHomeCopy() — M&S-authored Home framing copy (greeting + one calm summary sentence that
// opens on what works). Presentation copy, not computed — same nature as summaryTemplate.
function vanDijckHomeCopy() {
  return {
    greeting: 'Goeiemorgen',
    intro: 'Het meeste loopt zoals het hoort. Dit zijn de dingen die vandaag even je aandacht waard zijn — geen brandjes, gewoon het bekijken waard.',
  };
}

// vanDijckExecutiveSummaries(engine) — M&S-authored Executive Summary NARRATIVE per source (demo copy;
// there is no Executive Summary ViewModel yet — that stays a Platform question). Understanding +
// explanation are read-only customer-language TEXT; the measurement `metrics` carry only LABELS and a
// reference (kind/unit) — the actual numbers are read from the Canonical Presentation Tree at build
// time, never entered here. Built for the SUCCESS scenario (the revenue goal); other cards route to a
// "binnenkort" state.
function vanDijckExecutiveSummaries(engine) {
  const store = engine.store;
  const goalByName = (name) => all(store, 'strategicGoals').find((g) => g.name === name);
  const plansOfGoal = (goalId) => all(store, 'valuePlans').filter((p) => p.goalId === goalId); // creation order
  const goal1 = goalByName(NAMES.goalGrow);
  const [vpA, vpB] = plansOfGoal(goal1.id);
  const [vpC] = plansOfGoal(goalByName(NAMES.goalNewStream).id);
  const RES = 'berekend uit je eigen resultaten — geen apart ingevuld getal';

  return {
    // Scenario 3 — success (revenue goal). Already built; unchanged.
    [goal1.id]: {
      understanding: 'Je omzetdoel voor dit jaar ligt voor op schema — winkel en webshop trekken samen goed.',
      reasons: [
        { kind: 'strength', text: 'Bestaande klanten kopen vaker, en ook steeds vaker online. Dat houdt je omzet stevig op koers.' },
        { kind: 'opportunity', text: 'Er is nog ruimte richting je jaardoel. Meer mensen buiten de buurt bereiken kan dat verder aanjagen.' },
      ],
      metrics: [
        { label: 'Je jaardoel', kind: 'goal-target' },
        { label: 'Waar je nu staat', kind: 'measurable', unit: 'EUR', reassurance: RES },
      ],
    },

    // Scenario 1 — early warning (attention, webshop plan). M&S copy, verbatim.
    [vpA.id]: {
      understanding: 'Je bestaande klanten kopen de laatste weken wat minder online dan gewoonlijk. Nog geen groot verschil, maar het is het bekijken waard nu het net begint.',
      reasons: [
        { kind: 'strength', text: 'Je winkelverkoop bij diezelfde klanten blijft gewoon goed — de band met je klanten is er, het gaat enkel om het online kanaal.' },
        { kind: 'opportunity', text: 'Je hebt hier klanten die je al kent en die je al vertrouwen — als zij weer vlotter online kopen, groeit je omzet zonder dat je nieuwe klanten hoeft te zoeken.' },
      ],
      metrics: [
        { label: 'Online conversie nu', kind: 'plan-measurable', unit: '%', reassurance: RES },
        { label: 'Online omzet nu', kind: 'plan-measurable', unit: 'EUR', reassurance: RES },
      ],
    },

    // Scenario 2 — plan awaiting go-ahead (gate, region plan). M&S copy, verbatim.
    [vpB.id]: {
      understanding: 'Er ligt een plan voor je klaar om buiten je eigen buurt bekend te worden. Voor er iets start, kijk jij het eerst na — jij beslist of we ermee verdergaan.',
      reasons: [
        { kind: 'strength', text: 'Wat je in je eigen buurt hebt opgebouwd — je naam, je aanpak — werkt daar al. Datzelfde kun je nu breder inzetten.' },
        { kind: 'opportunity', text: 'In je eigen buurt ben je al goed gekend, dus daar valt weinig groei meer te halen. De ruimte om te groeien zit in de regio erbuiten, waar mensen je nog niet kennen.' },
      ],
      metrics: [
        { label: 'Mensen die je nu bereikt', kind: 'plan-measurable', unit: 'klanten', reassurance: RES },
      ],
    },

    // Scenario 4 — early initiative (gate, project plan). M&S copy, verbatim.
    [vpC.id]: {
      understanding: 'Je nieuwe interieur-projectendienst staat klaar om te beginnen. Er is nog weinig gebeurd — dit is het prille begin, en dat is precies zoals het hoort op dit punt.',
      reasons: [
        { kind: 'strength', text: 'Je hebt al een trouw klantenbestand en een gevestigde naam — een sterke basis om iets nieuws op te bouwen zonder bij nul te beginnen.' },
        { kind: 'opportunity', text: 'Je zou hier kunnen starten bij de klanten die je al hebt en die je vertrouwen — dat is de makkelijkste plek om een nieuwe dienst te laten aanslaan.' },
      ],
      metrics: [
        { label: 'Eerste projectklanten', kind: 'plan-measurable', unit: 'projectklanten', reassurance: RES },
      ],
    },
  };
}

module.exports = {
  loadSeedCustomer, defaultSeedLoader, vanDijckAttentionCandidates, vanDijckPlanTitles,
  vanDijckHomeCopy, vanDijckExecutiveSummaries, NAMES,
};
