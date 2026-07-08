# Subproject — Volgsysteem (Tracking)

> **Waarom dit bestaat.** Straks reizen MD's heen en weer tussen hoofdproject en
> Aalex' subproject. Aalex kan met meerdere dingen tegelijk bezig zijn; de
> founder is intussen andere dingen aan het verwerken. De volgorde raakt zoek.
> Dit systeem zorgt dat je op elk moment weet: **waar komt het vandaan, waar moet
> het landen, en in welke fase zit het** — ook als het chaotisch wordt.
>
> Twee delen: **(1) de item-kop** die op elke uitwisseling staat, en **(2) het
> statusregister** dat als dashboard werkt.

---

## 1. De item-kop (staat boven elk uitgewisseld item)

Elk item dat tussen de projecten reist krijgt een **uniek ID** en deze kop.
Voorkeur: **één item per MD**. Zitten er toch meerdere in één MD, dan krijgt elk
item zijn eigen kop, zodat je ze los kunt dirigeren.

```
--- ITEM ---
ID:        AX-0007                (AX = van Aalex-subproject; oplopend nummer)
Van:       Subproject (Aalex)     (of: Hoofdproject)
Naar rol:  BusinessPlan           (welke hoofdproject-rol/chat het raakt)
Status:    Voorstel               (zie statuswaarden hieronder)
Datum:     2025-06-30
Onderwerp: Pricing-scenario Aevor holding — v1
--- /ITEM ---
```

**ID-conventie**
- `AX-####` = item ontstaan in Aalex' subproject (AX-0001, AX-0002, …).
- `HP-####` = item/opdracht ontstaan in het hoofdproject richting Aalex.
- Het nummer blijft **hetzelfde gedurende de hele levensloop** van het item, ook
  als het heen en weer gaat. Zo volg je één item over meerdere rondes.

**Naar rol** — gebruik de bestaande hoofdproject-rolnamen zodat je meteen weet
waar het te dirigeren: `Vision` · `Atlas` (platform) · `BusinessPlan` ·
`MarketingSales` · `Juridical` · `DevOps` · `BrandArchitecture` · `Governance`.
(Aalex zal vooral raken: Vision, BusinessPlan, MarketingSales, BrandArchitecture-
Aevor. Raakt hij Atlas/DevOps/Platform, dan hoort het eigenlijk niet bij hem —
zie autorisatie-regel in `Subproject_Aalex.md`.)

## Statuswaarden (de levensfase van een item)

| Status | Betekenis | Wie zet 'm |
|--------|-----------|------------|
| **Voorstel** | Aalex heeft het uitgewerkt en gestuurd; wacht op review | Aalex |
| **In review** | Founder (+ hoofdproject-analyse) beoordeelt het | Founder |
| **Te reviseren** | Teruggestuurd met opmerkingen; Aalex past aan | Founder |
| **Vastgelegd** | Opgenomen in de canon van het hoofdproject | Founder |
| **Verworpen** | Niet opgenomen; met reden | Founder |
| **Geblokkeerd** | Wacht op inzage/autorisatie (buiten Aalex' lanen) | Founder |

Een item met status **Te reviseren** gaat terug naar Aalex met hetzelfde ID en
komt later terug als **Voorstel (revisie)** — zelfde nummer, nieuwe ronde.

---

## 2. Het statusregister (dashboard)

Dit is het kompas. Eén tabel die in één oogopslag toont waar alles staat, zodat
je nooit in losse MD's hoeft te graven. De founder houdt de master bij in het
hoofdproject; Aalex houdt een spiegel bij in het subproject.

| ID | Onderwerp | Van | Naar rol | Status | Laatste update | Ronde |
|----|-----------|-----|----------|--------|----------------|-------|
| AX-0001 | *(voorbeeld)* Aevor holdingstructuur v1 | Aalex | BrandArchitecture | In review | 2025-06-30 | 1 |
| AX-0002 | *(voorbeeld)* Pricing model corporate v1 | Aalex | BusinessPlan | Te reviseren | 2025-06-30 | 1 |
| HP-0001 | *(voorbeeld)* Vraag: GTM eerste 10 klanten | Hoofdproject | MarketingSales | Voorstel | 2025-06-30 | 1 |

> Bij elke uitwisseling: werk de rij van dat ID bij (status + laatste update +
> ronde). Nieuw item = nieuwe rij met nieuw ID. Zo blijft de volgorde
> onbelangrijk — je leest de stand af, je hoeft de historie niet te reconstrueren.

## Werkafspraken die het overzicht bewaken

- **Eén item per MD** waar mogelijk (founder-voorkeur). Meerdere items → meerdere
  koppen in dezelfde MD, elk apart dirigeerbaar.
- **ID nooit hergebruiken of veranderen.** Eén item = één ID, levenslang.
- **Register eerst.** Voordat je een MD verwerkt of verstuurt: update het register.
  Dat is de bron van "waar staan we", niet je geheugen.
- **Status is van de founder** (behalve "Voorstel", die zet Aalex bij insturen).
  Alleen het hoofdproject beslist over Vastgelegd/Verworpen/Te reviseren.
