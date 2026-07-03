import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canManageMenu } from "@/lib/permissions";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageMenu(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { menuItemId, name, type, required, minSelect, maxSelect, values } =
    await request.json();

  if (!menuItemId || !name) {
    return NextResponse.json(
      { error: "Menu item ID and option name are required" },
      { status: 400 }
    );
  }

  if (maxSelect !== undefined && minSelect !== undefined && maxSelect < minSelect) {
    return NextResponse.json(
      { error: "Max select cannot be lower than min select" },
      { status: 400 }
    );
  }

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
      type: type || "SINGLE",
      required: required ?? false,
      minSelect: minSelect ?? 0,
      maxSelect: maxSelect ?? 1,
      values: values
        ? { create: values }
        : undefined,
    },
    include: { values: true },
  });

  return NextResponse.json({ option });
}
