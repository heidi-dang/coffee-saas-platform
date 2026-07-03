import { requireCafeUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, badRequest, notFound, handleAuthError } from "@/lib/api/response";
import { canTransition, isValidStatus } from "@/lib/orders/status-machine";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCafeUser();
    const { id } = await params;
    const { status: newStatus } = await request.json();

    if (!newStatus) {
      return badRequest("Status is required");
    }

    if (!isValidStatus(newStatus)) {
      return badRequest("Invalid status");
    }

    const order = await db.order.findUnique({
      where: { id, cafeId: user.cafeId },
    });

    if (!order) {
      return notFound("Order not found");
    }

    if (!canTransition(order.status as any, newStatus)) {
      return badRequest(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    const updated = await db.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        items: true,
        table: { select: { tableNumber: true } },
      },
    });

    const { publishOrderEvent } = await import("@/lib/orders/order-events");
    publishOrderEvent({
      cafeId: user.cafeId,
      type: "UPDATED",
      order: updated,
    });

    return ok({ order: updated });
  } catch (error: any) {
    return handleAuthError(error);
  }
}
