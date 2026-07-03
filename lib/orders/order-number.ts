import { db } from "@/lib/db";

export async function getNextOrderNumber(cafeId: string): Promise<number> {
  const latestOrder = await db.order.findFirst({
    where: { cafeId },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  return (latestOrder?.orderNumber ?? 0) + 1;
}
