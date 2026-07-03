import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod/v4";

const feedbackSchema = z.object({
  cafeSlug: z.string().min(1).max(100),
  orderId: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_PER_IP = 5;
const RATE_LIMIT_MAX_PER_ORDER = 1;

type Bucket = { count: number; windowStart: number };
const ipBuckets = new Map<string, Bucket>();
const orderBuckets = new Map<string, Bucket>();

function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function checkAndIncrement(buckets: Map<string, Bucket>, key: string, max: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.windowStart > RATE_LIMIT_WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkAndIncrement(ipBuckets, ip, RATE_LIMIT_MAX_PER_IP)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid feedback data" }, { status: 400 });
    }

    const { cafeSlug, orderId, rating, comment } = parsed.data;

    const order = await db.order.findFirst({
      where: {
        id: orderId,
        cafe: {
          slug: cafeSlug,
          isActive: true,
        },
      },
      select: {
        id: true,
        status: true,
        feedback: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Invalid order or feedback unavailable" },
        { status: 404 }
      );
    }

    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Invalid order or feedback unavailable" },
        { status: 400 }
      );
    }

    if (order.feedback) {
      return NextResponse.json(
        { error: "Invalid order or feedback unavailable" },
        { status: 409 }
      );
    }

    if (!checkAndIncrement(orderBuckets, orderId, RATE_LIMIT_MAX_PER_ORDER)) {
      return NextResponse.json(
        { error: "Invalid order or feedback unavailable" },
        { status: 429 }
      );
    }

    const feedback = await db.orderFeedback.create({
      data: {
        orderId,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error: any) {
    console.error("[feedback POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
