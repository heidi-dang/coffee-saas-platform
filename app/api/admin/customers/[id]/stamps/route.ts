import { requireCafeUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, handleAuthError, badRequest, notFound } from "@/lib/api/response";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCafeUser();
    const { id } = await params;
    const { amount } = await request.json();

    if (typeof amount !== "number") {
      return badRequest("Invalid amount field");
    }

    const profile = await db.loyaltyProfile.findUnique({
      where: { id, cafeId: user.cafeId },
    });

    if (!profile) {
      return notFound("Customer profile not found");
    }

    const newCount = Math.max(0, profile.stampsCount + amount);

    const updated = await db.loyaltyProfile.update({
      where: { id },
      data: { stampsCount: newCount },
    });

    return ok({ customer: updated });
  } catch (error: any) {
    return handleAuthError(error);
  }
}
