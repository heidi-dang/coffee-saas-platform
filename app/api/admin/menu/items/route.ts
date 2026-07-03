import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canManageMenu } from "@/lib/permissions";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageMenu(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db.menuItem.findMany({
    where: { cafeId: user.cafeId },
    include: {
      category: { select: { name: true } },
      options: { include: { values: { orderBy: { sortOrder: "asc" } } } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageMenu(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, priceCents, categoryId, sortOrder, imageUrl } =
    await request.json();

  if (!name || !categoryId || priceCents === undefined) {
    return NextResponse.json(
      { error: "Name, category, and price are required" },
      { status: 400 }
    );
  }

  if (priceCents < 0) {
    return NextResponse.json(
      { error: "Price cannot be negative" },
      { status: 400 }
    );
  }

  const category = await db.menuCategory.findFirst({
    where: { id: categoryId, cafeId: user.cafeId },
  });
  if (!category) {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404 }
    );
  }

  const maxOrder = await db.menuItem.findFirst({
    where: { cafeId: user.cafeId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const item = await db.menuItem.create({
    data: {
      cafeId: user.cafeId,
      categoryId,
      name,
      description: description ?? null,
      priceCents,
      imageUrl: imageUrl ?? null,
      sortOrder: sortOrder ?? (maxOrder?.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json({ item });
}
