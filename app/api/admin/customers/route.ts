import { requireCafeUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, handleAuthError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireCafeUser();

    const customers = await db.loyaltyProfile.findMany({
      where: { cafeId: user.cafeId },
      orderBy: { stampsCount: "desc" },
    });

    return ok({ customers });
  } catch (error: any) {
    return handleAuthError(error);
  }
}
