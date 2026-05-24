# Nieuwe klant deployen — 5 stappen, 10 minuten

## Stap 1 — Kopieer de deployment folder
```bash
cp -r deployments/bikeberingen deployments/nieuweklant
```

## Stap 2 — Pas tenant.js aan
Open `deployments/nieuweklant/tenant.js` en wijzig:
- `id` → unieke slug (bv. `fietsenjanssen`)
- `name`, `shortName`, `city`, `tagline`, `campaignName`
- `primaryColor`, `secondaryColor`, `accentColor`
- `whatsapp`, `whatsappMsg`, `phone`, `email`, `address`
- `rewardExact`, `rewardWinner`, `rewardText`, `rewardExpiry`
- `services` → diensten van de klant
- `hours` → openingsuren
- `leaderboardSeeds` → 5 lokale namen van de stad
- `belgiumMatches` → ongewijzigd (zelfde voor iedereen)
- `siteUrl` → definitieve URL na deploy

## Stap 3 — Update sitemap.xml
Pas de `<loc>` URL aan naar het nieuwe domein.

## Stap 4 — Deploy naar Netlify
1. Ga naar app.netlify.com/drop
2. Sleep de `deployments/nieuweklant/` folder op de pagina
3. Stel site-naam in: bv. `fietsenjanssen`
4. Voeg environment variabele toe: `ANTHROPIC_API_KEY` = jouw sleutel

## Stap 5 — Klaar
URL: `https://fietsenjanssen.netlify.app`

## Wat is GEDEELD (nooit aanpassen per klant)
- `index.html` — volledige platform engine
- `netlify/functions/` — alle serverless functies
- `netlify.toml` — build config

## Wat is PER KLANT (alleen dit bestand)
- `tenant.js` — alle klantspecifieke configuratie

## Analytics per klant
Elk Netlify-account heeft zijn eigen analytics dashboard.
Geen extra setup nodig — Netlify registreert pageviews automatisch per site.

## Kosten per klant
- Hosting: €0 (Netlify gratis tier)
- Functions: €0 (125K calls/month gratis)
- Analytics: €0 (Netlify basic analytics)
- AI analyse: ~€0.01-0.05/maand (Claude API, alleen bij ↻ refresh)
- Domein: optioneel (~€10/jaar bij klant eigen domein)

**Totaal: €0 per klant tijdens het toernooi**
