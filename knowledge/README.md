# knowledge/ — Brok B knowledge & decision layer

Lives **above** the deterministic engine (`engine/`). It STORES and ANCHORS
(Memory, Advice, Decision); it does **not** reason or learn (that is V2).

## Layer boundary (respects engine/ENGINE_PRINCIPLES.md)
- Dependency is one-way: `knowledge/` may use `engine/`, never the reverse.
- Reuses only pure engine utilities: `engine/errors.js` (typed errors), `engine/clock.js`.
- Persistence (Memory) and AI content (Advice `originType:'ai'`) live ONLY here — the
  engine stays deterministic / no-AI / no-persistence / no-UI. Nothing in `engine/` changes.
- `valuePlanId` validity is checked via an injected `valuePlanExists(id)` (in practice
  `engine.get('valuePlans', id)`), so knowledge reads the engine but the engine knows
  nothing of knowledge.

## Objects
- **Memory Entry** — additive, one value-relevant datum. Current = computed (`!supersededByRef`).
  Intake only on value-impact (`rememberIfImpactful`).
- **Advice Record** — advice on one Value Plan, may be AI-generated. Lifecycle
  Proposed→Accepted/Rejected, Accepted→Superseded. Never deleted on Superseded/Rejected.
- **Decision Record** — IMMUTABLE. A revision is a NEW record with `supersedesRef`.

### Brok C deel 1 — field additions (no new objects/tables)
- **Decision Record** gains `decisionAuthority` (who commits; enum, default `customer`) and
  `decisionRecorder` (who registers; enum, default `platform`). Identity-agnostic and kept
  SEPARATE — recording ≠ deciding. Both set at creation, then immutable. Inert enum values
  (`autonomous-platform`/`partner`/`human-operator` for authority) drive no behaviour yet;
  the refusal of autonomous authority is deel 3.
- **Advice Record** gains `adviceForm` (enum: Observation|Insight|Warning|Question|
  Alternative|Recommendation, required). **Only `Recommendation`** is chain-eligible to
  later continue a reasoning chain toward Authorization/Decision (`isChainEligible`); the
  other five enrich Knowledge only. The chain guard/gate itself is deel 3.

## Single Source of Truth / patterns
- Flat id-refs for single, type-known parents (`valuePlanId`, `adviceRef`, `tenantId`).
- `{kind,ref}` self-describing refs only for mixed-type collections (`relatedRefs`,
  `supportedByMemoryRefs`).
- Currentness is computed from supersede chains — no active flag.

### Currentness is direction-independent
Different object types may represent supersession using different canonical relationships.
Currentness helpers interpret each canonical relationship correctly while preserving the same
architectural principle: history remains immutable, current state is always computed.
- **Memory** uses a FORWARD chain: the old entry points to its successor (`supersededByRef`);
  current = entries with no `supersededByRef`.
- **Advice / Decision** use a BACKWARD chain: the successor points to what it replaces
  (`supersedesRef`); current = records not referenced by any other's `supersedesRef`.
Both proven explicitly in `tests/brokB.test.js` (proofs 2, 3, 5).

> **Future path (V2, documented intent — not built in Brok B):** a generic "Currentness
> Strategy" where each object type DECLARES its supersession direction (Memory→forward,
> Advice→backward, Decision→backward) so `currentness.js` never assumes. This is a later
> generalisation; recorded here as intent only, not implemented.
- Advice & Decision anchor at Value-Plan level; the ref sits on the CHILD, never as a
  collection on the Value Plan (no God-object).

## Reserved-but-inert (present, no behaviour)
`authorRef` (Advice), `decidedBy` (Decision), `supportedByMemoryRefs` (Advice),
`tenantId` cross-tenant use, `volatility` (Memory), the weighting mechanism.

## Decision Intelligence (Brok C deel 2) — `decision-intelligence/`
Four **computed evaluations** — Judgement, Trust, Governance Verdict, Authorization —
as **pure functions** over the canonical history (`world.js` = read-only adapter over the
engine + knowledge stores). "Judgement is transient. Decision is persistent." They store
NOTHING (no records, no active flags, no cache-as-source); this layer must never become a
second Knowledge layer.
- Governance Verdict ∈ `Continue | Adapt | Pause | Stop | Merge`; a 'Stop' is a strong
  recommendation authorising the customer, not an autonomous stop.
- Authorization never exists mandateless; only `customer-approval` is active (MVP), the
  other mandate sources are inert.
- Composition happens at compute-time (Verdict calls Judgement, Authorization calls Verdict)
  in-memory — no evaluation persists another. Everything remains reducible to the same
  canonical history. Enforced by proofs 8–13 in `tests/brokC.test.js`.

## Gate & Guard (Brok C deel 3) — `decision-intelligence/`
The boundary that guards ACTION without autonomy. MVP = Managed Execution: the layer may
judge/advise/authorize, but never commits itself. No Execution layer, no new stored objects —
only preconditions/refusals. Root principle: "Understanding precedes Automation".
- **Customer Validation gate** (`gate.js`) — a PRECONDITION on the Value Plan Proposed→Active
  transition: it checks a `validatedAt`/`validatedBy` flag on the source discovery/memory
  context (not a field on the Value Plan, not a new record). Missing/empty → activation refused
  (`ConstraintViolation`). `requestValuePlanActivation(engine, id, ctx)` is the SINGLE managed activation
  gate — no bypass path. Guarantee 1: validation is a precondition, not approval/authorization/
  decision. Guarantee 4: the gate guards COMMITMENT only — Advice, Judgement, Trust and
  Governance Verdict always run, also without validation.
- **Reasoning-chain guard** (`chainGuard.js`) — a chain (Judgement→Recommendation→Authorization→
  Decision→Execution) may only START from a `Recommendation`, via the reused deel-1 hook
  `isChainEligible`. The other five forms are refused. Guarantee 2: it guards only the STRUCTURE/
  sequence — never the quality/evidence/correctness (that stays the deel-2 compute functions).
- **Commit-authority policy** (`commitPolicy.js`) — a commitment requires a `decisionAuthority`;
  MVP policy `ACTIVE_COMMIT_AUTHORITIES = ['customer']`. autonomous-platform/partner/human-operator
  are refused as commit authority. Guarantee 3: this is MVP-POLICY, not an architecture limit — the
  categories stay in the enum; widening the policy constant re-activates them (Reserve, Don't
  Activate). Enforced by proofs 16–21 in `tests/brokC.test.js`.

## Not in Brok B
Governance enforcement, Decision→Advice status coupling,
Identity & Access, Memory→Advice reasoning, pattern detection, cross-tenant learning.

## Run the proofs
```
node tests/brokB.test.js   # exit 0 = all proofs pass
```
