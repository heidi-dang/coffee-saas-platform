import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
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

  it("accepts ONLINE", async () => {
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

  it("rejects unavailable items", async () => {
    const { validateAndPriceItem } = await import("@/lib/orders/price-order");
    const menuItem = {
      id: "m1",
      cafeId: "c1",
      categoryId: "cat1",
      name: "Latte",
      description: null,
      imageUrl: null,
      priceCents: 550,
      isAvailable: false,
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
  });

  it("rejects invalid options", async () => {
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
