import { requireTableAccess } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, notFound, handleAuthError } from "@/lib/api/response";
import crypto from "node:crypto";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireTableAccess();
    const { id } = await params;
    const body = await request.json();

    const table = await db.cafeTable.findFirst({
      where: { id, cafeId: user.cafeId },
    });
    if (!table) {
      return notFound("Table not found");
    }

    const updateData: Record<string, unknown> = {};
    if (body.tableNumber !== undefined) updateData.tableNumber = body.tableNumber;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.regenerateQr) {
      updateData.qrToken = crypto.randomBytes(24).toString("hex");
    }

    const updated = await db.cafeTable.update({
      where: { id },
      data: updateData,
    });

    return ok({ table: updated });
  } catch (error: any) {
    return handleAuthError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireTableAccess();
    const { id } = await params;

    const table = await db.cafeTable.findFirst({
      where: { id, cafeId: user.cafeId },
    });
    if (!table) {
      return notFound("Table not found");
    }

    await db.cafeTable.update({
      where: { id },
      data: { isActive: false },
    });

    return ok({ success: true });
  } catch (error: any) {
    return handleAuthError(error);
  }
}
