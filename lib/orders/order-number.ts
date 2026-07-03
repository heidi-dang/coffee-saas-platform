type TransactionClient = {
  order: {
    findFirst: (args: {
      where: { cafeId: string };
      orderBy: { orderNumber: "desc" };
      select: { orderNumber: true };
    }) => Promise<{ orderNumber: number } | null>;
  };
};

export async function getNextOrderNumber(
  tx: TransactionClient,
  cafeId: string
): Promise<number> {
  const latestOrder = await tx.order.findFirst({
    where: { cafeId },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  return (latestOrder?.orderNumber ?? 0) + 1;
}
