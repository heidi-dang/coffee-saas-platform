import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || !user.cafeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const table = await db.cafeTable.findFirst({
    where: { id, cafeId: user.cafeId },
  });
  if (!table) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  const cafe = await db.cafe.findUnique({
    where: { id: user.cafeId },
    select: { slug: true },
  });
  if (!cafe) {
    return NextResponse.json({ error: "Cafe not found" }, { status: 404 });
  }

  const timestamp = Date.now();
  const { generateTableSignature } = await import("@/lib/auth/table-token");
  const signature = generateTableSignature(user.cafeId, table.tableNumber, timestamp);

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/cafe/${cafe.slug}/order?tableToken=${table.qrToken}&t=${timestamp}&s=${signature}`;

  return NextResponse.json({ qrUrl, tableNumber: table.tableNumber });
}
