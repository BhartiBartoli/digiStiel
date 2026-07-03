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

## Not in Brok B
Governance enforcement / Customer Validation gate, Decision→Advice status coupling,
Identity & Access, Memory→Advice reasoning, pattern detection, cross-tenant learning.

## Run the proofs
```
node tests/brokB.test.js   # exit 0 = all proofs pass
```
