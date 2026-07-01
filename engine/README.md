# engine/ — Value Creation Engine (canonical core)

Deterministic, brand/market-agnostic business core. Separate from the proposition
layer (connectors, playbooks, Customer Language, market-config, Presentation Layer).

## Engine Principles (constitution — see ENGINE_PRINCIPLES.md)
1. Deterministic business engine.
2. No AI inside the engine.
3. No persistence logic inside the engine.
4. No UI inside the engine.
5. Business rules are tested independently of infrastructure.

## Object hierarchy (Brok A)
```
Strategic Intent (Active → Retired; no Proposed/Achieved)
  → Strategic Goal (Proposed → Active → Achieved → Retired; targetValue+unit required)
     → Value Plan (full cycle; single goalId; measurableValue = computed, not stored)
        → Operational Goal (full cycle; ≥1 Value Indicator required to go Active)
           ↔ Value Indicator (many-to-many via join.js; leading|lagging; supportedBy first-class)
```

## Hard rules (proven in tests/brokA.test.js)
- Operational Goal → Active needs ≥1 linked Value Indicator (join-layer precondition).
- Value Plan → Active needs an existing, **Active** Strategic Goal.
- Retiring a Goal preserves the Value Plan's `goalId` (auditability).
- measurableValue deduplicates shared Value Indicators; totals grouped per unit.
- Failures are typed errors (errors.js): Constraint/Lifecycle/Reference/AggregationError.

## Soft rule
- >5 active Operational Goals per Value Plan → warning, never blocked.

## Reserved-but-inert (present, drives no behaviour)
`brand`; `accountableRef` / `responsibleRefs` (**identity-agnostic**, no User/Partner/Agent
link); `playbookRef`; `volatility`; Value Indicator `weightMechanism`; the store's
`activities[]` / `rawData[]`; `events/` (documented reserve only). `supportedBy` is the
exception: the collection is **active and required** — only its linkage to the not-yet-built
Activities/Raw Data layers is inert.

## Not in Brok A
Advice/Decision Records, Customer Validation gate, Solution layer, Identity & Access,
enterprise middle layer.

## Run the proofs
```
node tests/brokA.test.js   # exit 0 = all proofs pass
```
