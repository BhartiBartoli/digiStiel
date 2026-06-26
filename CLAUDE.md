# CLAUDE.md — digiStiel MVP

> Persistent project memory. Read every session. Keep under 200 lines.
> The full architecture lives in the Platform consolidation docs (passed per phase
> as reference). This file holds only what must NOT drift between sessions.

## What this is

digiStiel — an AI-powered conversational value creation platform for SMBs (KMO/MKB)
in Belgium and the Netherlands. Tagline: "From Goals to Measurable Value."
Customers buy outcomes, not software. The platform helps them turn business goals
into measurable value through conversation.

MVP = a **Managed** Value Creation Platform (human in the loop), NOT autonomous.
Launch market: BE + NL simultaneously.

## Tech stack (verify versions against package files; do not assume)

- Static HTML + vanilla JS frontend (no framework unless a phase spec says so)
- Netlify Functions as serverless backend (Claude API proxy pattern already proven)
- Airtable as lightweight datastore (Conversations + Messages tables proven)
- Claude API via Netlify proxy — model string set per environment, never hardcoded
  in the client
- GitHub-connected deploys (NOT drag-and-drop)
- localStorage for client-side game/session state only

## Reuse what already exists (do not rebuild)

The WK-dashboard and sparring agent already run. Reuse their proven pieces:
- Netlify Function Claude-API proxy
- Airtable logging pattern
- `tenant.js` per-deployment config model
- SSO/login pattern

## Core principle: stable core + thin configurable outer layer

This pattern repeats at every level. The core (object model, governance, agents,
memory) is identical everywhere. Only the outer layer varies.

- **`tenant.js`** varies per customer (proven on Bike Center).
- **Customer Language layer**: stable internal objects ↔ variable customer
  vocabulary. The customer never learns digiStiel terms; the platform adapts.
- **`market` config** varies per market (see below).
- **`brand`** varies per commercial proposition (House of Brands). Lay the field
  ready now beside `market`; unused in V1 (single brand), wired in V2.

**Presentation Layer (named, single place for surface rendering).** No core object
renders itself directly. Canonical object → (Customer Language + market + brand) →
rendered surface. Three inputs, one layer. Brand/market/customer language must
NEVER leak into the canonical core — the core stays brand-agnostic and
market-agnostic. Brand and Customer are commercial constructs, not platform objects.

## One codebase, `market` config (be / nl / future EU)

NEVER create separate .be and .nl codebases. One codebase, one `market` parameter.
One repo → two Netlify sites pointing at the same code, each with its market param.
A new EU market = one new config block, not a new app.

The `market` config drives three axes:
1. **Legal** — retention period (BE 10y / NL 7y), liability article refs,
   promotion/lottery rules (NL Kansspelautoriteit), GT&C annex.
2. **Language** — minor Flemish ↔ Netherlands-Dutch differences (wording, tone).
   This is the market default; it is separate from the per-customer Customer
   Language layer.
3. **GTM / adoption / UX accent** — NL: faster decisions, higher digital adoption.
   May affect UI/UX accents (how much to give away before login, CTA directness).

## The object hierarchy (fixed — do not redesign)

```
Strategic Intent      (long-lived, qualitative: Growth, Profitability, Loyalty)
   → Strategic Goal   (time-bound, quantifiable; max 5; lifecycle Proposed→Active→Achieved→Retired)
      → Value Plans   (primary operational object)
         → Operational Goals   (measurable, execution-linked)
            → Value Indicators (what the customer sees: Revenue, Customers, Retention…)
```

Around execution: Solutions → Execution → Outcomes → Learning → New Value Creation.

Rules:
- **Quantification Rule**: no Value Plan without measurable value (€, %, time,
  count, ratio, score). Intent is qualitative; Goal must be measurable.
- Core objects also include **Advice Records** and **Decision Records** (each with
  their own lifecycle and ownership).
- **Customer = commercial construct, NOT a platform object.** The platform knows
  only Account. Funnel status (lead/prospect/customer) lives in the commercial layer.

## Governance (fixed)

- **"Governance decides, Agents execute. Advisory Agents observe & inform."**
- Governance = protect value. It evaluates Value vs Cost vs Risk and may
  Continue · Adapt · Pause · Stop · Merge.
- Governance DOES NOT: create Goals/Value Plans/Patterns, execute, manage memory
  content, or become "the customer's CEO". Respect this boundary (no God Object).
- Governance stays a **human-AI hybrid** — accountability remains human even at
  scale. Reduce governance effort through trust; never eliminate it.
- **Customer Validation is mandatory**: discovery ends only when the customer
  validates the As-Is understanding. No validation → no Value Plan, no Advice.

## Build order (datastructure before screens)

Build what is stable and proves value first. UI polish LAST — it will be revised
with Aalex (UX session). The object model is fixed; the screens are not. Building
screens first = building twice.

- **Phase 1 — Backbone**: repo + `market` config + deploy pipeline → open
  anonymous discovery chat (front + Claude proxy) → discovery → Potential Value →
  SSO/login → chat migrates in as first memory.
- **Phase 2 — Object model**: Strategic Intent→Goal→Value Plans→Operational
  Goals→Value Indicators → simplified Memory (one tenant) → Advice + basic Decision
  Records → Governance basics (Protective Governance, Customer Validation).
- **Phase 3 — Connectors**: Shopify FIRST (Bike Center test case), prove the
  Connector Agent pattern on one, THEN HubSpot, THEN Zapier (breadth net). Not all
  three at once.
- **Phase 4 — Screens (last)**: Context Panel + Executive Summary + Home +
  navigation. Aalex's UX input lands here.

## Reporting principle (drives Phase 4 screens)

- Hierarchy: **Understanding → Explanation → Measurement.** Start at meaning
  (Level 1), not numbers (Level 3). Numbers are supporting evidence.
- Primary object = **Narrative Understanding, not Dashboard.** Home answers
  "what deserves my attention today?"; a Value Plan opens on Executive Summary,
  not a KPI grid.
- Progressive disclosure + customer language everywhere.

## Build the six legal adjustments in correctly from the start

These are cheap now, expensive to retrofit:
1. **Retention period = market parameter** (BE 10 / NL 7; default 10). Never
   hardcode 7.
2. **k-anonymity (k≥5) ready on the Learning→Pattern bridge** (unused in V1, but
   lay the field now).
3. **Behavioral Memory = hard human-intervention requirement** (V2 feature; never
   an automated decision about the customer without a human).
4. **Legal-basis field on the cross-account sharing decision** (alongside
   "deliberate + revocable").
5. **Processor role = default** once customer personal data is involved (SoU is
   positioning, not a GDPR exemption).
6. **GT&C = EU core + thin per-market annex.**

Also lay ready (unused in V1, ready for V2): `volatility` field on context
signals; Playbook → Value Plan reference; `brand` field beside `market` (House of
Brands — render through the Presentation Layer, never in the core).

## MVP transparency requirement (legal, blocking)

The discovery/sparring chat MUST disclose it is AI (EU AI Act art. 50, applies
from 2 Aug 2026). digiStiel is a deployer, not a provider.

## Brand principle: Problem-in, Value-through, Goal-out (validated by founder)

Cold acquisition (commercial brand, 1–50 FTE) enters at the FELT PROBLEM —
recognition, plain local language, no agency-speak. The conversation converts
pain into insight and value. The destination is a concrete goal with measurable
value.

- **Pain** = entry doorway. Never the message.
- **Value / Goal** = destination message. Never the doorway.
- Resolves the apparent tension with tagline "From Goals to Measurable Value":
  the tagline describes the platform ARC (where the conversation arrives), not
  the DOORWAY (where the entrepreneur enters).
- Pain-entry must read as **recognition**, not alarm.
- Value/goal destination must be **visibly present on the page**.
- Scope: full RevOps chain (instroom → opvolging → conversie → founder-afhankelijkheid
  → retentie → klantkennis → inzicht → schaalbaarheid). Backed by Platform input.
- Value Indicator anchors and Flow/Boost classification = Platform decisions.
  Brand may not shift these.

## Working agreements for sessions

- One phase = one session. Do not attempt "build the whole MVP" in one go.
- For any non-trivial feature: interview me with AskUserQuestion first, write a
  SPEC.md, then execute in a fresh session.
- Use plan mode before multi-file changes; I review the plan before you build.
- Show evidence, not assertions: test output, the command run and its result.
- Anti-scope-creep: when something is good enough to ship/test, ship it. Do not
  build platform features ahead of the current phase.
- Language: code/comments in English; customer-facing copy in Dutch (NL default).
