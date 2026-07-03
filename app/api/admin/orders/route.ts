import { requireCafeUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, unauthorized, serverError } from "@/lib/api/response";
import { getActiveStatuses } from "@/lib/orders/status-machine";

export async function GET(request: Request) {
  try {
    const user = await requireCafeUser();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const activeOnly = searchParams.get("activeOnly") === "true";

    const where: any = { cafeId: user.cafeId };
    if (status) where.status = status;
    if (activeOnly) {
      where.status = { in: getActiveStatuses() };
    }

    const orders = await db.order.findMany({
      where,
      include: {
        items: true,
        table: { select: { tableNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ orders });
  } catch (error: any) {
    if (error.name === "AuthError") {
      return unauthorized(error.message);
    }
    return serverError(error);
  }
}
