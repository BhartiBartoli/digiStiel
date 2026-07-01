# Engine Principles (the engine's constitution)

The five rules every current and future session must uphold. This is the engine
equivalent of the Platform Canonical Design Principles — the touchstone for any
change to `engine/`.

1. **Deterministic business engine.** Same inputs → same outputs. No randomness in
   business rules (id generation aside).
2. **No AI inside the engine.** No model calls, prompts, or heuristics. The engine
   enforces rules; agents live outside it.
3. **No persistence logic inside the engine.** No DB/Airtable/HTTP. The store is an
   in-memory substrate behind a boundary; persistence is a later adapter.
4. **No UI inside the engine.** No rendering, no market/brand/customer-language
   presentation. Those belong to the Presentation Layer.
5. **Business rules are tested independently of infrastructure.** Constraints and
   lifecycles are proven with plain node tests, no network or DB.
