import { requireMenuAccess } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, unauthorized, badRequest, serverError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireMenuAccess();

    const categories = await db.menuCategory.findMany({
      where: { cafeId: user.cafeId },
      orderBy: { sortOrder: "asc" },
    });

    return ok({ categories });
  } catch (error: any) {
    if (error.name === "AuthError") {
      return unauthorized(error.message);
    }
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireMenuAccess();

    const { name, sortOrder } = await request.json();
    if (!name) {
      return badRequest("Category name is required");
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

    return ok({ category });
  } catch (error: any) {
    if (error.name === "AuthError") {
      return unauthorized(error.message);
    }
    return serverError(error);
  }
}
