import { requireCafeUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, handleAuthError } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const user = await requireCafeUser();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const cutoff = new Date();
    if (period === "7d") cutoff.setDate(cutoff.getDate() - 7);
    else if (period === "90d") cutoff.setDate(cutoff.getDate() - 90);
    else cutoff.setDate(cutoff.getDate() - 30);

    const feedbacks = await db.orderFeedback.findMany({
      where: {
        order: { cafeId: user.cafeId },
        createdAt: { gte: cutoff },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            type: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = feedbacks.length;
    const avgRating =
      total > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / total
        : 0;

    const distribution = [1, 2, 3, 4, 5].map((r) => ({
      rating: r,
      count: feedbacks.filter((f) => f.rating === r).length,
    }));

    return ok({ feedbacks, summary: { total, avgRating, distribution } });
  } catch (error: any) {
    return handleAuthError(error);
  }
}
