// POST /api/create-deposit-link
//
// Admin-only. After a deal is agreed on the video call, Tündük calls this to mint a
// Stripe Checkout payment link for the AGREED deposit, then sends the link to the
// customer. The amount is set by Tündük (behind an admin token), never by the public
// browser, so there is no price logic or price exposure on the public site.
//
// Ships dark: inactive unless DEPOSIT_CHECKOUT_ENABLED === "true".
//
// Env: STRIPE_SECRET_KEY, DEPOSIT_CHECKOUT_ENABLED, ADMIN_TOKEN, AUTOMATIC_TAX (optional).
import prices from "../../prices.json";

export async function onRequestPost(context) {
  const { request, env } = context;

  if (env.DEPOSIT_CHECKOUT_ENABLED !== "true") {
    return json({ error: "Deposit checkout is not enabled." }, 404);
  }
  const token = request.headers.get("x-admin-token") || "";
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return json({ error: "Unauthorised." }, 401);
  }
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "Stripe is not configured." }, 500);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON." }, 400); }

  const reference = String(body.reference || "").trim();
  const customerEmail = String(body.customerEmail || "").trim();
  const agreedTotalUsd = Number(body.agreedTotalUsd);
  const label = String(body.label || "Boz Üy").trim();

  if (!reference || !customerEmail || !Number.isFinite(agreedTotalUsd) || agreedTotalUsd <= 0) {
    return json({ error: "reference, customerEmail and a positive agreedTotalUsd are required." }, 400);
  }

  const depositPercent = Number(prices.depositPercent) || 50;
  const currency = (prices.currency || "USD").toLowerCase();
  const depositCents = Math.round(agreedTotalUsd * depositPercent); // usd * percent = cents
  const depositUsd = depositCents / 100;
  const balanceDueUsd = Math.round((agreedTotalUsd - depositUsd) * 100) / 100;

  const origin = new URL(request.url).origin;
  const p = new URLSearchParams();
  p.set("mode", "payment");
  p.set("customer_email", customerEmail);
  p.set("success_url", `${origin}/tunduk-order-confirmed?ref=${encodeURIComponent(reference)}`);
  p.set("cancel_url", `${origin}/tunduk-configure`);
  p.set("line_items[0][quantity]", "1");
  p.set("line_items[0][price_data][currency]", currency);
  p.set("line_items[0][price_data][unit_amount]", String(depositCents));
  p.set("line_items[0][price_data][product_data][name]", `${label} — ${depositPercent}% deposit`);
  p.set("line_items[0][price_data][product_data][description]", `Deposit for order ${reference}. The balance is due only after you approve the video of your finished Boz Üy.`);
  p.set("metadata[reference]", reference);
  p.set("metadata[type]", "deposit");
  p.set("metadata[agreed_total_usd]", String(agreedTotalUsd));
  p.set("metadata[deposit_usd]", String(depositUsd));
  p.set("metadata[balance_due_usd]", String(balanceDueUsd));
  if (env.AUTOMATIC_TAX === "true") p.set("automatic_tax[enabled]", "true");

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: p.toString(),
  });
  const data = await res.json();
  if (!res.ok) {
    return json({ error: "Stripe error", detail: data && data.error ? data.error.message : "unknown" }, 502);
  }
  return json({ url: data.url, id: data.id, reference, depositUsd, balanceDueUsd });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
