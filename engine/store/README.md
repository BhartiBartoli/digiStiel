# store/

- **MemoryStore is currently the only store implementation.**
- **A Repository interface will be extracted when a second store (Airtable/Postgres)
  arrives — not before.** Defining an abstract Repository contract now would freeze a
  contract before the second implementation exists.
- **`store` is temporary and will be split into per-object repositories when
  persistence arrives or when it grows too large** (anti-God-object discipline).

The store holds collections + the Operational Goal ↔ Value Indicator join table, plus
the inert `activities[]` / `rawData[]` substrate reserved for the Value Measurement layer.
No persistence, network, or query-language logic lives here (Engine Principle 3).
