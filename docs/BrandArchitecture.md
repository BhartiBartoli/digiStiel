# Aevor — Corporate & Brand Architecture (House of Brands)

> **Canonical Vision / Corporate Architecture decision.** The company is an
> international **AI Platform Company**, not a single product and not a software
> or consultancy company. This file is the visible structure: every layer has a
> name and a place so the founder can work inside it and Aalex can add to it.
> Named ≠ filled: layers marked "empty box" exist as structure, with their design
> deliberately deferred (anti-scope-creep). Designed for 20+ years, multiple
> platforms, brands, white-label partners and future acquisitions.

---

## The full structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  AEVOR — Corporate / Holding            EXTERNAL · aevor.eu (registered)│
│  Owns: IP · platforms · brands · shared services · governance · finance │
│  · HR · legal · security · AI research · platform eng · partners ·      │
│  investment. Sells nothing. Inspires trust.                             │
├──────────────────────────────────────────────────────────────────────┤
│  PLATFORM PORTFOLIO                      the layer that holds engines    │
│  Groups one-or-more Platform Engines. Owns cross-engine STANDARDS,       │
│  GOVERNANCE, the Capability Contract-schema, and COMPATIBILITY —         │
│  NOT services. Stays small. Makes room for a 2nd engine beside Atlas.    │
├──────────────────────────────────────────────────────────────────────┤
│  ATLAS — first Platform Engine    ENGINE/ENDORSEMENT BRAND · versioned   │
│  The first AI Value Creation Engine in the Portfolio (NOT "the" platform)│
│  Externally visible only as "Powered by Atlas" → links to aevor.eu/atlas│
│  (own brands only; hidden under white-label). No own domain.            │
│    ├─ Bifrost   — Integration (APIs, connectors, messaging, workflow)   │  INTERNAL
│    ├─ Aegis     — Security (identity, governance, compliance, perms)    │  capabilities
│    ├─ Argus     — Intelligence (BI, AI intel, monitoring, analytics)    │  ENGINE-BOUND
│    ├─ Heimdall  — Platform Ops (observability, health, control, perf)   │  (Atlas' own)
│    └─ Yggdrasil — Knowledge (graph, memory, semantic layer, reasoning)  │  versioned
├──────────────────────────────────────────────────────────────────────┤
│  ROUTES TO MARKET (two)                                                  │
│                                                                          │
│  A) OWN COMMERCIAL BRANDS            EXTERNAL · "Powered by Atlas" shown  │
│     • digiStiel  ← EXISTS  (BE+NL · 1–50 FTE · RevOps)                   │
│     • future brands → other segment / market / value domain             │
│                                                                          │
│  B) WHITE-LABEL                     partner brand · Atlas/Aevor HIDDEN    │
│     • e.g. "Powered by BDO" · partner's own GT&C · contract Aevor↔partner│
│       Any reference to Aevor or Atlas is irrelevant to the end customer. │
├──────────────────────────────────────────────────────────────────────┤
│  Within each commercial brand:                                          │
│    VALUE PLAN  ← the central commercial object (the customer buys this)  │
│        ▼                                                                 │
│    COMMERCIAL ENGAGEMENT MODELS  (Start · Flow · Boost)                  │
│        — appear AFTER a Value Plan exists; define how it is delivered    │
│    AI AGENTS  (support products; naming follows brand, not platform)     │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Platform Portfolio — the layer that holds engines (canonical)

**Decided with Platform.** The structure is
**Aevor → Platform Portfolio → Atlas → Commercial Brands.**
Atlas is therefore **not "the platform"** — it is the **first Platform Engine**
inside an extensible Platform Portfolio. The Portfolio makes room for a second
(differently-designed) engine beside Atlas later — and connects directly to the
white-label "partner manages a full platform" mode.

**What the Portfolio owns (stays small):** cross-engine **standards**,
**governance**, the **Capability Contract-schema**, and **compatibility**. It
owns **no services**. If it took on engine-specific content it would become "a
second Atlas" — explicitly warned against.

### The capability conclusion (decided)

The five capabilities (Bifrost, Aegis, Argus, Heimdall, Yggdrasil) belong to
**Atlas, not the Portfolio.** Reasoning (existing three-layer decision test,
Q4 = engine-boundness): a built capability runs on Atlas' own Engine OS, Runtime
and Registry — it is engine-bound. A second engine would have its own
capabilities, possibly sliced into different domains. So both the built
implementations *and* their specific names/domain-carving are an Atlas ordering,
not a universal truth.

The Portfolio owns only the **form** the capabilities must take (the Capability
Contract-schema), not the capabilities themselves. The five capabilities are
*services*; the Portfolio holds no services — so they cannot live there.

> **Distinguish three senses of "capability":** (1) the *domain* (the empty box:
> "integration", "security" …) — a category; (2) the *implementation* (the built,
> contract-conform Bifrost capability, with a Manifest) — the thing that runs;
> (3) the *Capability Contract-schema* (the universal form every implementation
> takes) — already Portfolio-owned. Senses (1) and (2) sit under Atlas; sense (3)
> under Portfolio.

> **Open (not yet needed):** whether a portfolio-wide capability *taxonomy
> standard* ever emerges (the rule *that* you divide into domains, independent of
> which) is a Portfolio question for when engine two exists. Not to be decided now
> ("Reserve-Don't-Activate").

### Referenced Platform/Atlas concepts (named here, fully defined in Platform sessions)

These are **decided** terms that appear in the Platform canon but whose full
definitions are **not yet distilled into `Platform_Memory.md`** — to be brought
over from the Platform/Atlas sessions: **Engine OS**, **Runtime**, **Registry**,
**Capability Contract-schema**, **Capability Manifest**, the **Q4 / three-layer
decision test** (Portfolio-level = reusable across engines; Atlas-level =
reusable across brands but engine-bound), the **Evolution-canoniek**, and
**Reserve-Don't-Activate** (don't build/decide portfolio-level structure before a
second engine actually needs it).

---

## Name layers — three kinds (important)

1. **External brand names** — full naming framework + domain registration.
   - **Aevor** (corporate) — **registered: aevor.eu.** Confirmed.
   - **digiStiel** (first commercial brand) — exists.
   - future commercial brands — each runs the framework.
2. **Engine / endorsement brand — Atlas.** Externally visible as "Powered by
   Atlas" (own brands only), hosted under aevor.eu, **no own domain.** Nobody
   buys Atlas directly. *Open:* Atlas needs a light external check (international
   usability, not legally blocked) since it appears on customer pages — but not
   full domain/brand registration.
3. **Purely internal names — the five capabilities** (Bifrost, Aegis, Argus,
   Heimdall, Yggdrasil). **Never external, never a domain, no naming check.**
   They exist to structure the engine and to *feed* commercial propositions.

## Versioning (flexibility to build in today)

Atlas and the capabilities are **versioned** (Atlas 1.0, 2.0, …; capabilities
likewise). Brands and contracts reference a version. This lets the platform
evolve without moving the brand or contract layer — e.g. a white-label partner
can run Atlas 1.4 while digiStiel runs 2.0. **Concrete version numbers are an
empty box for now; the flexibility is the point.**

## What digiStiel IS (unchanged)

digiStiel is a **Commercial Brand** — Belgium + Netherlands, **1–50 FTE only**,
**Revenue Operations value creation only.** Tagline "From Goals to Measurable
Value" and the category line are commercial-brand messaging. digiStiel is now
**one layer down** from before: it is the first brand under Atlas/Aevor, not the
company.

## Start / Flow / Boost — Commercial Engagement Models (not products)

Confirmed architecture principle. Start/Flow/Boost are **Commercial Engagement
Models** (a.k.a. Commercial Delivery Models): they define contract form, pricing,
invoicing, service level, delivery approach and intensity of collaboration —
**not** what the customer buys and **not** the content of the Value Plan. They
appear only **after** a Value Plan exists. They are never described as products,
product lines, UX objects, sub-brands or primary propositions. They are
platform- and brand-independent: any commercial brand can reuse them.

Flow: `Commercial Brand → Value Discovery → Validated Understanding →
Opportunity Discovery → Value Plan → Commercial Engagement Model (Start/Flow/Boost)`.

## The five Vision principles (canonical, unchanged)

1. Corporate Brand inspires trust; Commercial Brands communicate value.
2. The Platform Engine (Atlas) is independent from Commercial Brands.
3. Commercial Brands represent **markets and segments**, not feature bundles.
4. **Brand Architecture follows Platform Architecture, never the reverse.**
5. The architecture must support **20+ years** of international growth: new
   platforms, brands, markets, entities, white-label partners and acquisitions
   without fundamental restructuring.

---

## How this scopes the memory docs

- **Atlas / platform engine** (brand-agnostic, serves all brands) →
  `Platform_Memory.md`. Object model, governance architecture, Trust/Reuse
  economics, agents, memory. Written as the engine.
- **digiStiel commercial brand** (1–50 FTE RevOps, BE+NL) →
  `MarketingSales_Memory.md`, commercial parts of `BusinessPlan_Memory.md`,
  `Customers/`.
- **Corporate (Aevor) / shared services / capabilities** → this file, until they
  grow enough to warrant their own docs.

Vision owns this architecture; no other role may change it.

---

## Aevor corporate substructure (Notion pages — mostly empty boxes)

Aevor is positioned as an **AI Platform Company** designed to carry multiple
platforms, brands, international entities and white-label ecosystems over 20+
years. Corporate responsibility explicitly includes **capital allocation**
(deciding where capital and focus go across platforms and brands).

The corporate topics live as sub-pages under Aevor in Notion. Most are **empty
boxes** — deliberately, as a visual map of what still needs work:

- **Corporate Relations & Strategic Partnerships** — corporate-strategic
  relations (strategic partnerships, white-label relations, connections, investor
  relations). NOT ordinary S&M — that lives in the brands. May get its own
  sub-pages (Investor Relations, White-label Relations).
- **Investment Philosophy** — how Aevor allocates capital across platforms/brands.
- **Portfolio Governance** — how it is decided which platform/brand starts, grows
  or stops (governance of the Platform Portfolio and the brand portfolio).
- **Acquisition Strategy** — can Aevor buy platforms/brands/capabilities, on what terms.
- **Partner Ecosystem** — white-label partners and the wider ecosystem as a
  strategic layer (overlaps with Corporate Relations).
- **Legal Structure** — entities, IP ownership, GT&C framework, white-label
  contract structure, liability. Owner: Juridical.
- **Finance (future)** — future shared service, not yet active. Empty box.
- **HR (future)** — future shared service, not yet active. Empty box.

> Shared-service split (Corporate/Platform/Brand services) is **not** made yet —
> that would be over-engineering with one platform and one brand (Reserve-Don't-
> Activate). Finance/HR exist only as future empty boxes for now.

---

## Open (deferred — founder / Vision)

- **Atlas light external name-check** (usable on customer pages, not legally blocked).
- **White-label GT&C implications** → Juridical (partner GT&C, Aevor↔partner
  contract, liability split when Atlas is hidden).
- **Capability internal designs** (Bifrost/Aegis/Argus/Heimdall/Yggdrasil) — empty
  boxes, to be designed later; do not fill prematurely.
- **Naming framework** for external brands (criteria, not names).
- **Brand governance rules:** new Commercial Brand vs. new Product? new market =
  own brand?
- **The five enterprise-review deliverables** requested (enterprise architecture
  review; Claude agent structure; GitHub structure; Claude↔GitHub governance;
  roadmap) — parked in `OpenInputs.md` as separate Vision tasks, not yet done.
- **Shared Services** (Finance, HR, Legal, Security, AI Research, Platform Eng,
  Architecture, Innovation, Data, Product Mgmt, Partner Mgmt) — named as corporate
  structure, empty boxes for now.
