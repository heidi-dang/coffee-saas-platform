import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user || !user.cafeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const activeOnly = searchParams.get("activeOnly") === "true";

  const where: any = { cafeId: user.cafeId };
  if (status) where.status = status;
  if (activeOnly) {
    where.status = { in: ["NEW", "ACCEPTED", "PREPARING", "READY"] };
  }

  const orders = await db.order.findMany({
    where,
    include: {
      items: true,
      table: { select: { tableNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
