# events/ (reserved, inert)

Documented reserve only — **no event code is built in Brok A**, same pattern as the
inert `activities[]` / `rawData[]` collections. This records the foreseen domain events
and who will later subscribe, so the emit/subscribe layer plugs in without a rebuild.

| Event | Emitted when | Later listeners |
|-------|--------------|-----------------|
| `GoalActivated`    | a Strategic Goal transitions Proposed → Active | Memory, Governance, Reporting |
| `ValuePlanAchieved`| a Value Plan transitions Active → Achieved     | Governance, Learning, Reporting |
| `GoalRetired`      | a Strategic Goal transitions → Retired          | Memory, Governance, Reporting |
| `IndicatorUpdated` | a Value Indicator's value changes               | Learning, Reporting |

Not activated: no dispatcher, no listeners, no coupling. When events are built they
must stay outside the deterministic core boundaries (Engine Principles 2–4).
