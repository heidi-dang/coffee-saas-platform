import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canManageTables } from "@/lib/permissions";
import { db } from "@/lib/db";
import crypto from "node:crypto";

function generateQrToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export async function GET() {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageTables(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [tables, cafe] = await Promise.all([
    db.cafeTable.findMany({
      where: { cafeId: user.cafeId },
      orderBy: { tableNumber: "asc" },
    }),
    db.cafe.findUnique({
      where: { id: user.cafeId },
      select: { slug: true },
    }),
  ]);

  return NextResponse.json({ tables, cafeSlug: cafe?.slug || "" });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageTables(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tableNumber } = await request.json();
  if (!tableNumber) {
    return NextResponse.json(
      { error: "Table number is required" },
      { status: 400 }
    );
  }

  const table = await db.cafeTable.create({
    data: {
      cafeId: user.cafeId,
      tableNumber,
      qrToken: generateQrToken(),
    },
  });

  return NextResponse.json({ table });
}
