import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod/v4";

const feedbackSchema = z.object({
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid feedback data" }, { status: 400 });
    }

    const { orderId, rating, comment } = parsed.data;

    // Verify order exists and is completed
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, feedback: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Feedback can only be submitted for completed orders" },
        { status: 400 }
      );
    }

    if (order.feedback) {
      return NextResponse.json({ error: "Feedback already submitted" }, { status: 409 });
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
