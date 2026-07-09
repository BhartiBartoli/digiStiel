#!/usr/bin/env node
'use strict';

// ── Category A: build-time, per-site market injection ─────────────────────────
// SEO/crawler-critical surface (html lang, og:locale, canonical/og:url/og:image,
// sitemap <loc>, robots Sitemap) MUST be set per site before the first paint,
// because crawlers run no JS and never call /api/analyse. Netlify runs this as
// the build command; each site passes its own MARKET env var.
//
// The same getMarket() config that the runtime Function uses (Category B) is read
// here at build time — one config, two read moments.
//
// Usage:
//   node scripts/build-market.js              # inject into ./ (Netlify build)
//   node scripts/build-market.js --root DIR   # inject into DIR instead of cwd
//   node scripts/build-market.js --print      # print resolved values + tuple, no write

const fs   = require('fs');
const path = require('path');
const getMarket = require('../netlify/functions/market.js');

// Per-market canonical domain. Prefer Netlify's own site URL (per-site, set
// automatically); fall back to the MARKET-keyed map for local runs/tests.
// Domain is not a config axis — it is resolved here, not stored in the tuple.
const DOMAINS = {
  be:  'https://digistiel.be',
  nl:  'https://digistiel.nl',
  com: 'https://digistiel.com',
};

function resolve() {
  const key    = process.env.MARKET || 'be';
  const market = getMarket();
  const base   = (process.env.URL || DOMAINS[key] || DOMAINS.be).replace(/\/+$/, '');
  return { key, market, base };
}

// Per-market OPEN-LAYER copy — build-time injection, exact same mechanism as the SEO tokens above.
// be/nl = the delivered NL copy (identical; no Flemish/NL split yet). com (EN) is delivered later by
// M&S — do NOT invent EN here; a com open-build fails loudly until that copy is added below.
const NL_OPEN = {
  '__OPEN_TAGLINE__':     'Probeer me. Misschien levert het je iets op.',
  '__OPEN_PLACEHOLDER__': 'Waar wil je met je bedrijf naartoe?',
  '__OPEN_DISCLOSURE__':  'Je praat met de AI-assistent van digiStiel (EU AI Act art. 50).',
  '__OPEN_RESET__':       'Opnieuw beginnen',
  '__OPEN_CHIP_1__':      'Er komen te weinig nieuwe klanten binnen',
  '__OPEN_CHIP_2__':      'Aanvragen en mailtjes blijven te lang liggen',
  '__OPEN_CHIP_3__':      'Geïnteresseerden haken af voor ze kopen',
  '__OPEN_CHIP_4__':      'De verkoop hangt te veel van jou af',
  '__OPEN_CHIP_5__':      'Klanten komen één keer en dan niet meer terug',
  '__OPEN_CHIP_6__':      'De cijfers bewegen, maar je weet niet waaróm',
  '__OPEN_FOOTER__':      'powered by Atlas',
};
const OPEN_COPY = {
  be: NL_OPEN,
  nl: NL_OPEN,
  // com: { ...EN... }  ← TODO (M&S): Engelse open-laag-copy voor .com. Geen com-open-build tot dit bestaat.
};

function replacements({ key, market, base }) {
  const open = OPEN_COPY[key];
  if (!open) {
    throw new Error(
      `[build-market] geen OPEN_COPY voor MARKET='${key}'. De open-laag-copy voor deze markt bestaat ` +
      `nog niet (bv. .com EN volgt later via M&S). Injectie van lege copy geweigerd.`
    );
  }
  return {
    '__SITE_BASE__': base,
    '__HTML_LANG__': market.lang,
    '__OG_LOCALE__': market.locale,
    ...open,
  };
}

function applyTo(filePath, repl) {
  if (!fs.existsSync(filePath)) return false;
  let src = fs.readFileSync(filePath, 'utf8');
  for (const [token, value] of Object.entries(repl)) {
    src = src.split(token).join(value);
  }
  fs.writeFileSync(filePath, src);
  return true;
}

function main() {
  const args   = process.argv.slice(2);
  const print  = args.includes('--print');
  const rootIx = args.indexOf('--root');
  const root   = rootIx !== -1 ? args[rootIx + 1] : process.cwd();

  const ctx  = resolve();
  const repl = replacements(ctx);

  // Always print a resolved summary so the build log (and the test) is legible.
  const m = ctx.market;
  console.log(`[build-market] MARKET=${ctx.key}`);
  console.log(`[build-market]   legalStatus    : ${m.legalStatus}`);
  console.log(`[build-market]   html lang      : ${m.lang}`);
  console.log(`[build-market]   og:locale      : ${m.locale}`);
  console.log(`[build-market]   canonical base : ${ctx.base}`);
  console.log(`[build-market]   jurisdiction   : ${m.jurisdiction}`);
  console.log(`[build-market]   annexSet       : ${m.annexSet}`);
  console.log(`[build-market]   retention      : ${m.legal.retention}`);
  console.log(`[build-market]   liabilityRegime: ${m.legal.liabilityRegime}`);
  console.log(`[build-market]   promotionRegime: ${m.legal.promotionRegime}`);
  console.log(`[build-market]   tuple          : ${JSON.stringify(m)}`);

  // ── Dwingende legalStatus-gate ──────────────────────────────────────────────
  // HOE de gate afdwingt: dit script is het Netlify build-command. process.exit(1)
  // bij 'blocked' geeft de build een non-zero exit, waardoor Netlify de deploy
  // AFBREEKT — er wordt niets gepubliceerd. Een geblokkeerde markt kan dus niet
  // live, ook niet per ongeluk. Dit is een build-time hard fail, geen runtime-warn.
  if (m.legalStatus === 'blocked') {
    console.error(
      `[build-market] BLOCKED: markt '${ctx.key}' heeft legalStatus 'blocked'. ` +
      `Deploy geweigerd — geen publicatie tot juridische vrijgave.`
    );
    process.exit(1);
  }

  if (print) return;

  const targets = ['index.html', 'sitemap.xml', 'robots.txt'];
  for (const f of targets) {
    const full = path.join(root, f);
    const ok = applyTo(full, repl);
    console.log(`[build-market]   ${ok ? 'wrote' : 'skipped (missing)'}: ${full}`);
  }
}

main();
