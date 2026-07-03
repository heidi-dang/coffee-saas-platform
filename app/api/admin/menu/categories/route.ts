import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canManageMenu } from "@/lib/permissions";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageMenu(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await db.menuCategory.findMany({
    where: { cafeId: user.cafeId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageMenu(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, sortOrder } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const maxOrder = await db.menuCategory.findFirst({
    where: { cafeId: user.cafeId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const category = await db.menuCategory.create({
    data: {
      cafeId: user.cafeId,
      name,
      sortOrder: sortOrder ?? (maxOrder?.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json({ category });
}
