// Single source of truth for per-market behaviour. One codebase, one MARKET
// env var drives every axis. Read at two moments (same config):
//   - build-time, per site, for SEO/crawler-critical surface (Category A)
//   - runtime, per request, for in-app surface via the Function response (Category B)
//
// Axes: TAAL, JURIDISCH, GTM/UX-accent, BRAND. Location and currency are NOT axes.
//
// ── JURIDISCHE AS: twee schakelaars + drie afgeleiden ─────────────────────────
// A market block sets ONLY the two real legal switches:
//   - jurisdiction : gekozen recht/forum ('BE' | 'NL'; 'FR'/'DE' bestaan maar zijn
//                    geblokkeerd via legalStatus)
//   - annexSet     : toegepaste landannex ('BE' | 'NL' | 'none')
// The three other legal values are DERIVED via lookups, never set by hand — so an
// inconsistent combination (e.g. BE met 7 jaar retention) is impossible to encode:
//   - retention       ← jurisdiction
//   - liabilityRegime ← jurisdiction
//   - promotionRegime ← annexSet
// For .be/.nl the two switches coincide; for .com they diverge (BE-recht, geen annex).

// retention + liabilityRegime volgen JURISDICTION.
const BY_JURISDICTION = {
  BE: { retention: 10, liabilityRegime: 'boek VI WER' },
  NL: { retention: 7,  liabilityRegime: '6:233/6:248 BW' },
  // FR/DE: jurisdiction-waarden bestaan, maar markten zijn geblokkeerd (geen afleiding).
};

// promotionRegime volgt ANNEXSET.
const PROMOTION_BY_ANNEX = {
  BE:   'BE-kansspel',
  NL:   'Ksa-gedragscode',
  none: 'EU-core',
};

const DEFAULT_BRAND = 'digistiel';
const DEFAULT_UX = { ctaDirectness: 'standard', previewDepth: 'standard' };

// Markten zetten alleen jurisdiction + annexSet (juridisch) + de niet-juridische
// assen. legalStatus is een dwingende gate: 'cleared' | 'blocked'. Default voor
// elk nieuw/onbekend blok = 'blocked' (zie getMarket).
const MARKETS = {
  be: {
    lang: 'nl-BE', locale: 'nl_BE',
    jurisdiction: 'BE', annexSet: 'BE',
    legalStatus: 'cleared',
    ux: { ctaDirectness: 'standard', previewDepth: 'standard' },
  },
  nl: {
    lang: 'nl-NL', locale: 'nl_NL',
    jurisdiction: 'NL', annexSet: 'NL',
    legalStatus: 'cleared',
    ux: { ctaDirectness: 'standard', previewDepth: 'standard' }, // M&S vult later in
  },
  com: {
    lang: 'en', locale: 'en_US',
    jurisdiction: 'BE', annexSet: 'none', // Belgisch recht, geen landannex → EU-core
    legalStatus: 'blocked', // Engelse GT&C nog niet juridisch goedgekeurd — blocked tot sign-off
    ux: { ctaDirectness: 'standard', previewDepth: 'standard' },
  },
  // Config-skeletten — juridisch NIET vrijgegeven. Blijven 'blocked' tot vrijgave.
  fr: {
    lang: 'fr-FR', locale: 'fr_FR',
    jurisdiction: 'FR', annexSet: 'none',
    legalStatus: 'blocked',
    ux: { ctaDirectness: 'standard', previewDepth: 'standard' },
  },
  de: {
    lang: 'de-DE', locale: 'de_DE',
    jurisdiction: 'DE', annexSet: 'none',
    legalStatus: 'blocked',
    ux: { ctaDirectness: 'standard', previewDepth: 'standard' },
  },
};

// Afleiding: gegeven jurisdiction + annexSet → de drie afgeleide legal-waarden.
function deriveLegal(block) {
  const j = BY_JURISDICTION[block.jurisdiction] || { retention: null, liabilityRegime: null };
  return {
    retention:       j.retention,
    liabilityRegime: j.liabilityRegime,
    promotionRegime: PROMOTION_BY_ANNEX[block.annexSet] || PROMOTION_BY_ANNEX.none,
  };
}

module.exports = function getMarket() {
  const key   = process.env.MARKET || 'be';
  const block = MARKETS[key];
  const brand = process.env.BRAND || DEFAULT_BRAND;

  // Fail-safe: een onbekend/nieuw marktblok is per definitie 'blocked'.
  if (!block) {
    return {
      key,
      lang: null, locale: null,
      jurisdiction: null, annexSet: 'none',
      legalStatus: 'blocked',
      legal: deriveLegal({ jurisdiction: null, annexSet: 'none' }),
      ux: { ...DEFAULT_UX },
      brand,
    };
  }

  return {
    key,
    lang: block.lang,
    locale: block.locale,
    jurisdiction: block.jurisdiction,
    annexSet: block.annexSet,
    legalStatus: block.legalStatus || 'blocked', // default blocked als veld ontbreekt
    legal: deriveLegal(block),                    // retention/liability/promotion afgeleid
    ux: { ...DEFAULT_UX, ...(block.ux || {}) },
    brand,                                        // inert in V1 (House of Brands V2)
  };
};
