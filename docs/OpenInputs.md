# Open Inputs — parkeerlijst & cross-role coördinatie

> Levende lijst van wat openstaat en wie op wie wacht. Het founder-dirigeer-
> instrument (blijft in het hoofdproject, gaat niet naar Aalex). Werk bij zodra
> iets geleverd, beslist of nieuw is. Indeling: **A. Blokkerend nu** ·
> **B. Business case verdieping** · **C. Architectuur & white-label** ·
> **D. Rollen & governance** · **E. Website** · **F. De rode draad**.

---

## A. Blokkerend nu — nodig voor Business Case V1 / een raise

| # | Nodig | Eigenaar | Wacht op het voor | Status |
|---|-------|----------|-------------------|--------|
| 1 | **CAC** (echt, gevalideerd) | Marketing & Sales | Business Case, Pricing Model | Ranges gegeven (hypotheses); valideren na 10–20 betalende klanten |
| 2 | **Willingness to pay / waarde per klant** | Marketing & Sales | Pricing Model (ceiling-anchor) | Use-case-prioriteit gegeven; €-waarde nog niet hard |
| 3 | **Delivery economics: human effort/klant + reuse rate** | Platform | Pricing Model (secties D & F), Business Case | Kwalitatief (Human Activity Model) klaar; cijfers openstaand |
| 4 | **Onboarding effort** | Platform | CAC / payback-model | Open |
| 5 | **Concrete klantcases (BEWIJS)** | Customers (Bike Center, WK) | M&S investor-story, Business Case | Bike Center live-status te bevestigen |

## B. Business case verdieping (V2)

| # | Nodig | Eigenaar | Wacht op het voor | Status |
|---|-------|----------|-------------------|--------|
| 6 | **Trust vs Reuse leverage** (wat domineert, wanneer) | Platform ⟷ Business Case | Waarderingsmodel | Open hypothese (0→100 Trust, 100→1.000 Reuse) |
| 7 | **Customer-to-FTE ratio's** | Platform → Business Case | Marge/schaalbaarheidsmodel | Nog niet geschat (basis = Human Activity Model) |
| 8 | **Juridische grenzen outcome-based / revenue-share pricing** | Juridical | Pricing-strategie | Open — Juridical nauwelijks gebruikt |
| 9 | **Aansprakelijkheid advies; managed-execution-blootstelling** | Juridical | Contracten, product-governance | Open |
| 10 | **GDPR / data-retentie-ontwerp** | Juridical + Platform | Memory-architectuur | Open |

## C. Architectuur & white-label

- **Platform-canon inhaalslag (bekend gat):** `Platform_Memory.md` loopt achter op
  de werkelijke Atlas-canon. Beslist maar nog niet gedistilleerd naar de brain:
  **Engine OS, Runtime, Registry, Capability Contract-schema, Capability Manifest**,
  de **Q4 / drie-lagen-beslistoets** (Portfolio = herbruikbaar over engines; Atlas
  = herbruikbaar over brands maar engine-gebonden), de **Evolution-canoniek** en
  **Reserve-Don't-Activate**. Staan bij naam in `BrandArchitecture.md` /
  `Platform_Memory.md`, definities nog uit de Platform/Atlas-sessies te halen.
  → Lever die sessies aan zodat de brain gelijkloopt met Notion.

- **White-label — twee vormen te ondersteunen (architectuur):** het model moet
  beide toelaten: (a) een partner die een **volledig platform managet** — een
  Atlas-instantie/de engine in eigen beheer neemt omdat het waardevol genoeg is
  om te exploiteren (platform-niveau white-label); en (b) een partner/klant die
  **enkel een aparte brand op een bestaande Atlas-versie** draait — de engine
  blijft van ons, zij krijgen een merk-laag gekoppeld aan een specifieke
  Atlas-versie (brand-niveau white-label). Twee verschillende commerciële +
  technische modellen. Direct gelinkt aan het versioning-principe. Uit te werken
  in een Vision/Atlas-sessie, daarna in `BrandArchitecture.md`.
- **White-label GT&C** → Juridical: partner-GT&C, Aevor↔partner-contract,
  aansprakelijkheid wanneer Atlas/Aevor onzichtbaar zijn achter het partnermerk.
- **Atlas lichte externe naam-check** (bruikbaar op "Powered by Atlas"-pagina's,
  niet juridisch bezet; geen volledige domeinregistratie).

## D. Rollen & governance

- **Enterprise architecture review (5 delen, Vision-niveau, geparkeerd):**
  (1) kritische Enterprise Architecture Review (gaten, risico's, overengineering);
  (2) optimale Claude-agentstructuur (geen duplicatie, cross-chat-governance);
  (3) optimale GitHub-structuur (mono-repo — beslist — met strakke mappen, ADRs,
  knowledge-repo, docs); (4) Claude↔GitHub-governance (GitHub als bron van
  waarheid, traceerbare beslissingen); (5) roadmap (Corporate → Governance →
  Legal → Platform → Brand → Product → GTM → Ops → Investors → Scale).
- **"Finance"-rol — ja of nee?** Vision/Governance-call. Is operationele finance
  (facturatie, kosten-toewijzing per klant, cash-tracking) een aparte lane of een
  Business Case-uitbreiding? Pas het rol-anti-proliferatie-filter toe.
- **Cost / billing admin-dashboard** (scale-phase, uitgesteld). Volgorde:
  (1) Finance-rol-eigenaarschap beslissen → (2) Business Case definieert
  kosten/facturatie-dimensies + unit economics, Platform bepaalt hoe een
  cost/billing-laag zich verhoudt tot engine/objectmodel → (3) DevOps bouwt.
  Geen DevOps-actie tot 1–2 klaar zijn.
- **Per-rol decision-ownership formaliseren** in `Governance.md` — wacht tot
  Aalex formeel instapt.

## E. Website

- **Positionering valideren:** "Problem-in, Value-through, Goal-out" bevestigen
  vóór de Brand/Platform-siterework (zie de Vision website-analyse). Daarna scope
  verbreden van marketing-smal naar volledige RevOps, en palet naar DesignSystem.
- **Sparring-agent system prompt** volledig bewaren als canoniek artefact.

## F. De rode draad

**"Hoe bewijzen we dat waardecreatie reproduceerbaar schaalbaar wordt?"** — linkt
Marketing & Sales (referenties), Business Case (economics) en Platform (Reuse).
De belangrijkste open vraag voor de investor-story v3.
