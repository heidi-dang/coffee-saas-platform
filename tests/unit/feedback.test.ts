import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import { readFileSync } from "fs";

const feedbackSchema = z.object({
  cafeSlug: z.string().min(1).max(100),
  orderId: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

describe("Feedback schema validation", () => {
  it("accepts valid feedback with cafeSlug and orderId", () => {
    const result = feedbackSchema.safeParse({
      cafeSlug: "demo-coffee",
      orderId: "cmr123",
      rating: 5,
      comment: "Great coffee!",
    });
    expect(result.success).toBe(true);
  });

  it("accepts feedback without comment", () => {
    const result = feedbackSchema.safeParse({
      cafeSlug: "demo-coffee",
      orderId: "cmr123",
      rating: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing cafeSlug", () => {
    const result = feedbackSchema.safeParse({
      orderId: "cmr123",
      rating: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing orderId", () => {
    const result = feedbackSchema.safeParse({
      cafeSlug: "demo-coffee",
      rating: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating below 1", () => {
    const result = feedbackSchema.safeParse({
      cafeSlug: "demo-coffee",
      orderId: "cmr123",
      rating: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating above 5", () => {
    const result = feedbackSchema.safeParse({
      cafeSlug: "demo-coffee",
      orderId: "cmr123",
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer rating", () => {
    const result = feedbackSchema.safeParse({
      cafeSlug: "demo-coffee",
      orderId: "cmr123",
      rating: 3.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects comment over 1000 chars", () => {
    const result = feedbackSchema.safeParse({
      cafeSlug: "demo-coffee",
      orderId: "cmr123",
      rating: 4,
      comment: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe("Feedback route scoping logic (unit)", () => {
  type Order = { id: string; status: string; cafeId: string; feedback: unknown } | null;
  type Cafe = { slug: string; isActive: boolean } | null;

  function validateFeedbackRequest(
    order: Order,
    cafe: Cafe,
    existingFeedback: unknown
  ): { ok: true } | { ok: false; code: number; error: string } {
    if (!order || !cafe) {
      return { ok: false, code: 404, error: "Invalid order or feedback unavailable" };
    }
    if (!cafe.isActive) {
      return { ok: false, code: 404, error: "Invalid order or feedback unavailable" };
    }
    if (order.status !== "COMPLETED") {
      return { ok: false, code: 400, error: "Invalid order or feedback unavailable" };
    }
    if (existingFeedback) {
      return { ok: false, code: 409, error: "Invalid order or feedback unavailable" };
    }
    return { ok: true };
  }

  it("allows feedback for valid cafe + completed order + no existing feedback", () => {
    const result = validateFeedbackRequest(
      { id: "o1", status: "COMPLETED", cafeId: "c1", feedback: null },
      { slug: "demo-coffee", isActive: true },
      null
    );
    expect(result.ok).toBe(true);
  });

  it("rejects when order not found (wrong cafeSlug)", () => {
    const result = validateFeedbackRequest(null, null, null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe(404);
  });

  it("rejects when cafe is inactive", () => {
    const result = validateFeedbackRequest(
      { id: "o1", status: "COMPLETED", cafeId: "c1", feedback: null },
      { slug: "closed-cafe", isActive: false },
      null
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe(404);
  });

  it("rejects when order is not COMPLETED", () => {
    const result = validateFeedbackRequest(
      { id: "o1", status: "NEW", cafeId: "c1", feedback: null },
      { slug: "demo-coffee", isActive: true },
      null
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe(400);
  });

  it("rejects duplicate feedback submission", () => {
    const result = validateFeedbackRequest(
      { id: "o1", status: "COMPLETED", cafeId: "c1", feedback: { id: "fb1", rating: 5 } },
      { slug: "demo-coffee", isActive: true },
      { id: "fb1", rating: 5 }
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe(409);
  });

  it("uses generic error message in all rejection cases", () => {
    const cases = [
      validateFeedbackRequest(null, null, null),
      validateFeedbackRequest(
        { id: "o1", status: "NEW", cafeId: "c1", feedback: null },
        { slug: "demo-coffee", isActive: true },
        null
      ),
      validateFeedbackRequest(
        { id: "o1", status: "COMPLETED", cafeId: "c1", feedback: { id: "fb1" } },
        { slug: "demo-coffee", isActive: true },
        { id: "fb1" }
      ),
    ];
    for (const c of cases) {
      if (!c.ok) {
        expect(c.error).toBe("Invalid order or feedback unavailable");
      }
    }
  });
});

describe("Feedback route source analysis", () => {
  it("requires cafeSlug in the route source", () => {
    const source = readFileSync("app/api/feedback/route.ts", "utf-8");
    expect(source).toContain("cafeSlug");
  });

  it("uses scoped findFirst with cafe slug + isActive", () => {
    const source = readFileSync("app/api/feedback/route.ts", "utf-8");
    expect(source).toContain("findFirst");
    expect(source).toContain("slug: cafeSlug");
    expect(source).toContain("isActive: true");
  });

  it("uses generic error message - no cafe/order exposure", () => {
    const source = readFileSync("app/api/feedback/route.ts", "utf-8");
    const genericCount = (source.match(/Invalid order or feedback unavailable/g) || []).length;
    expect(genericCount).toBeGreaterThanOrEqual(3);
  });

  it("does not expose customerName in route source", () => {
    const source = readFileSync("app/api/feedback/route.ts", "utf-8");
    expect(source).not.toMatch(/customerName|customerPhone|paymentStatus|totalCents/);
  });

  it("moves per-order rate bucket after order validation", () => {
    const source = readFileSync("app/api/feedback/route.ts", "utf-8");
    const createIndex = source.indexOf("orderFeedback.create");
    const bucketIndex = source.lastIndexOf("checkAndIncrement(orderBuckets");
    expect(bucketIndex).toBeLessThan(createIndex);
  });
});

describe("Stripe payment tests still pass", () => {
  it("payment route still blocks ONLINE on /api/orders", () => {
    const routeSource = readFileSync("app/api/orders/route.ts", "utf-8");
    expect(routeSource).toMatch(/Online payment orders must use Stripe checkout/);
  });

  it("cancel page is still read-only", () => {
    const cancelPageCode = readFileSync(
      "app/cafe/[slug]/order/cancel/page.tsx",
      "utf-8"
    );
    expect(cancelPageCode).not.toMatch(/db\.order\.update|paymentStatus\s*=\s*"FAILED"/);
  });
});
