# Tündük — tunduk.trade

Source for **tunduk.trade**, a static site (plain HTML/CSS/JS, no build step) served by Cloudflare Pages. Authentic Kyrgyz Boz Üy (yurts), handmade in Kyzyl-Tuu by master maker Adylet, supplied to hotels, resorts and glamping sites.

## Structure
- `index.html` and `tunduk-*.html` — the pages: home, heritage, story, craft, journal (+ posts), trade ("For Hotels & Resorts"), gallery, faq, contact, configure.
- `_headers`, `_redirects` — Cloudflare Pages config (no-cache for HTML; clean-URL rewrites). Note: Cloudflare serves the extensionless form (`/tunduk-trade`) as the 200 URL; `/trade` style paths 308-redirect to it. Canonicals and `sitemap.xml` use the extensionless form.
- `sitemap.xml`, `robots.txt`, `llms.txt` — SEO / GEO.
- `docs/` — internal notes and reference material. NOT deployed (held out of the directory during deploy).

## Deploy (Cloudflare Pages)
Deployed manually with Wrangler (no GitHub-triggered deploy):
```
npx wrangler pages deploy . --project-name=tunduk --branch=main --commit-dirty=true
```
Move `docs/` out of the directory during deploy so it is not published, then restore it. Edge is no-cache, so changes show within a minute; verify on the build alias first, then the canonical domain.

## Email
Inbound `@tunduk.trade` mail is forwarded to the owner's inbox via Cloudflare Email Routing (catch-all). Inquiry forms POST to Formspree.

## Conventions
Static, no framework. Each page carries its own inline `<style>` using shared CSS variables (`--parchment`, `--ink`, `--oxblood`, `--gold`, …) and fonts Playfair Display, Cormorant Garamond, Archivo (the configurator also uses Jost). Copy voice: warm, plain, specific, British spelling, "Boz Üy" capitalised, no em dashes, no corporate words.
