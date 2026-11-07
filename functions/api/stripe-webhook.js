// POST /api/stripe-webhook
//
// Verifies the Stripe signature (Web Crypto HMAC-SHA256, the Workers-correct way),
// and on a completed deposit payment notifies Tündük at the same destination as the
// quote form, with the reference, amount paid, and balance due.
//
// Env: STRIPE_WEBHOOK_SECRET. (Notifications go to the Formspree quote endpoint.)
const NOTIFY_ENDPOINT = "https://formspree.io/f/xjgdvpkg";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook not configured", { status: 500 });
  }

  const sigHeader = request.headers.get("stripe-signature") || "";
  const payload = await request.text(); // raw body, required for signature verification

  const ok = await verifyStripeSignature(payload, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return new Response("Invalid signature", { status: 400 });

  let event;
  try { event = JSON.parse(payload); } catch { return new Response("Bad payload", { status: 400 }); }

  // checkout.session.completed can fire before an async payment settles, so only
  // treat money as received when payment_status is "paid". Async methods confirm via
  // checkout.session.async_payment_succeeded / _failed.
  const sessionEvents = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
  ];
  if (sessionEvents.includes(event.type)) {
    const s = event.data.object || {};
    const m = s.metadata || {};
    if (m.type === "deposit") {
      const failed = event.type === "checkout.session.async_payment_failed";
      const paid = !failed && s.payment_status === "paid";
      if (paid || failed) {
        const email = s.customer_email || (s.customer_details && s.customer_details.email) || "";
        const notify = {
          _subject: `Tündük deposit ${failed ? "FAILED" : "PAID"}: ${m.reference || s.id}`,
          status: failed ? "failed" : "paid",
          reference: m.reference || "",
          type: m.type,
          customer_email: email,
          amount_usd: ((s.amount_total || 0) / 100).toFixed(2),
          agreed_total_usd: m.agreed_total_usd || "",
          balance_due_usd: m.balance_due_usd || "",
          stripe_session: s.id || ""
        };
        // Best-effort notification; do not fail the webhook if it hiccups.
        context.waitUntil(
          fetch(NOTIFY_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(notify),
          }).catch(() => {})
        );
      }
      // completed but not yet paid (async pending): wait for the async event.
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Implements Stripe's signature scheme: HMAC-SHA256 of "<t>.<payload>" with the
// webhook secret, compared to any v1 signature in the Stripe-Signature header,
// with a 5-minute replay tolerance.
async function verifyStripeSignature(payload, sigHeader, secret) {
  const tMatch = sigHeader.match(/(?:^|,)\s*t=([0-9]+)/);
  const v1s = [...sigHeader.matchAll(/v1=([a-f0-9]+)/g)].map((m) => m[1]);
  if (!tMatch || v1s.length === 0) return false;
  const t = tMatch[1];

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${payload}`));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");

  const matched = v1s.some((v) => timingSafeEqual(v, expected));
  if (!matched) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(t)) > 300) return false; // reject stale events (replay guard)
  return true;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
