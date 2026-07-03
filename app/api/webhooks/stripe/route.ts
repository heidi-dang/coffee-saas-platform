import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe, getStripeWebhookSecret } from "@/lib/payments/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = getStripeWebhookSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 500 }
    );
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutFailed(session);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json(
      { error: err?.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}

function verifySessionMatchesOrder(
  session: Stripe.Checkout.Session,
  order: { id: string; cafeId: string; stripeSessionId: string | null; totalCents: number; paymentStatus: string; cafe: { currency: string } }
): { ok: true } | { ok: false; reason: string } {
  if (session.payment_status !== "paid") {
    return { ok: false, reason: "session not paid" };
  }
  const sessionOrderId = session.metadata?.orderId;
  const sessionCafeId = session.metadata?.cafeId;
  if (!sessionOrderId || sessionOrderId !== order.id) {
    return { ok: false, reason: "orderId mismatch" };
  }
  if (!sessionCafeId || sessionCafeId !== order.cafeId) {
    return { ok: false, reason: "cafeId mismatch" };
  }
  if (!order.stripeSessionId || order.stripeSessionId !== session.id) {
    return { ok: false, reason: "sessionId mismatch" };
  }
  if (typeof session.amount_total !== "number" || session.amount_total !== order.totalCents) {
    return { ok: false, reason: "amount mismatch" };
  }
  const expectedCurrency = order.cafe.currency.toLowerCase();
  if (!session.currency || session.currency.toLowerCase() !== expectedCurrency) {
    return { ok: false, reason: "currency mismatch" };
  }
  return { ok: true };
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.warn("Stripe checkout.session.completed missing orderId metadata");
    return;
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { cafe: { select: { currency: true } } },
  });
  if (!order) {
    console.warn(`Stripe checkout.session.completed for unknown order ${orderId}`);
    return;
  }

  if (order.paymentStatus === "PAID" && order.paidAt) {
    return;
  }

  const check = verifySessionMatchesOrder(session, order);
  if (!check.ok) {
    console.warn(
      `Stripe checkout.session.completed rejected for order ${orderId}: ${check.reason}`
    );
    return;
  }

  await db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID",
      paidAt: new Date(),
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    },
  });
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  if (order.stripeSessionId !== session.id) {
    console.warn(`Stripe checkout.session.expired sessionId mismatch for order ${orderId}`);
    return;
  }
  if (order.paymentStatus === "PENDING") {
    await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: "FAILED" },
    });
  }
}

async function handleCheckoutFailed(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  if (order.stripeSessionId !== session.id) {
    console.warn(`Stripe checkout.session.async_payment_failed sessionId mismatch for order ${orderId}`);
    return;
  }
  if (order.paymentStatus === "PENDING" || order.paymentStatus === "FAILED") {
    await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: "FAILED" },
    });
  }
}
