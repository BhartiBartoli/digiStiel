// ═══════════════════════════════════════════════════════════════════
//  TENANT CONFIG — Bike Center Beringen
//  Copy this file for each new client. Change ONLY this object.
//  All campaign logic, scoring, gamification stays in index.html.
// ═══════════════════════════════════════════════════════════════════

const TENANT = {
  // ── IDENTITY ──────────────────────────────────────────────────
  id:           'bikeberingen',
  name:         'Bike Center Beringen',
  shortName:    'Bike Beringen',
  city:         'Beringen',
  tagline:      'Jouw fietsenwinkel in Beringen',
  campaignName: 'Beringen WK Kampioenschap 2026',
  icon:         '🚴',

  // ── BRANDING ──────────────────────────────────────────────────
  primaryColor:   '#e8281e',   // main brand red
  secondaryColor: '#1a1a2e',   // topbar / dark navy
  accentColor:    '#f5a623',   // gold / highlight
  logoUrl:        null,        // null = use icon emoji; or '/logo.png'

  // ── CONTACT ───────────────────────────────────────────────────
  whatsapp:       '32470000000',
  phone:          '+32 (0)11 000 000',
  email:          'info@bikecenterberingen.be',
  address:        'Koolmijnlaan 1, 3580 Beringen',
  mapsUrl:        'https://maps.google.com/?q=Bike+Center+Beringen',
  bookingUrl:     null,        // null = use built-in modal; or external URL

  // ── CAMPAIGN REWARD ───────────────────────────────────────────
  reward: {
    label:        '€15 korting',
    description:  '€15 korting op elke onderhoudsbeurt',
    perfect:      'Alle 3 perfect voorspeld = GRATIS kleine beurt (t.w.v. €29)',
    voucherCode:  'WKDUIVELS2026',
    validUntil:   '19 juli 2026',
  },

  // ── PROMOTIONS (per match — index 0,1,2 = wedstrijd 1,2,3) ───
  promos: [
    {
      trigger:    'belgium_goal',   // show if Belgium scores
      text:       '🔴 LIVE: België scoort! Kom morgen langs voor 10% korting op banden.',
      cta:        'Afspraak maken',
      urgent:     true,
    },
    {
      trigger:    'always',
      text:       'WK Zomercheck — banden, remmen, derailleur. Klaar voor de zomer.',
      cta:        'Boek nu — v.a. €29',
      urgent:     false,
    },
  ],

  // ── OPENING HOURS ─────────────────────────────────────────────
  hours: [
    { day: 'Maandag',   open: null },
    { day: 'Dinsdag',   open: '9:00–18:00' },
    { day: 'Woensdag',  open: '9:00–18:00' },
    { day: 'Donderdag', open: '9:00–18:00' },
    { day: 'Vrijdag',   open: '9:00–18:00' },
    { day: 'Zaterdag',  open: '9:00–17:00' },
    { day: 'Zondag',    open: null },
  ],

  // ── SERVICES ─────────────────────────────────────────────────
  services: [
    { icon: '🔧', name: 'WK Zomercheck',    desc: 'Banden, remmen, derailleur, lichten.',  price: 'v.a. €29' },
    { icon: '⚡', name: 'E-bike Diagnostiek', desc: 'Batterij, motor, software update.',     price: 'v.a. €49' },
    { icon: '🔩', name: 'Grote Beurt',       desc: 'Volledige revisie. Niks vergeten.',     price: 'v.a. €79' },
    { icon: '🛞', name: 'Bandreparatie',     desc: 'Lekke band? Snel en voordelig.',        price: 'v.a. €9'  },
  ],

  // ── SEEDED LEADERBOARD (realistic fake entries for launch) ───
  // Real submissions via Netlify Forms will populate alongside these.
  seedLeaderboard: [
    { name: 'Thomas V.',  city: 'Beringen', pts: 6, avatar: '👨' },
    { name: 'Sofie M.',   city: 'Beringen', pts: 5, avatar: '👩' },
    { name: 'Kevin D.',   city: 'Beringen', pts: 4, avatar: '👨' },
    { name: 'Nathalie B.',city: 'Beringen', pts: 3, avatar: '👩' },
    { name: 'Joris L.',   city: 'Ham',      pts: 3, avatar: '👨' },
  ],

  // ── BELGIUM MATCHES (update if schedule changes) ──────────────
  belgiumMatches: [
    { id: 'bel-egy', date: '2026-06-15', utcH: 19, opponent: 'Egypte',       flag: '🇪🇬', venue: 'Seattle'    },
    { id: 'bel-irn', date: '2026-06-21', utcH: 19, opponent: 'Iran',         flag: '🇮🇷', venue: 'Los Angeles' },
    { id: 'bel-nzl', date: '2026-06-26', utcH: 3,  opponent: 'Nieuw-Zeeland',flag: '🇳🇿', venue: 'Vancouver'  },
  ],

  // ── PREDICTION LOCK (minutes before kickoff) ──────────────────
  lockMinutesBefore: 60,

  // ── PWA ───────────────────────────────────────────────────────
  pwaName:      'WK2026 Beringen',
  pwaShortName: 'WK Beringen',
  themeColor:   '#1a1a2e',

  // ── ANALYTICS (Netlify Analytics is per-site, no code needed)
  // Add optional Plausible/Fathom snippet here if needed:
  analyticsSnippet: null,

  // ── SOCIAL SHARE ─────────────────────────────────────────────
  shareText: 'Ik doe mee aan het Beringen WK Kampioenschap via Bike Center Beringen! 🇧🇪⚽ Voorspel jij ook?',
  shareUrl:  'https://bikeberingen.netlify.app',
};
