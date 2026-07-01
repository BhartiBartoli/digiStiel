# knowledge/store/

- **KnowledgeStore is currently the only store implementation** (in-memory).
- **A persistence adapter (Airtable/Postgres) will be introduced when a second store
  arrives — not before.** Reserve-Don't-Activate: no adapter, no ORM, no query language
  is built now. The reference structure (flat id-refs + `{kind,ref}` collections) is laid
  so an adapter plugs in without a rebuild.
- **Right-to-be-forgotten**: the store STRUCTURALLY permits deletion (Map.delete). The
  governed erase operation (consent, cascade, audit) is **Brok C** — only the capability
  is present here, no public erase flow.

Holds `memoryEntries`, `adviceRecords`, `decisionRecords`. No persistence/IO logic beyond
the in-memory Maps.
