import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canManageTables } from "@/lib/permissions";
import { db } from "@/lib/db";
import crypto from "node:crypto";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageTables(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const table = await db.cafeTable.findFirst({
    where: { id, cafeId: user.cafeId },
  });
  if (!table) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  const updateData: any = {};
  if (body.tableNumber !== undefined) updateData.tableNumber = body.tableNumber;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.regenerateQr) {
    updateData.qrToken = crypto.randomBytes(24).toString("hex");
  }

  const updated = await db.cafeTable.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ table: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageTables(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const table = await db.cafeTable.findFirst({
    where: { id, cafeId: user.cafeId },
  });
  if (!table) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  await db.cafeTable.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
