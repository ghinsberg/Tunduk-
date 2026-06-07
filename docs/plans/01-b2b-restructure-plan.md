# Tündük — B2B Heritage-Authority Restructure Plan
_Status: PROPOSED — awaiting Yossi's approval before any HTML is edited. June 2026._

## The shift in one line
From "a boutique that sells one yurt to one person" to "the heritage authority on the boz üy that supplies hotels and resorts at volume." Same soul, new buyer, new ask.

## What we keep (these are assets, not clutter)
- The founders' story (Yossi + Nura) — this IS the authority. Volume buyers buy from people, not catalogs.
- The Kyzyl-Tuu craft detail (willow steam-bent 15 days, kiyiz felt, rawhide gök binding, no metal).
- The UNESCO heritage line — now the central claim, not a footnote.
- The design system (terra/gold/sage/ink, Cormorant + Jost), the video hero, the calm pace.

## What changes
- The primary call-to-action stops being "Configure a Yurt" (one unit, B2C) and becomes "Plan your project / Request a quote" (volume, B2B).
- We add the missing layer the market has nobody filling: **certified, turnkey, delivered at volume.** Fire certification (NFPA 701 / CPAI-84), the Turkey finishing leg, lead time with contingency, project support.
- Individual buyers are still welcome, but they become the secondary path, not the headline.

---

## Proposed sitemap

| Page | Now | Becomes | Priority |
|------|-----|---------|----------|
| `index.html` | B2C boutique homepage | Heritage-authority homepage with a B2B spine; volume CTA above the fold | **Rebuild** |
| `tunduk-trade.html` | does not exist | **NEW** — the B2B / volume page. The centerpiece for developers. | **Build new** |
| `tunduk-heritage.html` | heritage craft story | Strengthen into the "charter" — UNESCO custodianship, why this is the real thing | Light edit |
| `tunduk-story.html` | founders' story | Keep, link prominently from B2B page as the trust anchor | Keep |
| `tunduk-configure.html` | single-yurt configurator | Keep for individuals; reframe as "single unit / personal" | Light edit |
| `tunduk-gallery.html` | gallery | Add resort/volume context where shots allow | Light edit |
| `tunduk-craft.html` | craft detail | Keep; supports the authority claim | Keep |
| `tunduk-faq.html` | B2C FAQ | Add a B2B section: MOQ, lead time, certification, freight, payment terms | Edit |
| `tunduk-contact.html` | contact | Split: "Trade enquiry" (volume) vs "General" | Edit |
| `tunduk-homeware.html` | homeware shop | Keep as-is, lowest priority | Keep |
| `tunduk-homepage-v2.html` | duplicate of index | Delete or fold in — it is a stale duplicate | **Remove** |

## Proposed nav
Current: Homeware · Our Story · Heritage · Gallery · [Configure a Yurt]

Proposed: **Heritage · Our Story · The Craft · Gallery · For Hotels & Resorts → [Request a Quote]**
- "For Hotels & Resorts" is the new B2B page and the most important new link.
- The button changes from "Configure a Yurt" to "Request a Quote" (volume intent).
- Homeware drops out of the top nav into the footer (keeps it, de-emphasizes it).

---

## The new B2B page (`tunduk-trade.html`) — section order

1. **Hero** — "Furnish your resort with the real thing." Sub: UNESCO-protected Kyrgyz boz üy, certified and finished to luxury-suite standard, delivered at volume. CTA: Request a quote.
2. **The gap we fill** — the three-way comparison: budget ger / generic canvas tent / *the authentic heritage yurt, turnkey*. This is the wedge.
3. **Built for hospitality** — fire certification (NFPA 701 / CPAI-84), all-season spec, serviceability, spare parts, consistent build across N units.
4. **From the pasture to your property** — the export + Turkey finishing process as a visual flow. Doubles as the answer to "can a landlocked country deliver?"
5. **Capacity & timeline** — what a 25-unit order looks like, 6 months + 30-day contingency, in the contract.
6. **The people behind it** — Yossi + the village of master builders (Adylet stays undisclosed publicly until loyalty is locked; referred to as "our master builders").
7. **Heritage as your story** — the marketing gift to the buyer: a UNESCO provenance their guests can't get from a canvas tent.
8. **Request a quote** — short form: units, location, timeline, use case.

## First target segment (from the research)
Gulf desert resort developers (highest budget, strongest heritage-marketing motive, buying in volume now), then North American eco-lodge developers. The B2B page copy should speak to them first.

---

## Build order (once approved)
1. Write the new homepage copy + B2B page copy (text only, for your sign-off).
2. Build `tunduk-trade.html` from the existing design system.
3. Rebuild `index.html` hero + spine around the new CTA.
4. Update nav across all pages, remove the stale duplicate, add B2B FAQ + contact split.
5. Headless mobile + desktop QA, then deploy to preview, then production after your review.

## Open question for Yossi before building
The hard gate from the research is **fire certification**. The B2B page should state the certification position. Options: (a) "certified to NFPA 701 / CPAI-84" if we can stand behind it, (b) "certification available on request / in process," or (c) leave it off for now. Need your call — this is the one claim a hotel's procurement team checks first, so it has to be true.
