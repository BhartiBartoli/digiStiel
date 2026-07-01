'use strict';
// Value Measurement layer. measurableValue is COMPUTED here, never stored on the Value
// Plan. Because Value Indicators are shared many-to-many, aggregation DEDUPLICATES the
// distinct set of indicators reachable from the plan (no double counting).
//
// V1 aggregation is unit-homogeneous per group: totals are grouped PER unit
// (option a) — no silent summation across mixed units.
const { get, all } = require('./store/MemoryStore');
const { indicatorIdsFor } = require('./join');
const { ReferenceViolation } = require('./errors');

function computeMeasurableValue(store, valuePlanId) {
  if (!get(store, 'valuePlans', valuePlanId)) {
    throw new ReferenceViolation('computeMeasurableValue: unknown Value Plan', { valuePlanId });
  }

  // Operational Goals of this Value Plan.
  const ogs = all(store, 'operationalGoals').filter((og) => og.valuePlanId === valuePlanId);

  // Distinct Value Indicator ids reachable via the join (dedup shared indicators).
  const viIds = new Set();
  for (const og of ogs) {
    for (const viId of indicatorIdsFor(store, og.id)) viIds.add(viId);
  }

  // Sum each unique indicator's value ONCE, grouped per unit.
  const perUnit = {};
  for (const viId of viIds) {
    const vi = get(store, 'valueIndicators', viId);
    if (!vi) continue;
    const unit = vi.unit === undefined ? 'unitless' : vi.unit;
    perUnit[unit] = (perUnit[unit] || 0) + (Number(vi.value) || 0);
  }

  return { perUnit, indicatorIds: [...viIds], count: viIds.size };
}

module.exports = { computeMeasurableValue };
