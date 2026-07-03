import type { PrismaClient } from "@/lib/generated/prisma/client";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$extends">;

export async function getNextOrderNumber(
  tx: TransactionClient,
  cafeId: string
): Promise<number> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${cafeId}))`;

  const latestOrder = await tx.order.findFirst({
    where: { cafeId },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  return (latestOrder?.orderNumber ?? 0) + 1;
}
