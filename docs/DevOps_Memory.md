# DevOps — Memory

> Owns: build & implementation — the layer that turns decided designs into
> working code, deploys and operational data (Airtable, Netlify, admin views).
>
> **Why this role exists:** Platform deliberately keeps **no direct link to
> Claude Code.** Platform thinks and designs the object model and architecture;
> DevOps is the only role that touches implementation and Claude Code. All build
> work flows Platform → (design decided) → DevOps → build. This separation is
> intentional and works well for the founder.

---

## Core operating rule

**DevOps does not build ahead of design.** When a request implies building
something whose design is not yet decided, DevOps does NOT design it — it routes
the design questions to the owning roles and waits. DevOps acts only after the
design-owning roles (Platform, Business Case, etc.) have decided.

This is the anti-scope-creep / domain-ownership governance in action: building
prematurely pre-empts decisions that belong to other roles.

## Relationship to other roles

- **Platform → DevOps:** Platform decides architecture/object model; DevOps
  implements. Platform stays out of Claude Code by design.
- **Business Case → DevOps:** for anything with cost/billing/economics, Business
  Case defines the dimensions and model first.
- **DevOps owns:** the actual build — Airtable data, Netlify deploys, serverless
  functions, admin views, the mechanics of the sparring-agent deployment, and the
  Claude Code prompts/sessions themselves.

---

## Notion documentation — DevOps in the lead (with Platform/Atlas)

DevOps leads the **technical documentation in Notion** (together with
Platform/Atlas). Division of storage: **the real code lives in GitHub; the
*description* of what is built lives in Notion.** Notion is the shared,
finished reference so that future developers can see what exists — under Aevor,
Atlas and each brand.

**Three concrete duties:**
1. **Inhaalslag (one-off):** describe everything already built into Notion, per
   layer. *(To be done with the founder to reconstruct the actual GitHub state.
   WK-dashboard and Bike Center are currently separate/not in the project — to be
   processed later, once they have run their course.)*
2. **Doorlopend (ongoing):** after every **oplevering, merge, or live-zetten**,
   update the Notion description, **including the version** it lands in (e.g.
   "in Atlas 2.0"). "Built" is only complete once Notion reflects it.
3. **Code audits in Notion:** keep an audit record so it can be validated that
   something is correctly built and works. **Audit status is a field on each
   built item** (not a separate list) — so each entry shows: description +
   version + audit status (e.g. built / tested / validated / issue). This makes
   the difference between "built" and "validated" visible at a glance.

> Trigger governance (see `Governance.md`): documentation is written to Notion
> when a decision is **definitively laid down** OR when something is
> **definitively built in code**. GitHub = code; Notion = description + version +
> audit.

## Logged decisions / routing

### Cost / billing admin-dashboard (scale-phase — deferred)
A request surfaced for an admin dashboard showing **cost per platform / per
customer / per day, with direct pass-through to invoicing.** DevOps declined to
build or even design it, and routed it correctly:
- It was **deliberately excluded from MVP** ("no dashboard" was an explicit MVP
  boundary in the token-logging task). Not an acute gap — deferred scale-phase work.
- **Building blocks already emerging:** token-logging + market-label per discovery
  in Airtable.
- **Design ownership:** Business Case defines cost/billing dimensions, the
  token→invoice translation, and the unit-economics model (this is the
  "delivery model / unit economics" gap noted in M&S). Platform decides how a
  cost/billing layer relates to the engine/proposition split and the object model
  (customer / Conversation / Value Plan). **DevOps builds only after both decide.**

---

## Open / unresolved

- Cost/billing dashboard: awaiting Business Case + Platform design before any
  DevOps action (see `OpenInputs.md`).
- The proposed **"Finance" role** is a Vision/Governance call (not DevOps's to
  make) — see `Governance.md` role-creation rule and `OpenInputs.md`.
