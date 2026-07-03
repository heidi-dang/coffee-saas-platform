import type { PrismaClient } from "@/lib/generated/prisma/client";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$extends">;

export async function getNextOrderNumber(
  tx: TransactionClient,
  cafeId: string
): Promise<number> {
  const key = BigInt(hashCode(cafeId));
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${key})`;

  const latestOrder = await tx.order.findFirst({
    where: { cafeId },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  return (latestOrder?.orderNumber ?? 0) + 1;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}
