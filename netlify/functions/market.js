const MARKETS = {
  be: { lang: 'nl-BE', retention: 10, locale: 'nl_BE' },
  nl: { lang: 'nl-NL', retention: 7,  locale: 'nl_NL' },
};

// brand: House of Brands field — unused in V1 (single brand), wired in V2.
// Canonical objects never reference brand directly; rendering goes through
// the Presentation Layer: canonical → (CustomerLanguage + market + brand) → surface.
const DEFAULT_BRAND = 'digistiel';

module.exports = function getMarket() {
  const market = MARKETS[process.env.MARKET || 'be'] || MARKETS.be;
  const brand  = process.env.BRAND || DEFAULT_BRAND;
  return { ...market, brand };
};
