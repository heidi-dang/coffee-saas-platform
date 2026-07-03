import Stripe from "stripe";

export function getStripeSecretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.trim() === "") return null;
  return key;
}

export function getStripeWebhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.trim() === "") return null;
  return secret;
}

export function getStripePublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key || key.trim() === "") return null;
  return key;
}

export function isStripeConfigured(): boolean {
  return getStripeSecretKey() !== null;
}

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  if (!_stripe) {
    _stripe = new Stripe(key, {
      apiVersion: "2024-12-18.acacia" as any,
    });
  }
  return _stripe;
}

export interface StripeLineItem {
  name: string;
  description?: string;
  unitPriceCents: number;
  quantity: number;
}

export function buildStripeLineItems(items: StripeLineItem[]): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "aud",
      unit_amount: item.unitPriceCents,
      product_data: {
        name: item.name,
        description: item.description,
      },
    },
  }));
}
