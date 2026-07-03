import { z } from "zod";
import { requireCafeOwnerOrManager } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, handleAuthError, badRequest, notFound } from "@/lib/api/response";

const stampSchema = z.object({
  amount: z
    .number()
    .int("Stamps amount must be an integer")
    .min(-50, "Stamps amount too low")
    .max(50, "Stamps amount too high"),
  reason: z.string().max(200).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCafeOwnerOrManager();
    const { id } = await params;

    const raw = await request.json();
    const parsed = stampSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest("Invalid stamp data", parsed.error.issues);
    }
    const { amount, reason } = parsed.data;

    const profile = await db.loyaltyProfile.findUnique({
      where: { id, cafeId: user.cafeId },
    });
    if (!profile) {
      return notFound("Customer profile not found");
    }

    const oldCount = profile.stampsCount;
    const newCount = Math.max(0, oldCount + amount);

    const updated = await db.loyaltyProfile.update({
      where: { id },
      data: { stampsCount: newCount },
    });

    console.log(
      `[audit] stamps_change cafeId=${user.cafeId} actorId=${user.id} customerId=${id} before=${oldCount} after=${newCount} delta=${amount} reason=${reason || "n/a"}`
    );

    return ok({
      customer: {
        id: updated.id,
        stampsCount: updated.stampsCount,
      },
    });
  } catch (error: any) {
    return handleAuthError(error);
  }
}
