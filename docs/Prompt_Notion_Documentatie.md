# Generieke Notion-documentatie-prompt (alle rollen)

> Eén instrument voor alle rollen. Vul `[ROL]` in en, indien nodig, de laag-hint
> onderaan. Gebruik dit wanneer een rol iets **besloten of uitgevoerd** heeft dat
> naar Notion moet. Documenteren gebeurt **alleen vanuit het hoofdproject**.

---

```
Acting as [ROL].

CONTEXT
Governance-regel "Notion documentation rule (all roles)": Notion is de finale,
gedeelde naslag onder de drie lagen Aevor / Atlas / Brands (elke brand een eigen
pagina). Trigger: iets is BESLOTEN en/of UITGEVOERD. Documenteren gebeurt ALLEEN
vanuit het hoofdproject. Elke rol bepaalt zelf de fijnstructuur (pagina's/mappen)
binnen zijn domein, met de anti-proliferatie-reflex: een nieuwe pagina alleen als
ze een echt eigen onderwerp draagt.

OPDRACHT — documenteer wat vaststaat in [ROL]'s domein
Werk stap voor stap, bevestig tussendoor, bouw niet vooruit:
1. INVENTARISEER wat in mijn domein BESLOTEN of UITGEVOERD is en nog niet in
   Notion staat. Gok niets; werk met wat vastligt in de memory/het project.
   Laat work-in-progress en open punten eruit — die blijven in de memory.
2. BEPAAL de plek: onder welke laag hoort het (Aevor corporate / Atlas /
   een brand-pagina), en welke subpagina-indeling werkt het best voor dit
   materiaal? Stel de indeling voor (bestaande subpagina gebruiken of een nieuwe
   maken — nieuwe alleen bij een echt eigen onderwerp).
3. STEL DE INHOUD VOOR per pagina: schoon, leesbaar, alleen wat vaststaat, geen
   werkrommel (geen "open punten", geen cross-role flags, geen "nog te beslissen").
   Finale-documentatie-toon: helder en volledig.
4. Ik keur goed; daarna wordt het naar Notion geschreven (vanuit het hoofdproject).

LAAG-HINT VOOR DEZE ROL
[zie tabel onder — plak de juiste regel hier]

GOVERNANCE
Blijf binnen [ROL]-scope. Corporate-materiaal → Aevor; brand-materiaal → de
brand-pagina. Verander geen vastgelegde architectuur/visie. Documenteer alleen;
beslis niet opnieuw.
```

---

## Laag-hints per rol (plak de juiste regel in de prompt)

- **Vision** → meestal Aevor (visie, positionering, kapitaalfilosofie); soms een
  beetje op Atlas. Brand-positionering → de brand-pagina.
- **Atlas (Platform)** → Atlas-laag: technical/platform, objectmodel, capabilities,
  versies. Soms juridisch of een beetje visie op Atlas.
- **Business Case** → twee niveaus: corporate business case/pricing → Aevor;
  brand-business-case → de brand-pagina (bv. digiStiel → subpagina Business Case).
- **Marketing & Sales** → twee niveaus: corporate S&M → Aevor; brand-GTM/markt →
  de brand-pagina (subpagina's zoals GTM, Market).
- **Juridical** → meestal Aevor (GT&C, aansprakelijkheid, white-label-contracten);
  soms op Atlas (bv. data/governance) of op een brand-pagina (brand-specifieke GT&C).
- **DevOps** → technische build-naslag op de juiste laag (Atlas engine, of een
  brand → subpagina Technical), met versie + audit-status per gebouwd item. Zie de
  aparte DevOps-inhaalslag-prompt voor de eenmalige beschrijving van het al-gebouwde.
```
