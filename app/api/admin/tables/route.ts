import { requireTableAccess } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, unauthorized, badRequest, serverError } from "@/lib/api/response";
import crypto from "node:crypto";

function generateQrToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export async function GET() {
  try {
    const user = await requireTableAccess();

    const [tables, cafe] = await Promise.all([
      db.cafeTable.findMany({
        where: { cafeId: user.cafeId },
        orderBy: { tableNumber: "asc" },
      }),
      db.cafe.findUnique({
        where: { id: user.cafeId },
        select: { slug: true },
      }),
    ]);

    return ok({ tables, cafeSlug: cafe?.slug || "" });
  } catch (error: any) {
    if (error.name === "AuthError") {
      return unauthorized(error.message);
    }
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireTableAccess();

    const { tableNumber } = await request.json();
    if (!tableNumber) {
      return badRequest("Table number is required");
    }

    const table = await db.cafeTable.create({
      data: {
        cafeId: user.cafeId,
        tableNumber,
        qrToken: generateQrToken(),
      },
    });

    return ok({ table });
  } catch (error: any) {
    if (error.name === "AuthError") {
      return unauthorized(error.message);
    }
    return serverError(error);
  }
}
