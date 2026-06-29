// Single source of truth for per-market behaviour. One codebase, one MARKET
// env var (be/nl) drives every axis. Read at two moments (same config):
//   - build-time, per site, for SEO/crawler-critical surface (Category A)
//   - runtime, per request, for in-app surface via the Function response (Category B)
//
// Four axes only. Location and currency are deliberately NOT axes.
const MARKETS = {
  be: {
    // As 1: TAAL
    lang:   'nl-BE',
    locale: 'nl_BE',
    // As 2: JURIDISCH — references/flags only, no embedded legal text.
    legal: {
      retention:       10,   // BE 10 jaar
      annexRef:        'BE', // regional GT&C annex
      liabilityRegime: 'BE', // BE: WER / BW
      promoRegime:     'BE',
    },
    // As 3: GTM/UX-ACCENT — flags with named effect + safe default.
    // NL stays on 'standard' until M&S supplies values.
    ux: {
      ctaDirectness: 'standard',
      previewDepth:  'standard',
    },
  },
  nl: {
    lang:   'nl-NL',
    locale: 'nl_NL',
    legal: {
      retention:       7,    // NL 7 jaar
      annexRef:        'NL',
      liabilityRegime: 'NL', // NL: 6:233 / 6:248 BW
      promoRegime:     'NL', // NL: Gedragscode Promotionele Kansspelen
    },
    ux: {
      ctaDirectness: 'standard', // M&S vult dit later in; default tot dan
      previewDepth:  'standard',
    },
  },
};

// As 4: BRAND — House of Brands field, inert in V1 (single brand). Laid ready,
// drives no branching. Rendering goes through the Presentation Layer:
// canonical → (CustomerLanguage + market + brand) → surface.
const DEFAULT_BRAND = 'digistiel';

module.exports = function getMarket() {
  const key    = process.env.MARKET || 'be';
  const market = MARKETS[key] || MARKETS.be;
  const brand  = process.env.BRAND || DEFAULT_BRAND;
  return { ...market, brand };
};
