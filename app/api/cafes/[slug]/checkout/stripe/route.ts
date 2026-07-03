import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createOrderWithPaymentSchema } from "@/lib/orders/create-order-schema";
import { getStripe, isStripeConfigured, buildStripeLineItems } from "@/lib/payments/stripe";
import { badRequest, serverError } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    if (!isStripeConfigured()) {
      return badRequest("Online payment is not available because Stripe is not configured.");
    }

    const { slug } = await params;
    const body = await request.json();
    const parsed = createOrderWithPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid request", parsed.error.issues);
    }

    if (parsed.data.paymentMethod !== "ONLINE") {
      return badRequest("This endpoint is for online payment orders only.");
    }

    const { paymentMethod, ...orderInput } = parsed.data;
    if (orderInput.cafeSlug !== slug) {
      return badRequest("Cafe slug mismatch.");
    }

    const cafe = await db.cafe.findUnique({
      where: { slug },
      include: { settings: true },
    });
    if (!cafe || !cafe.isActive) {
      return badRequest("Cafe not found or inactive");
    }
    if (!cafe.settings?.acceptOnlinePayment) {
      return badRequest("Online payment is not enabled for this cafe");
    }

    const { createOrder } = await import("@/lib/orders/create-order");
    const result = await createOrder(orderInput, { paymentMethod: "ONLINE" });
    if (!result.ok) {
      return badRequest(result.error);
    }

    const order = result.data;
    const lineItems = buildStripeLineItems(
      order.items.map((item) => {
        const opts = Array.isArray(item.optionsSnapshot)
          ? (item.optionsSnapshot as Array<{ optionName: string; valueName: string }>)
              .map((o) => `${o.optionName}: ${o.valueName}`)
              .join(", ")
          : "";
        return {
          name: item.itemNameSnapshot + (opts ? ` (${opts})` : ""),
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
        };
      })
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3200`;
    const successUrl = `${baseUrl}/cafe/${slug}/order/success?orderId=${order.orderId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/cafe/${slug}/order/cancel?orderId=${order.orderId}`;

    const stripe = getStripe();
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        currency: cafe.currency.toLowerCase(),
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          orderId: order.orderId,
          cafeId: cafe.id,
        },
      });
    } catch (stripeError: any) {
      console.error("Stripe session creation failed, marking order FAILED:", stripeError?.message);
      await db.order.update({
        where: { id: order.orderId },
        data: { paymentStatus: "FAILED" },
      }).catch(() => {});
      return NextResponse.json(
        { error: "Failed to start payment. Please try again or pay at counter." },
        { status: 500 }
      );
    }

    await db.order.update({
      where: { id: order.orderId },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      orderId: order.orderId,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return serverError(error);
  }
}
