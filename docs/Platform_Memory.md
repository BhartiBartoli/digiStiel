# Platform — Memory

> **LIVING DOCUMENT — still in progress.** This is the richest role and the
> founder intends to continue these sessions in Claude and eventually take the
> object model to Claude Code for implementation.
>
> **Layer note (House of Brands):** this doc describes the **Platform Engine —
> internal name "Atlas"**. Structure: **Aevor → Platform Portfolio → Atlas →
> Commercial Brands.** Atlas is the **first Platform Engine** in the Portfolio,
> **not "the" platform**. The Portfolio owns cross-engine standards, governance,
> the Capability Contract-schema and compatibility (no services); the five
> capabilities are **Atlas'** (engine-bound). Atlas is versioned (1.0, 2.0…) and
> appears externally only as "Powered by Atlas". Its five internal capabilities
> (never external): **Bifrost** (integration), **Aegis** (security), **Argus**
> (intelligence), **Heimdall** (platform ops), **Yggdrasil** (knowledge/memory).
> See `BrandArchitecture.md`.
>
> **⚠ Known gap — canon to distil.** Platform sessions have decided more than is
> captured here: **Engine OS, Runtime, Registry, Capability Contract-schema,
> Capability Manifest**, the **Q4 / three-layer decision test**, the
> **Evolution-canoniek**, and **Reserve-Don't-Activate**. These are named in
> `BrandArchitecture.md` but not yet fully defined here — bring them over from the
> Platform/Atlas sessions so this doc matches the real architecture and Notion.
>
> Owns: object model, architecture, platform economics, the sparring agent.
> Structure below: **A. DECIDED (foundation)** → **B. DECIDED (economics)** →
> **C. THE SPARRING AGENT** → **D. OPEN / WHERE WE LEFT OFF**.

---

## A. DECIDED — Object model foundation (Sessions 3–5)

Purpose of the platform engine: **continuously discovering, protecting and
creating measurable customer value.** Not delivering software.

### The canonical object hierarchy — platform is **Value Plan Centric**

```
Strategic Goal
   ↓
Value Plans            ← primary operational object
   ↓
Operational Goals
   ↓
Value Indicators
```
with, around execution:
```
Solutions → Execution → Outcomes → Learning → New Value Creation
```

### Core objects

- **Strategic Goals** — customers think in business goals (revenue, profit,
  retention, efficiency), not in Value Plans. Sit above Value Plans. **Max 5**
  (forces focus).
- **Value Plans** — primary operational object; define what value, how, which
  solutions, how success is measured.
- **Operational Goals** — measurable, execution-linked (e.g. 1,000 → 1,300 visitors).
- **Value Indicators** — what the customer sees (Revenue, Customers, Retention,
  Conversion). Internally linked to leading/lagging indicators, but that
  complexity stays hidden. "The customer sees progress, not complexity."
- **Advice Records** — advice as a *governed business object* (not a chat answer).
  Lifecycle: Discovery → Validated Understanding → Advice Record → Customer
  Review → Accepted/Rejected → Decision Record → Value Plan → Outcome.
  **Decided (Session 06): Advice Record is a core object** (own lifecycle,
  ownership, billing, governance, acceptance — passes the object-model test).
- **Decision Records** — core object. "Organizations remember decisions, not
  conversations." Capture rationale, ownership, expected impact, actual outcome,
  learning. Mostly hidden from customers; essential for governance/auditability/memory.
- **Solutions** — always belong to a Value Plan (e.g. Shopify Store, Loyalty
  Program, CRM, Campaign Engine). Have name/purpose/lifecycle; use capabilities.
- **Capabilities** — internal building blocks; customers never need to understand them.
- **Learning Record** — still **hypothetical** as a formal object (Learning is a
  step in the cycle, not yet formalised on par with Decision Record).

### Current object set (Session 06)
- Governance Layer: Validated As-Is, Decision Record
- Value Creation Layer: Insight, Opportunity, Advice Record, Value Plan
- Outcome Layer: Outcome, Learning Record (hypothetical)

### Architecture principles

- **Conversation First:** Open Chat → Discovery → Validated Understanding →
  Potential Value → Login → Value Plan. First interaction feels like a
  conversation, not software. Login comes *after* proven value.
- **Quantification Rule:** no Value Plan without measurable value (€, %, time,
  count, ratio, score). Value without measurement is not a valid objective.
- **Customer Language Principle:** platform adapts to the customer's language;
  customer never learns digiStiel vocabulary.
- **Chat Philosophy:** not "ChatGPT with folders". Chats become memory
  (insights/decisions/outcomes/learnings); only active conversations stay visible.
  Memory summarizes, does not replay.
- **Agent Architecture:** dedicated layer that executes/monitors/optimizes/
  coordinates. **"Governance decides, Agents execute."** Agents may create and
  manage other agents (e.g. Marketing Agent → Copywriting Agent). Expected to
  grow dynamically. *(Conceptual only — not yet implemented.)*

### Value creation distinctions

- **Flow vs Boost:** Flow = continuous value creation (no end state); Boost =
  temporary (events, campaigns, seasonal — natural ending, learnings reusable).
  *(Note: Start/Flow/Boost are also GTM/contract models — see M&S. The value
  logic here and the commercial logic there are two lenses on the same thing.)*
- **Constraint-Based Value Creation:** success is not "goal achieved → done" but
  Goal Achieved → Learning → Constraint Detection → Opportunity → New Value
  Creation. (Architectural basis for Land & Expand.)

---

## B. DECIDED — Platform economics

### Operating model: **Model B — Managed Value Creation Platform**
All business-case assumptions use Model B.
- **Model A** (AI-Assisted Consultancy) — rejected; consultancy economics.
- **Model B** (AI does majority of discovery/analysis/advice; humans do
  validation, governance, trust, exception handling) — **selected**; leverage +
  accountability; realistic for first 100–1,000 customers.
- **Model C** (Autonomous) — possible long-term, not modelled now.

### The Four Economic Layers
L1 **AI** (capability/enabler, commoditising → not the moat) · L2 **Trust**
(determines remaining human effort → margin driver) · L3 **Reuse** (determines
avoidable work → leverage/valuation driver) · L4 **Value Realization** (what the
customer actually pays for).

### Human Activity Model (baseline before any Customer-to-FTE estimate)
Customer-to-FTE is an *output* of human-effort allocation, not a design input.
- **Discovery:** AI-Led → Fully Autonomous (human 5–10% → 0–5%).
- **Advice:** AI-Led (generating advice is an AI problem; *trusting* it is a
  governance problem). Human for high-impact/sensitive/unusual + escalations.
- **Value Plan creation:** AI-Led; human for validation/prioritisation/commercial.
- **Customer Success:** shifts from tickets to relationship management.
- **Platform Operations:** mostly AI-assisted; scales much slower than revenue.
- **Governance:** **Human-AI Hybrid** (corrected from "AI-Led"). Accountability
  stays human even at 1,000 customers. Model as a permanent activity; reduce via
  trust, don't eliminate.

### Managed Execution as a temporary economic layer
Customers often buy *outcomes*, not recommendations ("Can you help us implement
this?" before "Can you advise us?"). Evolution:
Phase 1 Advice + Managed Execution → Phase 2 Assisted Execution → Phase 3
Partner-Led Execution → Phase 4 Customer Autonomy. Managed execution = a **trust
accelerator**, not a permanent model.

### Trust & Reuse — the core formula
**Margin Expansion = Trust + Reuse.** Trust lowers governance cost (margin
driver, human scaling driver). Reuse lowers delivery cost (leverage, platform
scaling driver). **Trust improves margins; Reuse improves valuation** — a subtle
but critical investor distinction.
- **Trust is a *consequence* variable**, built from competence + integrity +
  benevolence → hence **Trust Formation Economics**: which activities build trust?
- **Reuse:** Learning → Pattern → Playbook → Reuse. Customer 50 cheaper than
  customer 5 — not from more trust, but from having seen 45 similar situations.
- White-label tenant model (one codebase, per-customer `tenant.js`) is concrete
  early Reuse — proven on Bike Center.

### The single most important economic question
**"How much human effort remains per customer?"** — determines whether digiStiel
behaves like consultancy / managed services / software. More impact on valuation
than any technical decision.

---

## C. THE SPARRING AGENT (digiStiel landing-page product)

> Layer note: the sparring-agent *technology* is platform-engine capability, but
> as deployed it is the **digiStiel commercial brand's** entry point (digistiel.be,
> BE+NL, 1–50 FTE). Other commercial brands would get their own entry experience
> on the same engine.

Positioned as an **operational denkpartner** (not "sparring partner").
- Seven-step internal reasoning loop; symptom-vs-cause analysis first.
- Conversation sequence: **herkenning → veiligheid → verduidelijken → patronen →
  aannames → knelpunt → richting.**
- Psychological safety: normalise operational chaos before investigating it.
- Three certainty levels (high/medium/low).
- **Ten operational archetypes:** founder_dependency, geheugenoperatie,
  onzichtbaar_herwerk, opvolgingsverval, klantverdwijning, wachtrij-instorting,
  handmatige_orkestratie, schaalvermoeidheid, informatieversplintering,
  compensatiepatroon.
- `[NUDGE]` token triggers a WhatsApp/email contact prompt with pre-filled context.
- Architecture: static HTML + one `tenant.js` per deployment, Netlify Functions
  as Claude-API proxy + Airtable logging, localStorage for game state.

> **TODO:** the full, final system prompt of the sparring agent is NOT yet stored
> here. It should be copied verbatim from the source chat and added as a
> canonical Platform artefact — it is core IP for the Claude Code phase.

---

## D. OPEN / WHERE WE LEFT OFF

- **Biggest open question:** does long-term leverage come more from **Trust
  Accumulation** or **Knowledge Reuse**? Hypothesis: 0→100 customers Trust
  dominant; 100→1,000 Reuse dominant (Retail/Lead-Gen/Retention/Seasonality
  Playbooks make each next customer cheaper). To be confirmed.
- **Customer-to-FTE ratios** not yet estimated (next step, using the Human
  Activity Model as baseline).
- **Trigger** for a customer moving low→high trust (and Phase 1→Phase 2 billing)
  still open.
- **Making trust measurable** (can it predict delivery effort / be a leading
  margin indicator?) — open modelling question.
- **Learning Record** formal-object status to be decided.
- **Agent Architecture** implementation not yet worked out — candidate for Claude Code.
- **Next move toward build:** consolidate the object model into a single,
  stable spec document, then open a Claude Code session with it.
