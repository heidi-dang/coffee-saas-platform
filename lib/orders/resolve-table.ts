import { db } from "@/lib/db";

export async function resolveTable(
  cafeId: string,
  tableToken: string | undefined,
  type: string
): Promise<{ tableId: string | null; error?: string }> {
  if (type !== "DINE_IN") return { tableId: null };

  if (!tableToken) return { tableId: null };

  const table = await db.cafeTable.findUnique({
    where: { qrToken: tableToken, cafeId },
  });

  if (!table) return { tableId: null, error: "Invalid table" };
  if (!table.isActive) return { tableId: null, error: "This table is not available" };

  return { tableId: table.id };
}
