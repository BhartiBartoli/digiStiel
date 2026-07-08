# digiStiel — Governance

> The backbone of the corporate brain. Read this first in any role chat.
> It contains four distinct things: **process governance** (how the roles work
> together), **product governance** (how the platform protects value),
> **customer governance** (how customer conversations are handled), and the
> **language rule**.

---

## 1. Process Governance — how the roles work together

These rules emerged from the founder's own working method across sessions and
are the reason this whole structure exists. They keep the roles from drifting
or looping.

### The Cross-Chat Governance Rule (the three tests)

Before any role adds to a discussion, it tests the contribution:

1. **Does this add new conceptual value?** (Not just more words.)
2. **Is this a reformulation** of something already decided (Governance, Memory,
   Agents, Value Plans, Conversation First, etc.)? If yes → do not reopen.
3. **Does this change platform architecture or the business case?** If yes → it
   deserves analysis.

If a contribution fails tests 1–2, it is not pursued.

### The Loop Detection Rule

Discussions that no longer produce new conceptual value are **explicitly
declared closed** and not reopened. When a topic is closed, future mentions are
treated as settled, not as new hypotheses.

### Filter-before-think

Before new analysis, first determine which discussions are *actually* open.
This prevents parallel conceptual discussions and circular work.

### "No Further Analysis Recommended" / Discussion Closed

An explicit stabilisation signal. When a decision has clear direction, it is
closed and the work shifts from hypothesis-forming to execution (object models,
lifecycles, contracts, code). This is a different *type* of work than further
conceptual thinking.

### Decisions ≠ Hypotheses

Once a discussion is closed, its result is treated as a **decision**, not a
reopenable hypothesis.

### The Cross-Chat Update mechanism

One role gives direction to another via a **formal, labelled update** (e.g.
"Cross-Chat Update – Vision → Business Case") that does NOT overwrite the other
role's work — it provides a bounding frame. Each agent prompt carries a standard
clause: *"Do not change vision / positioning / product direction; work only
within your own domain."*

### Domain ownership

Every assumption belongs to exactly one role. Examples:
- **CAC, ICP, acquisition** → Marketing & Sales (never guessed by Business Case)
- **Delivery economics, human effort, onboarding** → Platform
- **Vision, positioning, capital philosophy** → Vision
- **Liability, pricing law** → Juridical
- **Build, deploys, Claude Code, operational data** → DevOps

> **Platform ↔ DevOps split:** Platform keeps **no direct link to Claude Code**
> by design. Platform decides architecture/object model; DevOps is the only role
> that touches implementation and Claude Code. Build flows Platform → (design
> decided) → DevOps → build. DevOps never builds ahead of a decided design.

### Role creation — anti-proliferation filter (applies to roles, not just brands)

A new governance role may only be created if it is a **genuinely separate lane**,
not an extension of an existing role. The same anti-proliferation filter used for
brands applies to roles. Before adding a role, test: does an existing role already
own this domain? (E.g. a proposed "Finance" role overlaps heavily with Business
Case, which already owns pricing, CAC, LTV and unit economics — so the question is
whether operational finance (invoicing, per-customer cost allocation, cash
tracking) is a distinct discipline or a Business Case extension.) **Role creation
is a Vision/Governance call.**

### Session numbering

Cross-chat decision rounds are numbered (e.g. "Session 06 Cross-Chat Decisions")
for traceability.

### Core beliefs are protected

The foundational beliefs (see `BusinessPlan_Memory.md`) "should not be changed
lightly; any challenge should be supported by strong evidence."

### Anti-scope-creep

A consistent founder principle across both ChatGPT and Claude: actively protect
against premature platform thinking, overengineering and feature sprawl. When
something is good enough to ship/test, ship it rather than build more.

### Empty-box rule (visual landmap)

Where a subject is **named but not yet worked out**, create an **empty box**
(a placeholder page/section that states what belongs there) rather than leaving
it out. The box is a visual reminder of what still needs doing. This applies
especially to what a real company needs at incorporation — Aevor will be an
actual company, so having the full landmap now lets time be spent where it counts.
Only create boxes for subjects that are **genuinely required** (named by the
founder, or demonstrably needed for a company) — not invented ones (keeps it a
checklist, not noise).

### Memory integrity — the MD rules (canonical)

The MDs now carry substantial accumulated value. These rules exist because a
silent loss occurred: a fresh chat rewrote an MD without reading the current
version, and content disappeared. Rules prevent; version history restores. Both
are required.

**1. Source of truth: Google Drive.** The MDs live in the Drive `digiStiel`
folder. Drive's built-in version history is the first safety net — an overwritten
file can be restored. The Claude Project holds working copies, not the source.

**2. Second safety net: GitHub.** The MDs are also committed to `docs/` in the
mono-repo (`BhartiBartoli/digiStiel`), giving full diff/commit history. Drive is
the source; GitHub is backup — never a competing source of truth.

**3. Chat-start inventory (the rule that prevents the failure).** The **first
substantive action of every new chat** is: read `_MANIFEST.md` from Drive, then
fetch the MDs relevant to that chat's role. A chat cannot fetch what it does not
know exists — the manifest is what makes fetch-before-write possible. This matters
most when switching chats because the old one hit its limit.

**4. Fetch-before-write (MDs).** Never rewrite an MD without first reading the
current version **from Drive**. If Drive read fails, ask the founder to upload it
or to explicitly confirm the copy in hand is the latest. Never rewrite from memory
of a previous session.

**5. Prove-don't-assert on memory.** Never deliver or write an MD without showing
the before/after comparison: **line count before, line count after, section
headings, what was added, what is unchanged.** Without that comparison the file is
not verifiable. **A shrink is a blocker, not a detail** — stop and flag it.

**6. Delivery.** When writing to Drive, rules 4 and 5 apply. When *not* writing to
Drive, every addition must still produce a **full, complete MD as a download** (not
a snippet or a description), so the founder can replace the file in one step.

### Document level discipline

Each document must stay at the right abstraction level for its audience.
Business-case documentation ≠ platform documentation. (E.g. operational
AI-Led/AI-Assisted classifications belong in Platform docs, not the investor case.)

### Start / Flow / Boost naming rule (canonical)

Start/Flow/Boost are **Commercial Engagement Models** — they define how a Value
Plan is delivered (contract, pricing, invoicing, service level, delivery). They
are **never** described anywhere as products, product lines, UX objects,
sub-brands or primary commercial propositions. The Value Plan is the central
commercial object; Engagement Models appear only after a Value Plan exists.

### Notion documentation rule (canonical — all roles)

Notion is the **finished, shared reference** for everything that is settled,
organised under the three top-level layers **Aevor / Atlas / Brands** (each brand
its own page). It is not a workshop; work-in-progress stays in the Project memory.

**Applies to every role** (Vision, Atlas, Business Case, Marketing & Sales,
Juridical, DevOps). Documentation is written to Notion on **two triggers**:
1. **Besloten** — a decision in that role's domain is definitively laid down.
2. **Uitgevoerd / gebouwd** — something is definitively built/executed (for code:
   with its version, so Notion is technical reference for future developers).

**Routing — hoofdproject only.** Documentation is written to Notion **only from
the hoofdproject.** When a cross-chat discussion reaches a decision, the
hoofdproject writes it out — never a subproject or a single chat directly. This
keeps Notion a clean, controlled source of truth.

**Structure — each role decides its own sub-structure, within limits.** Each role
determines how many pages/folders and what split works best for its domain — but
within the fixed three-layer top structure, and subject to the same
**anti-proliferation reflex** as elsewhere: a new page/folder only if it carries a
genuinely distinct subject, not because it can.

**Review-on-move (mandatory).** When content is moved or written to a page, the
role must **review the whole target page** and keep the established structure
intact — no duplicate sections, no contradictory statements, no content on the
wrong layer. Writing to a page includes tidying it. (This rule exists because
layered additions without review created contradictions on the Aevor page.)

**Structure guardian (temporary).** **Vision, together with the founder, guards
the Notion structure** for now — layer coherence, no drift, no proliferation.
Roles that write to Notion defer to Vision on structural questions until this is
formalised (or handed off) later.

**Where each layer/role documents:**
- **Aevor** (corporate) — broadest: everything except technical/platform; may
  include a *commercial* description of Atlas. Corporate Business Case and
  corporate S&M live here.
- **Atlas** — mainly technical/platform; sometimes juridical, a little vision.
- **Brands** (digiStiel first, each brand its own page) — per-brand sub-pages that
  the roles create as they document: Technical, GTM, Market, Business Case, etc.
- **DevOps** leads the technical build-reference (with Platform/Atlas): describes
  what is built after every oplevering/merge/live-zetten, with version, and keeps
  **code-audit status as a field on each built item** (built/tested/validated/
  issue) so "built" vs "validated" is visible. GitHub = code; Notion = description.

Both Business Case and M&S operate on **two levels**: corporate (→ Aevor) and
per-brand (→ the brand page). Keep corporate vs brand material on the right layer.

---

## 1b. Core ↔ Subproject Governance (hoofdproject ↔ Aalex)

There are now **two Claude Projects**. This section governs how they relate. See
`Subproject_Aalex.md` (lanes) and `Subproject_Tracking.md` (the item-tracking
system) for detail.

### One source of truth

The **hoofdproject (founder) is the single source of truth.** Aalex' subproject
is a **workshop**: it produces proposals. Nothing becomes canon unless it is laid
down in the hoofdproject. The subproject never writes canon directly.

### Aalex proposes, the founder decides

Aalex works out proposals (and must — that is his value) but **lays nothing
down**. The founder, with the hoofdproject analysis, decides to **add, reject, or
revise-and-return** each proposal. Everything from the subproject travels as a
*proposal*.

### Aalex' lanes (summary — full text in `Subproject_Aalex.md`)

Allowed: Aevor corporate (incl. the still-open Aevor House of Brands), corporate
business case, pricing model, corporate vision depth, corporate S&M; and at
digiStiel level the business case and GTM.
Not allowed: platform/technique/object model, code/Claude Code/DevOps, changing
digiStiel's (fixed) brand architecture, incurring costs, and decisions over
network, branding, costs. Outside his lanes he **stops and requests inzage/
authorisation via governance** — he does not act himself.

### Everything routes through tracking

Every exchange between the projects carries a tracking header (unique ID, from,
to-role, status) and is logged in the status register. Order-independence by
design: status is read from the register, not reconstructed from memory. Only the
hoofdproject sets Vastgelegd / Verworpen / Te reviseren.

### Cross-Chat Governance still applies

All Process Governance rules above (three tests, Loop Detection, no
reformulations, decisions ≠ hypotheses) apply **inside** Aalex' project between
his own chats, in addition to this core↔subproject layer.

### Later (Claude Team)

When both move to Claude Team: **authorisation levels** are added here (who may
lay down / incur what); with company budget Aalex may incur certain costs
(e.g. a marketing action or partnership); and the **subproject merges into the
hoofdproject** into a single whole.

---

## 2. Product Governance — how the platform protects value

This is governance *inside the product* (distinct from the process rules above).

**Governance = Protect Value.** It does not exist to enforce workflows. It
continuously evaluates:

```
Expected Value  vs  Expected Cost  vs  Expected Risk
```

Possible actions: **Continue · Adapt · Pause · Stop.**

### Protective Governance

Governance may intervene to prevent value destruction. Example: a €100/day ad
campaign where the weather forecast indicates likely negative ROI → governance
may pause execution. The purpose is value protection, not process compliance.

### Customer Validation (mandatory step)

Discovery ends only when the customer validates the As-Is understanding. Without
validation: no Value Plan, no Advice, no Governance.

### Trust (the three pillars)

Autonomy grows only as trust grows; trust is a scalability mechanism.
- **Competence** — does digiStiel know what it is doing?
- **Integrity** — does digiStiel explain what it is doing?
- **Benevolence** — does digiStiel act in the customer's best interest?

### Ownership

Dynamic; follows responsibility and may shift during the lifecycle.
**Accountability always remains with the customer.**

### RACI & Trust Profiles

The customer defines who decides / executes / is consulted / is informed. These
influence approvals, governance, notifications and automation, and matter more
as autonomy increases.

> Note: governance remains a **Human-AI hybrid** for the foreseeable future,
> because accountability stays human even at 1,000 customers. The objective is
> to *reduce* governance effort through trust, not to eliminate it.

---

## 3. Customer Governance

- **Every customer-facing conversation is governed by a named role.** Default
  governing role is **Marketing & Sales**, escalating to **Juridical** for legal
  matters and to **Platform** for delivery/technical matters.
- Customer conversations follow the **Customer Language Principle**: the platform
  adapts to the customer's language; the customer never has to learn digiStiel
  vocabulary. The customer sees Goals, Solutions and Value — not architecture.

---

## 4. Language Rule

Output language is decided by **always asking which language is wanted**, with
these defaults when not specified:

- **Customer-facing output** → **Dutch (NL)**
- **Investor / business case / partner output** → **English (EN)**

Memory docs themselves mirror their source language unless standardised.

---

## 5. To be added when Aalex joins

Formalise decision-ownership per role (e.g. Aalex = owner of Business Case +
Marketing/Sales; founder = owner of Vision + Platform), so agents know whose
decisions to treat as "locked". Left open by founder's instruction until Aalex
formally joins.
