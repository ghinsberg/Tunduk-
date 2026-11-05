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

## Sale flow (quote, then Stripe deposit)
No prices appear anywhere on the public site. A deal is closed on a video call, and payment is taken through Stripe afterwards.

- **Quote capture:** the configurator (`tunduk-configure.html`) and the contact/trade forms POST the request (selections, not a price) to Formspree (`https://formspree.io/f/xjgdvpkg`). The configurator shows its success screen only after a confirmed send.
- **Prices:** real reference prices live in `docs/pricing-internal.json`, which is **not deployed**. The served `prices.json` holds only public terms (`depositPercent`, `quoteValidDays`).
- **Deposit:** `50%` to start, `50%` balance after the customer approves a video of the finished yurt. The **balance is not charged by the site** — send it as a Stripe Invoice from the dashboard after video approval.

### Stripe (Cloudflare Pages Functions, `/functions`)
Built in **test mode**; no live keys yet. After the call, Tündük mints a deposit payment link, sends it to the customer, and Stripe notifies on payment.

- `POST /api/create-deposit-link` — **admin-only** (header `x-admin-token: $ADMIN_TOKEN`), and inactive unless `DEPOSIT_CHECKOUT_ENABLED=true` (ships dark). Body: `{ "reference", "customerEmail", "agreedTotalUsd", "label" }`. Computes the deposit as `depositPercent` of the agreed total (from `prices.json`), creates a Stripe Checkout Session, returns `{ url }` to send the customer. The amount comes from Tündük, never from the public browser.
- `POST /api/stripe-webhook` — verifies the Stripe signature (Web Crypto HMAC-SHA256, 5-min replay tolerance) and on `checkout.session.completed` notifies Tündük at the Formspree quote endpoint (reference, amount paid, balance due).
- Success page: `tunduk-order-confirmed.html` (noindexed).

Example (test mode), after agreeing a $8,000 total on a call:
```
curl -X POST https://<deploy>/api/create-deposit-link \
  -H "x-admin-token: $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"reference":"TDK-ABC123","customerEmail":"buyer@example.com","agreedTotalUsd":8000,"label":"Boz Üy 6m, Export Suite"}'
```
Pay with the Stripe test card `4242 4242 4242 4242`. Deposit will be exactly 50% ($4,000).

### Environment variables (Cloudflare Pages → Settings → Environment variables)
| Var | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe secret key (use a **test** key, `sk_test_…`). |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the `/api/stripe-webhook` endpoint (`whsec_…`). |
| `DEPOSIT_CHECKOUT_ENABLED` | `true` to activate `/api/create-deposit-link`. Leave unset to ship dark. |
| `ADMIN_TOKEN` | Shared secret required to mint a deposit link. |
| `AUTOMATIC_TAX` | Optional. `true` to enable Stripe automatic tax; default off. |

Set up: create the Stripe (test) account, add the keys above as Pages environment variables, register the webhook endpoint `https://<deploy>/api/stripe-webhook` in Stripe (listening for `checkout.session.completed`) and paste its signing secret into `STRIPE_WEBHOOK_SECRET`, then set `DEPOSIT_CHECKOUT_ENABLED=true` when ready to go live.

> Note: this task did not deploy to production and the Stripe flow was not runtime-tested because no Stripe account or keys exist yet. See the PR description for what was and was not verified.
