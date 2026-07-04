'use strict';
// Presentation Read Model / Projection — proofs. Exit 0 = all pass.
// Read-only, screen-agnostic projection of the canonical Reality model into customer language.
const assert = require('assert');
const P = require('../presentation');
const { DEFAULT_LABELS } = require('../presentation/customerLanguage');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log(`PASS ✅  ${name}`); pass++; }
  catch (e) { console.log(`FAIL ❌  ${name}\n        ${e && e.message}`); fail++; }
}

const INTERNAL_TYPES = ['StrategicIntent', 'StrategicGoal', 'ValuePlan', 'OperationalGoal', 'ValueIndicator'];
const FORBIDDEN_MECHANIC_KEYS = ['indicatorType', 'supportedBy', 'weightMechanism', 'indicatorIds', 'count', 'substrate', 'activities', 'rawData'];
const SCREEN_CHOICE_KEYS = ['priority', 'rank', 'order', 'top', 'sortIndex', 'position'];

function setup() {
  const engine = P.loadSeedCustomer();
  const reader = P.makeReader(engine);
  const tree = P.projectWallet(reader);
  return { engine, reader, tree };
}
function storeSnapshot(engine) {
  const s = engine.store;
  const dump = {};
  for (const coll of ['strategicIntents', 'strategicGoals', 'valuePlans', 'operationalGoals', 'valueIndicators']) {
    dump[coll] = [...s[coll].values()];
  }
  dump.ogViLinks = s.ogViLinks;
  return JSON.stringify(dump);
}
// Walk every projection node in the tree.
function walk(tree, visit) {
  for (const intent of tree.intents) {
    visit(intent, 'intent');
    for (const goal of intent.goals) {
      visit(goal, 'goal');
      for (const plan of goal.plans) {
        visit(plan, 'plan');
        for (const og of plan.operationalGoals) {
          visit(og, 'og');
          for (const res of og.results) visit(res, 'result');
        }
      }
    }
  }
}
// Collect the CUSTOMER-VISIBLE field values only (label/name/value/unit/target/perUnit) — NOT the
// sourceId/sourceType metadata handles.
function customerVisibleStrings(tree) {
  const out = [];
  walk(tree, (n) => {
    if (n.label !== undefined) out.push(String(n.label));
    if (n.name !== undefined) out.push(String(n.name));
    if (n.unit !== undefined) out.push(String(n.unit));
    if (n.target && n.target.unit !== undefined) out.push(String(n.target.unit));
  });
  return out;
}

// ── 1: each type maps to the correct customer-language default ──
check('1. Each type → correct customer-language default label', () => {
  const { tree } = setup();
  const intent = tree.intents[0];
  const goal = intent.goals[0];
  const plan = goal.plans[0];
  const og = plan.operationalGoals[0];
  const res = og.results[0];
  assert.strictEqual(intent.label, 'waar je naartoe wil');
  assert.strictEqual(goal.label, 'je doel');
  assert.strictEqual(plan.label, 'je plan');
  assert.strictEqual(og.label, 'wat je nu doet');
  assert.strictEqual(res.label, 'je resultaat');
  // and the public API resolves the same defaults
  assert.strictEqual(P.resolveLabel('ValueIndicator'), 'je resultaat');
});

// ── 2: internal mechanic does not leak; sourceType exists as metadata; perUnit is end value ──
check('2. No mechanic leak in customer-visible fields; sourceType is metadata; perUnit = end value', () => {
  const { tree } = setup();
  const serialized = JSON.stringify(tree);
  // (a) no aggregation/mechanic key anywhere in the output
  for (const key of FORBIDDEN_MECHANIC_KEYS) {
    assert.ok(!serialized.includes(`"${key}"`), `mechanic key "${key}" must not appear in projection`);
  }
  // (b) sourceType DOES exist as an internal metadata handle (allowed)
  assert.ok(serialized.includes('"sourceType"'), 'sourceType metadata handle present');
  // (c) no internal type string appears as a CUSTOMER-VISIBLE label/name/unit
  const visible = customerVisibleStrings(tree);
  for (const t of INTERNAL_TYPES) {
    assert.ok(!visible.includes(t), `internal type "${t}" must not be a customer-visible value`);
  }
  // (d) every label is a known customer-language label
  walk(tree, (n) => assert.ok(Object.values(DEFAULT_LABELS).includes(n.label), `unknown label ${n.label}`));
  // (e) measurableValue is only perUnit (end value), keyed by UNIT — never a per-indicator breakdown
  walk(tree, (n) => {
    if (n.measurableValue) {
      assert.deepStrictEqual(Object.keys(n.measurableValue), ['perUnit'], 'only perUnit projected');
      for (const k of Object.keys(n.measurableValue.perUnit)) {
        assert.ok(!/^vi/.test(k), 'perUnit keyed by unit, not by Value Indicator id (no aggregation breakdown)');
      }
    }
  });
});

// ── 3: the source object is unchanged; projection only projects ──
check('3. Source object unchanged after projection (sourceId still dereferences to internal type)', () => {
  const { engine, tree } = setup();
  const before = storeSnapshot(engine);
  const res = tree.intents[0].goals[0].plans[0].operationalGoals[0].results[0];
  const src = engine.get('valueIndicators', res.sourceId);
  assert.strictEqual(src.type, 'ValueIndicator', 'source is still a Value Indicator, not renamed');
  assert.strictEqual(res.sourceType, 'ValueIndicator', 'sourceType inherited from the canonical source');
  P.projectWallet(P.makeReader(engine)); // re-project
  assert.strictEqual(storeSnapshot(engine), before, 'projection did not mutate the source object');
});

// ── 4: per-customer override structure exists but is inert (Reserve, Don't Activate) ──
check('4. Override seam works when supplied; default is inert (defaults apply)', () => {
  const { reader } = setup();
  const def = P.projectWallet(reader); // no overrides → defaults
  assert.strictEqual(def.intents[0].goals[0].plans[0].operationalGoals[0].results[0].label, 'je resultaat');
  const over = P.projectWallet(reader, { labelOverrides: { ValueIndicator: 'jouw opbrengst' } });
  assert.strictEqual(over.intents[0].goals[0].plans[0].operationalGoals[0].results[0].label, 'jouw opbrengst', 'override honoured (seam works)');
  // seam inert by default: resolveLabel with no overrides returns the default
  assert.strictEqual(P.resolveLabel('ValueIndicator'), 'je resultaat');
});

// ── 5: read-only — projection mutates nothing ──
check('5. Read-only: store snapshot identical before/after projection', () => {
  const { engine, reader } = setup();
  const before = storeSnapshot(engine);
  P.projectWallet(reader);
  assert.strictEqual(storeSnapshot(engine), before, 'no mutation from projecting');
});

// ── 6: screen-agnostic — full hierarchy, no selection/ordering/priority ──
check('6. Screen-agnostic: complete hierarchy, no top-N / no ordering keys', () => {
  const { engine, tree } = setup();
  const s = engine.store;
  // node counts per level == source counts (nothing dropped, no "top N")
  assert.strictEqual(tree.intents.length, s.strategicIntents.size, 'all intents projected');
  const allGoals = tree.intents.flatMap((i) => i.goals);
  assert.strictEqual(allGoals.length, s.strategicGoals.size, 'all goals projected (incl. goal with no plans)');
  const allPlans = allGoals.flatMap((g) => g.plans);
  assert.strictEqual(allPlans.length, s.valuePlans.size, 'all plans projected');
  const allOgs = allPlans.flatMap((p) => p.operationalGoals);
  assert.strictEqual(allOgs.length, s.operationalGoals.size, 'all operational goals projected');
  // every source id appears as a sourceId (complete coverage)
  const ids = new Set();
  walk(tree, (n) => ids.add(n.sourceId));
  for (const coll of ['strategicIntents', 'strategicGoals', 'valuePlans', 'operationalGoals', 'valueIndicators']) {
    for (const id of s[coll].keys()) assert.ok(ids.has(id), `source ${id} present in tree`);
  }
  // no screen-choice/ordering key anywhere
  const serialized = JSON.stringify(tree);
  for (const key of SCREEN_CHOICE_KEYS) {
    assert.ok(!serialized.includes(`"${key}"`), `screen-choice key "${key}" must not appear`);
  }
});

// ── 8: write-forbidden — no save/update/create/put/link export exists in the layer ──
check('8. Write-forbidden: no write API exported by the Presentation layer (structural)', () => {
  const WRITE = /save|update|create|put|link|write|persist|delete|mutat|insert|remove/i;
  const modules = {
    'index': require('../presentation'),
    'reader': require('../presentation/reader'),
    'customerLanguage': require('../presentation/customerLanguage'),
    'projection': require('../presentation/projection'),
    'seedCustomer': require('../presentation/seedCustomer'),
  };
  for (const [modName, mod] of Object.entries(modules)) {
    for (const key of Object.keys(mod)) {
      assert.ok(!WRITE.test(key), `${modName} exports write-like "${key}" — forbidden`);
    }
  }
  // the reader instance itself exposes no write method
  const reader = P.makeReader(P.loadSeedCustomer());
  for (const key of Object.keys(reader)) {
    assert.ok(!WRITE.test(key), `reader exposes write-like "${key}" — forbidden`);
  }
});

// ── 7: customer-recognisability (M&S) — print the full Canonical Presentation Tree ──
check('7. Customer-recognisable: full projected tree renders in customer language, no internal terms', () => {
  const { tree } = setup();
  const lines = [];
  for (const intent of tree.intents) {
    lines.push(`${intent.label}: ${intent.name}`);
    for (const goal of intent.goals) {
      lines.push(`  ${goal.label}: ${goal.name} (streef: ${goal.target.value} ${goal.target.unit})`);
      for (const plan of goal.plans) {
        const mv = Object.entries(plan.measurableValue.perUnit).map(([u, v]) => `${v} ${u}`).join(', ');
        lines.push(`    ${plan.label}${mv ? ` — waarde nu: ${mv}` : ''}`);
        for (const og of plan.operationalGoals) {
          lines.push(`      ${og.label}: ${og.name}`);
          for (const res of og.results) {
            lines.push(`        ${res.label}: ${res.name} = ${res.value} ${res.unit}`);
          }
        }
      }
    }
  }
  const rendered = '\n' + lines.join('\n');
  console.log(rendered);
  // no internal term or mechanic visible in what the customer reads
  for (const t of INTERNAL_TYPES) assert.ok(!rendered.includes(t), `internal term ${t} visible to customer`);
  for (const k of FORBIDDEN_MECHANIC_KEYS) assert.ok(!rendered.includes(k), `mechanic ${k} visible to customer`);
  assert.ok(lines.length >= 5, 'a full multi-level tree is rendered');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
