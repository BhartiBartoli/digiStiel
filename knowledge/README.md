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

## Single Source of Truth / patterns
- Flat id-refs for single, type-known parents (`valuePlanId`, `adviceRef`, `tenantId`).
- `{kind,ref}` self-describing refs only for mixed-type collections (`relatedRefs`,
  `supportedByMemoryRefs`).
- Currentness is computed from supersede chains — no active flag.
- Advice & Decision anchor at Value-Plan level; the ref sits on the CHILD, never as a
  collection on the Value Plan (no God-object).

## Reserved-but-inert (present, no behaviour)
`authorRef` (Advice), `decidedBy` (Decision), `supportedByMemoryRefs` (Advice),
`tenantId` cross-tenant use, `volatility` (Memory), the weighting mechanism.

## Not in Brok B
Governance enforcement / Customer Validation gate, Decision→Advice status coupling,
Identity & Access, Memory→Advice reasoning, pattern detection, cross-tenant learning.

## Run the proofs
```
node tests/brokB.test.js   # exit 0 = all proofs pass
```
