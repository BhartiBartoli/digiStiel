'use strict';
// TONE MARKERS — presentation metadata, NOT business logic.
//
// M&S owns tone/copy/card-shape. A tone marker is chosen per signalType (and, for 'attention', per
// DI-provided severity). These are M&S-tunable parameters: the defaults work out of the box and an
// override map adjusts them without a rebuild. The ViewModel READS the DI-provided severity to pick a
// variant — it never computes severity.

// Default tone marker per signalType. 'attention' additionally has a severe variant.
const DEFAULT_TONE = {
  'gate-pending': 'geruststellend',  // uitnodigend: "Er staat iets voor je klaar. Jij beslist." — geen urgentie-druk
  'attention':    'kalm',            // informerend: "iets om in de gaten te houden", niet "probleem"
  'confirmation': 'warm',            // bevestigend: "Mooi bezig", zonder overdrijving
};
// Severe variant per signalType (only 'attention' differs today): directer/feitelijker, nooit alarmerend.
const SEVERE_TONE = {
  'attention': 'feitelijk',
};

// resolveTone(signalType, severity, overrides) — overrides may carry { [signalType]: marker } and/or
// { severe: { [signalType]: marker } }, applied without a rebuild. Defaults apply when no override.
function resolveTone(signalType, severity = 'normal', overrides = {}) {
  if (severity === 'severe') {
    const sevOverride = (overrides.severe && overrides.severe[signalType]);
    if (sevOverride) return sevOverride;
    if (SEVERE_TONE[signalType]) return SEVERE_TONE[signalType];
  }
  return (overrides && overrides[signalType]) || DEFAULT_TONE[signalType] || null;
}

module.exports = { DEFAULT_TONE, SEVERE_TONE, resolveTone };
