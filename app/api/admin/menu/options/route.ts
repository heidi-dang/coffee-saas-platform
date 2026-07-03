import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canManageMenu } from "@/lib/permissions";
import { db } from "@/lib/db";
import { createOptionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageMenu(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const parsed = createOptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid option data", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { menuItemId, name, type, required, minSelect, maxSelect, values } =
    parsed.data;

  const item = await db.menuItem.findFirst({
    where: { id: menuItemId, cafeId: user.cafeId },
  });
  if (!item) {
    return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
  }

  const option = await db.menuItemOption.create({
    data: {
      menuItemId,
      name,
      type,
      required,
      minSelect,
      maxSelect,
      values: values && values.length > 0
        ? { create: values }
        : undefined,
    },
    include: { values: true },
  });

  return NextResponse.json({ option });
}
