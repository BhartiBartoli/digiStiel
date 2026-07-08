# Subproject — Aalex (werkplaats)

> **Wat dit is.** Aalex werkt in een eigen Claude Pro Project (het "subproject").
> Dat project is een **werkplaats**: het levert uitgewerkte voorstellen. Het
> **hoofdproject (bij de founder) is de enige bron van waarheid.** Niets wordt
> canon zonder dat het via het hoofdproject wordt vastgelegd. Dit document
> beschrijft Aalex' lanen, grenzen en werkwijze. Zie ook `Subproject_Tracking.md`
> (het volgsysteem) en `Governance.md` (§ core↔subproject).

---

## Aalex' lanen (waar hij aan werkt)

**Corporate-niveau (Aevor):**
- Uitwerken van de corporate holding **Aevor** — inclusief de Aevor House of
  Brands, die nog **niet** vastligt (hier mag hij bouwen).
- Corporate **business case**.
- **Pricing model**.
- Verdere verdieping van de **corporate visie**.
- **Sales & Marketing van corporate** (Aevor-niveau).

**digiStiel-niveau (commercial brand):**
- Verdere uitwerking van de **business case**.
- **Go-to-market (GTM)**.

## Wat hij NIET doet / niet mag

- **Geen platform, techniek of objectmodel** (dat is Atlas/Platform).
- **Geen code, geen Claude Code, geen DevOps.**
- **Geen digiStiel-brandarchitectuur wijzigen** — die ligt vast. Hij mag messaging
  en GTM uitwerken, maar niet de House-of-Brands-lagen/namen/principes van
  digiStiel veranderen. (Aevor's brand-architectuur mag hij wél uitwerken.)
- **Geen kosten aangaan.** Hij moet kosten kennen en erin werken (pricing,
  business case), maar mag op dit moment geen uitgave/marketingactie/partnership
  aangaan — alle kosten komen momenteel uit de founder's zak. *(Wijzigt zodra er
  bedrijfsbudget is — zie "Later".)*
- **Geen beslissingen over netwerk, branding, costs.**

## Kernprincipe: voorstellen, niet beslissen

Aalex **werkt voorstellen uit en moet dat ook doen** — dat is zijn waarde. Maar
hij **legt niets vast**. De founder bepaalt (samen met de hoofdproject-analyse)
of een voorstel wordt **toegevoegd, verworpen, of gereviseerd en teruggestuurd**.
Alles wat hij produceert vertrekt als *voorstel* naar het hoofdproject.

## Als hij buiten zijn lanen komt

Raakt een uitwerking iets buiten zijn lanen (platform, techniek, digiStiel-brand,
kosten aangaan, netwerk), dan **stopt hij en vraagt via governance om inzage of
autorisatie** — hij handelt niet zelf. Dit is de subproject-variant van de
domain-ownership-regel.

## Cross-Chat Governance blijft gelden

De bestaande Cross-Chat Governance (drie toetsvragen, Loop Detection, geen
reformuleringen, beslissingen ≠ hypotheses) geldt onverkort **binnen** Aalex'
project, tussen zijn eigen chats. Daarbovenop komt de **core↔subproject-regel**
(zie `Governance.md`): vastleggen loopt altijd via het hoofdproject, nooit
rechtstreeks in het subproject.

## Drive-toegang: lezen uit core, schrijven alleen naar `Aalex_Voorstellen/`

Het subproject is met de Drive gekoppeld. De toegang is **asymmetrisch** en dat is
opzettelijk:

**Lezen (toegestaan, en verplicht bij chatstart).** Aalex' chats lezen de
core-MD's uit de Drive `digiStiel`-map. Bij chatstart: eerst `_MANIFEST.md`, dan de
MD's binnen zijn lanen. Zo werkt hij altijd vanaf de actuele waarheid, niet vanaf
een oude kopie of chat-geheugen.

**Schrijven (uitsluitend naar één plek).** Aalex' chats schrijven **nooit** naar de
core-MD's. Nooit. Ze schrijven uitsluitend naar de map **`Aalex_Voorstellen/`**.
Dat is de enige schrijfbestemming van het subproject. De core-MD's zijn voor het
subproject **read-only**.

**Het statusregister is read-only.** `Subproject_Tracking.md` wordt gelezen om het
volgende vrije item-ID te bepalen; het wordt **niet** door Aalex bijgewerkt. De
founder is de enige schrijver van het register — één schrijver, geen conflicten.

**Bestandsnaam draagt het ID.** Elk voorstel in `Aalex_Voorstellen/` heet
`AX-####_Onderwerp_v#.md` (bv. `AX-0007_Pricing_model_corporate_v1.md`) en draagt
bovenin de item-kop uit `Subproject_Tracking.md` (ID / Van / Naar rol / Status /
Datum / Onderwerp). Zo is in de map direct zichtbaar wat er ligt en waar het heen
moet, zonder elk bestand te openen.

**Signalering is menselijk, niet technisch.** Aalex stuurt een bericht wanneer er
iets klaar staat. Er is geen automatische detectie nodig.

## Opname-flow: van voorstel naar core-memory (het gevaarlijkste moment)

Wanneer de founder een rol-chat vraagt om voorstellen op te halen (bv. *"M&S, haal
de MD's op uit `Aalex_Voorstellen/` en valideer met mij of ze in
`MarketingSales_Memory.md` horen"*), geldt onverkort:

1. De rol **leest** het voorstel uit `Aalex_Voorstellen/`.
2. De rol **valideert samen met de founder** of het opgenomen wordt. De founder
   beslist — het subproject stelt voor, het hoofdproject beslist.
3. Wordt het opgenomen, dan geldt bij het bijwerken van de core-MD **verplicht**:
   **fetch-before-write** (haal de actuele MD uit Drive, herschrijf nooit uit
   geheugen) en **prove-don't-assert** (toon regelaantal vóór/ná, sectiekoppen, wat
   toegevoegd, wat ongewijzigd; **een krimp is een blocker**). Zie
   `Governance.md` → *Memory integrity*.
4. De founder werkt daarna het statusregister bij (Vastgelegd / Verworpen / Te
   reviseren).

> Dit stap-3-moment is precies waar eerder een silent loss ontstond: een chat
> herschreef een MD zonder de actuele versie te lezen. De opname van een
> subproject-voorstel is het meest risicovolle moment in de hele keten.

## Later (bij overstap naar Claude Team)

- **Autorisatie-levels** worden opgenomen in `Governance.md` (wie mag wat
  vastleggen/aangaan).
- Bij **bedrijfsbudget** mag Aalex binnen dat budget wél bepaalde kosten aangaan
  (bv. een marketingactie of partnership).
- Het **subproject wordt samengevoegd met het hoofdproject** tot één geheel.

## Welke MD's krijgt Aalex mee in zijn subproject

Meegeven: `Governance.md`, `Vision_Memory.md`, `BrandArchitecture.md`,
`BusinessPlan_Memory.md`, `MarketingSales_Memory.md`, dit document
(`Subproject_Aalex.md`), `Subproject_Tracking.md`, en de canonieke Teaser als
referentie.
Niet meegeven: `Platform_Memory.md`, `DevOps_Memory.md`, `DesignSystem.md`, de
`Customers/`-docs, en `OpenInputs.md` (dat is het founder-dirigeerinstrument voor
het hoofdproject). Voor subproject-specifieke open punten bestaat een aparte
lijst (zie `Subproject_Tracking.md`).
