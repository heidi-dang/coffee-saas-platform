import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const allowedTransitions: Record<string, string[]> = {
  NEW: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || !user.cafeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status: newStatus } = await request.json();

  if (!newStatus) {
    return NextResponse.json(
      { error: "Status is required" },
      { status: 400 }
    );
  }

  const validStatuses = [
    "NEW",
    "ACCEPTED",
    "PREPARING",
    "READY",
    "COMPLETED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { id, cafeId: user.cafeId },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const allowed = allowedTransitions[order.status];
  if (!allowed || !allowed.includes(newStatus)) {
    return NextResponse.json(
      {
        error: `Cannot transition from ${order.status} to ${newStatus}`,
      },
      { status: 400 }
    );
  }

  const updated = await db.order.update({
    where: { id },
    data: { status: newStatus },
  });

  return NextResponse.json({ order: updated });
}
