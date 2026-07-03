import { db } from "@/lib/db";
import { verifyTableSignature } from "@/lib/auth/table-token";

export async function resolveTable(
  cafeId: string,
  tableToken: string | undefined,
  type: string,
  tableTimestamp?: number,
  tableSignature?: string
): Promise<{ tableId: string | null; error?: string }> {
  if (type !== "DINE_IN") return { tableId: null };

  if (!tableToken) return { tableId: null };

  const table = await db.cafeTable.findUnique({
    where: { qrToken: tableToken, cafeId },
  });

  if (!table) return { tableId: null, error: "Invalid table" };
  if (!table.isActive) return { tableId: null, error: "This table is not available" };

  if (tableTimestamp && tableSignature) {
    const isValid = verifyTableSignature(cafeId, table.tableNumber, tableTimestamp, tableSignature);
    if (!isValid) {
      return { tableId: null, error: "Table QR link has expired or is invalid. Please scan again." };
    }
  }

  return { tableId: table.id };
}
