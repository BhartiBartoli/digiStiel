'use strict';
// CUSTOMER LANGUAGE — "Customer Language is a Presentation Strategy, not a domain dictionary."
//
// This module maps an internal canonical type to a customer-facing label. It is a PRESENTATION
// STRATEGY: the customer language stays entirely OUTSIDE the domain — the internal object is never
// renamed. "digiStiel standaardiseert betekenis, niet taal."
//
// The default strategy below is active. Future strategies (Industry, Partner, Localized,
// Customer-specific) can plug into the SAME interface — resolveLabel(type, overrides) stays the
// public API — without a rebuild (Reserve, Don't Activate: the seam exists, the strategies do not
// yet). The per-customer override map is laid ready but inert by default (empty → defaults apply).

// Default label projection (M&S-canonical). Internal type → customer language.
const DEFAULT_LABELS = {
  StrategicIntent: 'waar je naartoe wil',
  StrategicGoal:   'je doel',
  ValuePlan:       'je plan',
  OperationalGoal: 'wat je nu doet',
  ValueIndicator:  'je resultaat',
};

// Public API. `overrides` is the per-customer/other-strategy seam; default {} → the default strategy
// is used. A supplied override is honoured (proving the seam works) but is NOT active by default.
function resolveLabel(internalType, overrides = {}) {
  return (overrides && overrides[internalType]) || DEFAULT_LABELS[internalType] || null;
}

module.exports = { DEFAULT_LABELS, resolveLabel };
