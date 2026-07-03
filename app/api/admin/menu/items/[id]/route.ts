import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canManageMenu } from "@/lib/permissions";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageMenu(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (body.priceCents !== undefined && body.priceCents < 0) {
    return NextResponse.json(
      { error: "Price cannot be negative" },
      { status: 400 }
    );
  }

  const item = await db.menuItem.findFirst({
    where: { id, cafeId: user.cafeId },
  });
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.priceCents !== undefined) updateData.priceCents = body.priceCents;
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
  if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable;
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

  const updated = await db.menuItem.update({ where: { id }, data: updateData });

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageMenu(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await db.menuItem.findFirst({
    where: { id, cafeId: user.cafeId },
  });
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await db.menuItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
