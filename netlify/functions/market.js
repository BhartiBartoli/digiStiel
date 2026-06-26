const MARKETS = {
  be: { lang: 'nl-BE', retention: 10, locale: 'nl_BE' },
  nl: { lang: 'nl-NL', retention: 7,  locale: 'nl_NL' },
};

module.exports = function getMarket() {
  return MARKETS[process.env.MARKET || 'be'] || MARKETS.be;
};
