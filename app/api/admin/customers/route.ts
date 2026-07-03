import { z } from "zod";
import { requireCafeOwnerOrManager } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, handleAuthError, badRequest } from "@/lib/api/response";

const querySchema = z.object({
  take: z.coerce.number().int().min(1).max(200).default(50),
  skip: z.coerce.number().int().min(0).max(10000).default(0),
  search: z.string().max(100).optional(),
});

export async function GET(request: Request) {
  try {
    const user = await requireCafeOwnerOrManager();
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      take: url.searchParams.get("take") ?? undefined,
      skip: url.searchParams.get("skip") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
    });
    if (!parsed.success) {
      return badRequest("Invalid query parameters", parsed.error.issues);
    }
    const { take, skip, search } = parsed.data;

    const where: any = { cafeId: user.cafeId };
    if (search && search.trim().length > 0) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { phone: { contains: term } },
      ];
    }

    const [customers, total] = await Promise.all([
      db.loyaltyProfile.findMany({
        where,
        orderBy: { stampsCount: "desc" },
        take,
        skip,
        select: {
          id: true,
          name: true,
          phone: true,
          stampsCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.loyaltyProfile.count({ where }),
    ]);

    return ok({ customers, total, take, skip });
  } catch (error: any) {
    return handleAuthError(error);
  }
}
