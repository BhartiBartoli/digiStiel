// ════════════════════════════════════════════════════════════════════════════
//  TENANT CONFIG — the ONLY file you edit when cloning for a new client
//  Copy this file + index.html + netlify/ folder → new Netlify site → done
// ════════════════════════════════════════════════════════════════════════════

window.TENANT = {

  // ── IDENTITY ──────────────────────────────────────────────────────────────
  id:           'bikeberingen',            // unique slug, used in localStorage keys
  name:         'Bike Center Beringen',
  shortName:    'Bike Beringen',
  city:         'Beringen',
  tagline:      'Jouw fietsenwinkel in Beringen',
  campaignName: 'Beringen WK Kampioenschap 2026',

  // ── BRANDING ──────────────────────────────────────────────────────────────
  primaryColor:   '#e8281e',   // main brand colour — buttons, accents
  secondaryColor: '#1a1a2e',   // header background
  accentColor:    '#f5a623',   // highlights, scores, gold moments
  logoEmoji:      '🚴',        // shown when no logo image is available
  // logoUrl: 'https://...cdn.../logo.png',  // optional: real logo image URL

  // ── CONTACT & BOOKING ─────────────────────────────────────────────────────
  whatsapp:        '32470000000',
  whatsappMsg:     'Hallo Bike Center Beringen! Ik wil graag een afspraak voor de WK Zomercheck.',
  bookingUrl:      null,      // null = use built-in modal, string = external URL
  phone:           '+32 (0)11 000 000',
  email:           'info@bikecenterberingen.be',
  address:         'Voorbeeldstraat 1, 3580 Beringen',
  mapsUrl:         'https://maps.google.com/?q=Beringen+Belgie',

  // ── OPENING HOURS ─────────────────────────────────────────────────────────
  hours: [
    { day: 'Maandag',    open: null },
    { day: 'Dinsdag',    open: '9:00 – 18:00' },
    { day: 'Woensdag',   open: '9:00 – 18:00' },
    { day: 'Donderdag',  open: '9:00 – 18:00' },
    { day: 'Vrijdag',    open: '9:00 – 18:00' },
    { day: 'Zaterdag',   open: '9:00 – 17:00' },
    { day: 'Zondag',     open: null },
  ],

  // ── CAMPAIGN / PROMOTION ──────────────────────────────────────────────────
  promoTitle:   'WK Zomercheck — maak jouw fiets klaar!',
  promoText:    'Banden, remmen, versnelling — alles gecheckt. Zodat jij kan focussen op de Rode Duivels.',
  promoCtaText: 'Afspraak maken',

  // ── PREDICTOR REWARD (specific = high conversion) ─────────────────────────
  rewardExact:   '€15 korting',   // reward for exact score prediction
  rewardWinner:  '€5 korting',    // reward for correct winner only
  rewardText:    'op elke fietsbeurt bij Bike Center Beringen',
  rewardExpiry:  '19 juli 2026',  // tournament end date
  voucherPrefix: 'WK26-BCB',      // prefix for voucher codes in email

  // ── SERVICES ──────────────────────────────────────────────────────────────
  services: [
    { icon: '🔧', name: 'WK Zomercheck',    desc: 'Banden, remmen, derailleur, lichten.',  price: 'v.a. €29' },
    { icon: '⚡', name: 'E-bike Diagnostiek', desc: 'Batterij, motor, software update.',     price: 'v.a. €49' },
    { icon: '🔩', name: 'Grote Beurt',       desc: 'Volledige revisie en afstelling.',       price: 'v.a. €79' },
    { icon: '🛞', name: 'Bandreparatie',     desc: 'Snel en voordelig.',                     price: 'v.a. €9'  },
  ],

  // ── LEADERBOARD SEEDS (local names build community immediately) ────────────
  // These appear on day 1. Real submissions push them down naturally.
  leaderboardSeeds: [
    { name: 'Tom V.',    city: 'Beringen', pts: 0, avatar: '🚴' },
    { name: 'Lisa M.',   city: 'Beringen', pts: 0, avatar: '🏆' },
    { name: 'Koen B.',   city: 'Heusden',  pts: 0, avatar: '⚽' },
    { name: 'An D.',     city: 'Beringen', pts: 0, avatar: '🇧🇪' },
    { name: 'Pieter J.', city: 'Hasselt',  pts: 0, avatar: '🔥' },
  ],

  // ── BELGIUM MATCHES ───────────────────────────────────────────────────────
  // utcH = kickoff hour in UTC. 19:00 UTC = 21:00 CEST.
  belgiumMatches: [
    { id: 'bel-egy', date: '2026-06-15', utcH: 19, opponent: 'Egypte',        flag: '🇪🇬', venue: 'Seattle' },
    { id: 'bel-iri', date: '2026-06-21', utcH: 19, opponent: 'Iran',          flag: '🇮🇷', venue: 'Los Angeles' },
    { id: 'bel-nzl', date: '2026-06-26', utcH:  3, opponent: 'Nieuw-Zeeland', flag: '🇳🇿', venue: 'Vancouver' },
  ],

  // ── URLS ──────────────────────────────────────────────────────────────────
  siteUrl:    'https://bikeberingen.netlify.app',
  shareTitle: 'Doe mee aan het Beringen WK Kampioenschap 2026!',
  shareText:  'Voorspel de Rode Duivels-uitslagen en win fietsacties bij Bike Center Beringen.',

};
