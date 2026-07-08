# digiStiel — Corporate Brain (Index)

> This is the master map of digiStiel's knowledge base. It explains what each
> file is, how the roles relate, and how to use this knowledge in a Claude
> Project. The content of this file is also the seed for the Project's custom
> instructions.

---

## What this is

digiStiel runs as a single Claude Project with six corporate roles (Vision,
Platform, Business Case, Marketing & Sales, Juridical, DevOps) plus a
governance layer. The roles are not separate "agents" that talk to each other
automatically — they are perspectives that share one curated knowledge base.
Collaboration happens by (a) each role referencing the others' memory docs, and
(b) the founder orchestrating handoffs via the Cross-Chat mechanism (see
`Governance.md`).

**Founder/leadership context.** The company is built by the founder
(CTO/COO role) and Aalex (intended CEO, 50/50 partner — see `Stakeholders.md`).
Decision-ownership per role is NOT yet formalised; this will be added to
`Governance.md` only once Aalex formally joins.

---

## The canonical source documents (read-only truth)

These are finished artefacts. They override the memory docs where they conflict,
because they are the approved, published version of the thinking.

- **Investor Teaser** (`digiStiel_Teaser_v3.pdf`) — official external positioning.
  The category definition, taglines and "in one line" statements live here.
- **Business Plan** (`digiStiel_-_Business_plan.docx`) — internal narrative; the
  "why behind the why". Chapters with approved text.
- **Cost & Pricing Model** (`digiStiel_Cost_Pricing_Model.xlsx`) — live calculator;
  placeholders to be replaced by real Platform + Sales data.

> When these are loaded into the Project as knowledge files, the memory docs
> below should reference them rather than duplicate them.

---

## The roles (memory docs)

Each role doc holds the *thinking and decisions* of that domain — including
things not yet written into the canonical documents.

| File | Role | Owns |
|------|------|------|
| `Vision_Memory.md` | Vision | Category, positioning, capital philosophy, long-term direction, **brand architecture** |
| `Platform_Memory.md` | Platform | Object model, architecture, economics, the sparring agent. **Living doc — still in progress.** |
| `BusinessPlan_Memory.md` | Business Plan / Business Case | Beliefs, model stages, economics, pricing, investor case |
| `MarketingSales_Memory.md` | Marketing & Sales | ICPs, GTM, CAC, acquisition, investor story |
| `Juridical_Memory.md` | Juridical | Liability, pricing/contract law, GDPR. **Mostly empty — to be developed.** |
| `DevOps_Memory.md` | DevOps | Build, deploys, Claude Code, operational data. Builds only after design is decided. |

## Supporting files

- `Governance.md` — the backbone. Two distinct kinds of governance (product
  governance + process governance) plus the language-output rule and customer
  governance. **Read this first in any role chat.**
- `BrandArchitecture.md` — **Aevor corporate & brand architecture (House of
  Brands)**. Aevor (holding, aevor.eu registered) → Platform Portfolio (holds
  engines; standards/governance/contracts/compatibility, no services) → Atlas
  (first Platform Engine, versioned, "Powered by Atlas" endorsement) → 5 internal
  capabilities (Atlas' own) → commercial brands (digiStiel) + white-label route →
  Value Plan → Commercial Engagement Models (Start/Flow/Boost). Named-but-empty
  layers marked.
- `DesignSystem.md` — house style for all output (Word/Excel/PPT + website rule).
- `Stakeholders.md` — Aalex and other non-customer stakeholders.
- `Customers/` — one doc per customer (currently Bike Center + the WK dashboard asset).
- `OpenInputs.md` — living list of who-waits-on-what between the roles.

---

## The two layers (House of Brands — read with `BrandArchitecture.md`)

The identity once called "digiStiel" is split across two layers:
- **Platform Engine** (brand-agnostic, serves all future commercial brands) →
  `Platform_Memory.md`.
- **digiStiel commercial brand** (BE+NL, 1–50 FTE, RevOps) → `MarketingSales_Memory.md`,
  commercial parts of `BusinessPlan_Memory.md`, and `Customers/`.

---

## How the roles actually relate (the reasoning chain)

The roles form a chain with a consistent direction, observed repeatedly across
sessions:

```
Vision  ──sets direction──▶  Platform  ──defines architecture──▶  Business Case
   ▲                            │                                      │
   └────── stays fixed ─────────┴──── corrects for realism ────────────┘
                          Governance bounds the whole loop
                       (prevents loops, protects the vision)
```

- **Vision** sets and guards the category and principles. Other roles may not
  change vision/positioning/product direction (governance rule).
- **Platform** defines the object model and asks the architecture questions.
- **Business Case** translates architecture into economics.
- **Marketing & Sales** owns market reality (ICP, CAC, acquisition).
- **Juridical** bounds the commercial model (liability, pricing law).
- **Governance** keeps the whole thing from looping and protects value.

---

## How to use this in a Project chat

1. Start a chat and name the role: e.g. "acting as digiStiel Platform".
2. The role works against the shared knowledge, deferring to the canonical
   documents and to other roles' recorded decisions.
3. To "collaborate", reference another role's memory doc, or issue a formal
   **Cross-Chat Update** (see `Governance.md`).
4. All customer-facing conversations are **governed** by a named role and follow
   the customer-governance + language rules in `Governance.md`.
