import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canManageMenu } from "@/lib/permissions";
import { db } from "@/lib/db";
import { updateOptionSchema } from "@/lib/validations";

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

  const parsed = updateOptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid option data", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const option = await db.menuItemOption.findFirst({
    where: { id, menuItem: { cafeId: user.cafeId } },
  });
  if (!option) {
    return NextResponse.json({ error: "Option not found" }, { status: 404 });
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.required !== undefined) updateData.required = data.required;
  if (data.minSelect !== undefined) updateData.minSelect = data.minSelect;
  if (data.maxSelect !== undefined) updateData.maxSelect = data.maxSelect;

  await db.menuItemOption.update({
    where: { id },
    data: updateData,
  });

  if (data.values) {
    await db.$transaction(async (tx) => {
      await tx.menuItemOptionValue.deleteMany({ where: { optionId: id } });
      for (const v of data.values!) {
        await tx.menuItemOptionValue.create({
          data: {
            optionId: id,
            name: v.name,
            priceCents: v.priceCents ?? 0,
            sortOrder: v.sortOrder ?? 0,
          },
        });
      }
    });
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

  // Delete values then option in transaction
  await db.$transaction(async (tx) => {
    await tx.menuItemOptionValue.deleteMany({ where: { optionId: id } });
    await tx.menuItemOption.delete({ where: { id } });
  });
  return NextResponse.json({ success: true });
}
