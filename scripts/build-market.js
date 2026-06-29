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
  be: 'https://digistiel.be',
  nl: 'https://digistiel.nl',
};

function resolve() {
  const key    = process.env.MARKET || 'be';
  const market = getMarket();
  const base   = (process.env.URL || DOMAINS[key] || DOMAINS.be).replace(/\/+$/, '');
  return { key, market, base };
}

function replacements({ market, base }) {
  return {
    '__SITE_BASE__': base,
    '__HTML_LANG__': market.lang,
    '__OG_LOCALE__': market.locale,
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
  console.log(`[build-market]   html lang      : ${m.lang}`);
  console.log(`[build-market]   og:locale      : ${m.locale}`);
  console.log(`[build-market]   canonical base : ${ctx.base}`);
  console.log(`[build-market]   retention      : ${m.legal.retention}`);
  console.log(`[build-market]   tuple          : ${JSON.stringify(m)}`);

  if (print) return;

  const targets = ['index.html', 'sitemap.xml', 'robots.txt'];
  for (const f of targets) {
    const full = path.join(root, f);
    const ok = applyTo(full, repl);
    console.log(`[build-market]   ${ok ? 'wrote' : 'skipped (missing)'}: ${full}`);
  }
}

main();
