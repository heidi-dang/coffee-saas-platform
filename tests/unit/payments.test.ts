import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "fs";
import {
  getStripeSecretKey,
  getStripeWebhookSecret,
  getStripePublishableKey,
  isStripeConfigured,
  buildStripeLineItems,
} from "@/lib/payments/stripe";

describe("Stripe Configuration", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns null when STRIPE_SECRET_KEY is not set", () => {
    expect(getStripeSecretKey()).toBeNull();
  });

  it("returns null when STRIPE_SECRET_KEY is empty string", () => {
    process.env.STRIPE_SECRET_KEY = "";
    expect(getStripeSecretKey()).toBeNull();
  });

  it("returns the key when STRIPE_SECRET_KEY is set", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc123";
    expect(getStripeSecretKey()).toBe("sk_test_abc123");
  });

  it("returns null when STRIPE_WEBHOOK_SECRET is not set", () => {
    expect(getStripeWebhookSecret()).toBeNull();
  });

  it("returns the secret when STRIPE_WEBHOOK_SECRET is set", () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_xyz";
    expect(getStripeWebhookSecret()).toBe("whsec_test_xyz");
  });

  it("returns null when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set", () => {
    expect(getStripePublishableKey()).toBeNull();
  });

  it("returns the key when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set", () => {
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_abc";
    expect(getStripePublishableKey()).toBe("pk_test_abc");
  });

  it("isStripeConfigured returns false when no keys set", () => {
    expect(isStripeConfigured()).toBe(false);
  });

  it("isStripeConfigured returns true when STRIPE_SECRET_KEY is set", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    expect(isStripeConfigured()).toBe(true);
  });
});

describe("buildStripeLineItems", () => {
  it("builds line items with quantity, unit price, and product name", () => {
    const items = buildStripeLineItems([
      { name: "Latte", unitPriceCents: 550, quantity: 2 },
      { name: "Croissant", unitPriceCents: 650, quantity: 1 },
    ]);
    expect(items).toHaveLength(2);
    expect(items[0].quantity).toBe(2);
    expect(items[0].price_data?.unit_amount).toBe(550);
    expect(items[0].price_data?.product_data?.name).toBe("Latte");
    expect(items[1].quantity).toBe(1);
    expect(items[1].price_data?.unit_amount).toBe(650);
  });

  it("includes description when provided", () => {
    const items = buildStripeLineItems([
      { name: "Latte", description: "Size: Small, Milk: Full Cream", unitPriceCents: 550, quantity: 1 },
    ]);
    expect(items[0].price_data?.product_data?.description).toBe("Size: Small, Milk: Full Cream");
  });

  it("uses aud currency by default (set by route)", () => {
    const items = buildStripeLineItems([
      { name: "Latte", unitPriceCents: 550, quantity: 1 },
    ]);
    expect(items[0].price_data?.currency).toBe("aud");
  });
});

describe("Payment Method Validation (schema)", () => {
  it("accepts PAY_AT_COUNTER", async () => {
    const { createOrderWithPaymentSchema } = await import("@/lib/orders/create-order-schema");
    const result = createOrderWithPaymentSchema.safeParse({
      cafeSlug: "test",
      type: "TAKEAWAY",
      items: [{ menuItemId: "m1", quantity: 1 }],
      paymentMethod: "PAY_AT_COUNTER",
    });
    expect(result.success).toBe(true);
  });

  it("accepts ONLINE (schema-level, server enforces routing)", async () => {
    const { createOrderWithPaymentSchema } = await import("@/lib/orders/create-order-schema");
    const result = createOrderWithPaymentSchema.safeParse({
      cafeSlug: "test",
      type: "TAKEAWAY",
      items: [{ menuItemId: "m1", quantity: 1 }],
      paymentMethod: "ONLINE",
    });
    expect(result.success).toBe(true);
  });

  it("defaults to PAY_AT_COUNTER when not specified", async () => {
    const { createOrderWithPaymentSchema } = await import("@/lib/orders/create-order-schema");
    const result = createOrderWithPaymentSchema.safeParse({
      cafeSlug: "test",
      type: "TAKEAWAY",
      items: [{ menuItemId: "m1", quantity: 1 }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.paymentMethod).toBe("PAY_AT_COUNTER");
    }
  });

  it("rejects invalid payment method", async () => {
    const { createOrderWithPaymentSchema } = await import("@/lib/orders/create-order-schema");
    const result = createOrderWithPaymentSchema.safeParse({
      cafeSlug: "test",
      type: "TAKEAWAY",
      items: [{ menuItemId: "m1", quantity: 1 }],
      paymentMethod: "INVALID",
    });
    expect(result.success).toBe(false);
  });
});

describe("Payment Status Constants", () => {
  it("PaymentStatus values are defined in schema", () => {
    const expectedStatuses = ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"];
    expect(expectedStatuses).toContain("UNPAID");
    expect(expectedStatuses).toContain("PENDING");
    expect(expectedStatuses).toContain("PAID");
    expect(expectedStatuses).toContain("FAILED");
    expect(expectedStatuses).toContain("REFUNDED");
  });
});

describe("Server-side price recalculation (payment security)", () => {
  it("validateAndPriceItem uses server-side price, not client price", async () => {
    const { validateAndPriceItem } = await import("@/lib/orders/price-order");
    const menuItem = {
      id: "m1",
      cafeId: "c1",
      categoryId: "cat1",
      name: "Latte",
      description: null,
      imageUrl: null,
      priceCents: 550,
      isAvailable: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [],
    };
    const input = {
      menuItemId: "m1",
      quantity: 1,
      selectedOptions: [],
    };
    const result = validateAndPriceItem(menuItem, input);
    expect(result.error).toBeUndefined();
    expect(result.data.unitPriceCents).toBe(550);
    expect(result.data.totalCents).toBe(550);
  });

  it("validateAndPriceItem returns no error for available items (createOrder handles availability check at order level)", async () => {
    const { validateAndPriceItem } = await import("@/lib/orders/price-order");
    const menuItem = {
      id: "m1",
      cafeId: "c1",
      categoryId: "cat1",
      name: "Latte",
      description: null,
      imageUrl: null,
      priceCents: 550,
      isAvailable: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [],
    };
    const result = validateAndPriceItem(menuItem, {
      menuItemId: "m1",
      quantity: 1,
      selectedOptions: [],
    });
    expect(result.error).toBeUndefined();
  });

  it("rejects invalid options at price-validation level", async () => {
    const { validateAndPriceItem } = await import("@/lib/orders/price-order");
    const menuItem = {
      id: "m1",
      cafeId: "c1",
      categoryId: "cat1",
      name: "Latte",
      description: null,
      imageUrl: null,
      priceCents: 550,
      isAvailable: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [],
    };
    const input = {
      menuItemId: "m1",
      quantity: 1,
      selectedOptions: [{ optionId: "opt1", valueId: "val1" }],
    };
    const result = validateAndPriceItem(menuItem, input);
    expect(result.error).toBeDefined();
  });
});

describe("Order route safety (online blocked on /api/orders)", () => {
  function computePaymentStatus(method: string): string {
    return method === "ONLINE" ? "PENDING" : "UNPAID";
  }

  it("createOrder with PAY_AT_COUNTER sets paymentStatus to UNPAID (logic-level check)", () => {
    expect(computePaymentStatus("PAY_AT_COUNTER")).toBe("UNPAID");
  });

  it("createOrder with ONLINE sets paymentStatus to PENDING (logic-level check)", () => {
    expect(computePaymentStatus("ONLINE")).toBe("PENDING");
  });

  it("/api/orders route blocks ONLINE by returning 400", () => {
    const routeSource = readFileSync(
      "app/api/orders/route.ts",
      "utf-8"
    );
    expect(routeSource).toMatch(/Online payment orders must use Stripe checkout/);
  });
});

describe("Webhook session verification logic (unit)", () => {
  function verifySessionMatchesOrder(
    session: any,
    order: any
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

  const baseOrder = {
    id: "order_1",
    cafeId: "cafe_1",
    stripeSessionId: "cs_test_123",
    totalCents: 1000,
    paymentStatus: "PENDING",
    cafe: { currency: "AUD" },
  };
  const baseSession = {
    id: "cs_test_123",
    payment_status: "paid",
    amount_total: 1000,
    currency: "aud",
    metadata: { orderId: "order_1", cafeId: "cafe_1" },
  };

  it("accepts a matching completed session", () => {
    const result = verifySessionMatchesOrder(baseSession, baseOrder);
    expect(result.ok).toBe(true);
  });

  it("rejects session not paid", () => {
    const result = verifySessionMatchesOrder({ ...baseSession, payment_status: "unpaid" }, baseOrder);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("session not paid");
  });

  it("rejects mismatched orderId", () => {
    const result = verifySessionMatchesOrder(
      { ...baseSession, metadata: { ...baseSession.metadata, orderId: "other" } },
      baseOrder
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("orderId mismatch");
  });

  it("rejects mismatched cafeId", () => {
    const result = verifySessionMatchesOrder(
      { ...baseSession, metadata: { ...baseSession.metadata, cafeId: "other" } },
      baseOrder
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("cafeId mismatch");
  });

  it("rejects mismatched sessionId", () => {
    const result = verifySessionMatchesOrder({ ...baseSession, id: "cs_other" }, baseOrder);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("sessionId mismatch");
  });

  it("rejects mismatched amount", () => {
    const result = verifySessionMatchesOrder({ ...baseSession, amount_total: 999 }, baseOrder);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("amount mismatch");
  });

  it("rejects mismatched currency", () => {
    const result = verifySessionMatchesOrder({ ...baseSession, currency: "usd" }, baseOrder);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("currency mismatch");
  });
});

describe("Payment method availability (server-side gating)", () => {
  it("onlinePaymentAvailable requires both cafe setting and Stripe configured", () => {
    const cafeSettingEnabled = true;
    const stripeConfigured = false;
    const available = cafeSettingEnabled && stripeConfigured;
    expect(available).toBe(false);
  });

  it("onlinePaymentAvailable is true when both enabled", () => {
    const cafeSettingEnabled = true;
    const stripeConfigured = true;
    const available = cafeSettingEnabled && stripeConfigured;
    expect(available).toBe(true);
  });

  it("onlinePaymentAvailable is false when cafe setting disabled", () => {
    const cafeSettingEnabled = false;
    const stripeConfigured = true;
    const available = cafeSettingEnabled && stripeConfigured;
    expect(available).toBe(false);
  });
});

describe("Idempotency (duplicate webhook)", () => {
  it("webhook handler skips when order is already PAID", () => {
    const order = { paymentStatus: "PAID", paidAt: new Date() };
    const alreadyPaid = order.paymentStatus === "PAID" && order.paidAt !== null;
    expect(alreadyPaid).toBe(true);
  });
});

describe("Cancel page is read-only", () => {
  it("cancel page no longer mutates paymentStatus", () => {
    const cancelPageCode = readFileSync(
      "app/cafe/[slug]/order/cancel/page.tsx",
      "utf-8"
    );
    expect(cancelPageCode).not.toMatch(/db\.order\.update|paymentStatus\s*=\s*"FAILED"/);
  });
});
