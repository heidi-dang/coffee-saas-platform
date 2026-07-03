import { requireMenuAccess } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, unauthorized, badRequest, notFound, serverError, handleAuthError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireMenuAccess();

    const items = await db.menuItem.findMany({
      where: { cafeId: user.cafeId },
      include: {
        category: { select: { name: true } },
        options: { include: { values: { orderBy: { sortOrder: "asc" } } } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return ok({ items });
  } catch (error: any) {
    return handleAuthError(error);
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireMenuAccess();

    const { name, description, priceCents, categoryId, sortOrder, imageUrl } =
      await request.json();

    if (!name || !categoryId || priceCents === undefined) {
      return badRequest("Name, category, and price are required");
    }

    if (priceCents < 0) {
      return badRequest("Price cannot be negative");
    }

    const category = await db.menuCategory.findFirst({
      where: { id: categoryId, cafeId: user.cafeId },
    });
    if (!category) {
      return notFound("Category not found");
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

    return ok({ item });
  } catch (error: any) {
    return handleAuthError(error);
    return serverError(error);
  }
}
