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

  if (
    body.maxSelect !== undefined &&
    body.minSelect !== undefined &&
    body.maxSelect < body.minSelect
  ) {
    return NextResponse.json(
      { error: "Max select cannot be lower than min select" },
      { status: 400 }
    );
  }

  const option = await db.menuItemOption.findFirst({
    where: { id, menuItem: { cafeId: user.cafeId } },
  });
  if (!option) {
    return NextResponse.json({ error: "Option not found" }, { status: 404 });
  }

  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.type !== undefined) updateData.type = body.type;
  if (body.required !== undefined) updateData.required = body.required;
  if (body.minSelect !== undefined) updateData.minSelect = body.minSelect;
  if (body.maxSelect !== undefined) updateData.maxSelect = body.maxSelect;

  const updated = await db.menuItemOption.update({
    where: { id },
    data: updateData,
    include: { values: true },
  });

  if (body.values) {
    await db.menuItemOptionValue.deleteMany({ where: { optionId: id } });
    for (const v of body.values) {
      await db.menuItemOptionValue.create({
        data: {
          optionId: id,
          name: v.name,
          priceCents: v.priceCents ?? 0,
          sortOrder: v.sortOrder ?? 0,
        },
      });
    }
  }

  const refreshed = await db.menuItemOption.findUnique({
    where: { id },
    include: { values: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ option: refreshed });
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
  const option = await db.menuItemOption.findFirst({
    where: { id, menuItem: { cafeId: user.cafeId } },
  });
  if (!option) {
    return NextResponse.json({ error: "Option not found" }, { status: 404 });
  }

  await db.menuItemOption.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
