# digiStiel — Design System & Output Rule

> **Output rule (canonical).** Every deliverable digiStiel produces must use the
> digiStiel house style defined here. Word, Excel and PowerPoint use the full
> system including the dark navy cover. The **website/landing pages use the LIGHT
> palette only** — the dark navy cover block is for documents (Word/Excel/PPT),
> never for the site. Source of truth for the values below: `digiStiel_Teaser_v3.pdf`.

---

## Logo

Wordmark **digiStiel** with the **S** set in accent blue (`#2C7DFF`), the rest in
near-black (`#1A2230`) on light backgrounds, or white (`#FFFFFF`) on the dark
navy cover. A transparent "S" mark is used as a centered footer device on
document covers.

## Colour palette (exact, from the Teaser)

| Token | Hex | Use |
|-------|-----|-----|
| **Navy** (cover/dark blocks) | `#0E1B2A` | Document covers, callout blocks, dark headers. **Documents only — NOT the website.** |
| **Ink** (body text) | `#1A2230` | Primary body text |
| **Deep ink** | `#0E1B2A` | Headings on light |
| **Accent blue** | `#2C7DFF` | The "S", links, key accents, rules |
| **Accent blue dark** | `#1B5FCC` | Hover/secondary accent |
| **Ice 1** | `#EAF1FB` | Light callout box fill |
| **Ice 2** | `#F4F8FE` | Lightest section background |
| **Ice border** | `#D8E2EF` | Hairline borders, table grid |
| **Muted** | `#5A6B7E` | Captions, secondary text, footer |
| **Soft blue** | `#AEC4E0` | Subtle text on dark, dividers |
| **White** | `#FFFFFF` | Page background, text on navy |

### Website-specific rule
The site uses **light backgrounds** (white + Ice 1/Ice 2), Ink text, and accent
blue for interaction. **Do not use the `#0E1B2A` navy cover treatment on the
website.** Navy may appear only as small accents (e.g. footer), never as a
full-bleed dark hero. (Consistent with the "operational clarity, light and
approachable" positioning — not a dark corporate brochure feel.)

## Typography

- Document font: **Aptos** (Teaser source), fall back to **Arial** for maximum
  compatibility in generated Office files.
- Headings: bold, deep ink or navy. Body: regular, Ink, ~11pt.
- Captions/labels: Muted, small caps tracking for section eyebrows
  (e.g. "C O N F I D E N T I A L  I N V E S T O R  T E A S E R").

## Layout logic

- **Cover (documents):** full navy `#0E1B2A` background, white wordmark with blue
  S, tagline "From Goals to Measurable Value.", thin accent-blue rule, small
  muted confidentiality line. Centered transparent S device low on the page.
- **Content pages:** white background, accent-blue rule under the running header,
  page number + "From Goals to Measurable Value" in the footer.
- **Callout blocks:** Ice 1 fill with a left accent-blue bar (light callout), or
  navy fill with white text (dark callout) for "in one line" statements.
- **Tables:** Ice border hairlines, Ice 2 header fill, Ink text.

## Taglines / locked strings

- Tagline: **From Goals to Measurable Value.**
- Category: **AI-Powered Conversational Value Creation Platform**
- Confidentiality line (investor docs): *Confidential — prepared for prospective
  investors and partners*

---

## How to apply (instruction for any role)

When asked to produce a document, deck, spreadsheet or web page, **start from the
matching template** (`templates/digiStiel_Word_Template.docx`,
`digiStiel_Excel_Template.xlsx`, `digiStiel_PowerPoint_Template.pptx`) and keep
the palette, fonts and layout logic above. Ask which output language is wanted
(see `Governance.md` §4); default customer-facing → NL, investor/business → EN.
For the website, apply the **light palette only**.
