# presentation/ — Presentation Projection layer

The presentation-side read boundary of the platform. It reads the **canonical Reality model**
(Brok A) and projects it into **customer language** — without making any screen choice.

## Where it sits

```
Reality → Presentation Read Model → Projection → ViewModel → UI Components
```

This building block delivers the first two arrows (**Read Model** + **Projection**). ViewModels and
UI come later. It is the presentation-side counterpart of
`knowledge/decision-intelligence/world.js`: as the Read Model is the channel-agnostic **read**
boundary for Decision Intelligence, the **Canonical Presentation Tree** is the channel-agnostic
**presentation** boundary for all clients.

> **Presentation never determines business priority.** Business priority, urgency, ranking and
> attention are produced by Decision Intelligence. Presentation only projects and renders these
> results. The **Home ViewModel** (`presentation/viewmodel/`) reads a DI-produced list of Attention
> Candidates and chooses only Top N, rendering, wording and tone — it computes no priority/severity.

## The modules

- **`reader.js` — Presentation Read Model over the canonical Reality Model.** Not an "engine
  adapter": it reads the *canonical model*, never the storage implementation. Today that model lives
  in an in-memory MemoryStore; tomorrow it may be Airtable/Postgres/other persistence — the
  Presentation Layer stays fully independent of how it is stored. Read-only accessors only.
- **`customerLanguage.js` — a Presentation Strategy, not a domain dictionary.** Maps an internal
  canonical type to a customer-facing label. *"Customer Language is a Presentation Strategy, not a
  domain dictionary."* The customer language stays entirely outside the domain; the internal object
  is never renamed. The default strategy is active; future strategies (Industry, Partner, Localized,
  Customer-specific) can plug into the **same** interface — `resolveLabel(type, overrides)` stays the
  public API — without a rebuild (Reserve, Don't Activate). The per-customer override map is laid
  ready but inert by default.
- **`projection.js` — produces the Canonical Presentation Tree.** *"The Projection layer produces the
  Canonical Presentation Tree. Individual channels (Web, Mobile, PDF, API, AI and future clients)
  derive their own ViewModels from this tree without reinterpreting the domain model."* The Projection
  layer is a channel-**independent** presentation contract; ViewModels stay channel-**specific**.
- **`seedCustomer.js` — one seed customer via an injectable adapter.** `loadSeedCustomer(loader)`; the
  default loader builds the graph in-memory through the Engine facade, a real persistence adapter
  plugs into the same signature later without a rebuild. One fixed tenant; cross-tenant inert.

## Hard rules

- **Projection transforms semantics, never presentation styling.** It may only project labels,
  structure and visibility. It must **not** format, round, compute percentages, choose colours/icons/
  badges, or affect layout — that is the future ViewModel layer. `measurableValue` is projected as the
  customer-visible **end value** (`perUnit`) only, never a per-indicator breakdown (that would leak
  `supportedBy`/aggregation).
- **Projection is read-only AND write-forbidden.** No `save/update/create/put/link` API exists in this
  layer — not even "for later". This is an absolute prohibition, **not** Reserve-Don't-Activate. All
  writes stay outside Presentation. (Proven structurally by proof 8.)
- **Node shape.** Each node carries `sourceId` (id-ref into the unchanged canonical object — Single
  Source of Truth), `sourceType` (**immutable** internal metadata inherited straight from the source;
  a handle for ViewModels, never customer language, never a customer-visible label, never mutated),
  and `label` (the customer-language projection) plus the customer-visible payload. The internal
  mechanic (`indicatorType`/`supportedBy`/`weightMechanism`/substrate) is never projected.

## Run the proofs

```
node tests/presentation.test.js   # exit 0 = all proofs pass (1–8)
```
