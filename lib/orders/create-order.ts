import { db } from "@/lib/db";
import { validateAndPriceItem } from "./price-order";
import { validateItemOptions } from "./validate-order-options";
import { resolveTable } from "./resolve-table";
import { getNextOrderNumber } from "./order-number";
import type { CreateOrderInput } from "./types";
import type { OrderItemData } from "./types";

interface CreateOrderResult {
  orderId: string;
  orderNumber: number;
  status: string;
  paymentStatus: string;
  totalCents: number;
  error?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const cafe = await db.cafe.findUnique({
    where: { slug: input.cafeSlug },
    include: { settings: true },
  });
  if (!cafe) return { error: "Cafe not found" } as any;
  if (!cafe.isActive) return { error: "Ordering unavailable" } as any;

  const settings = cafe.settings;
  if (input.type === "DINE_IN" && settings && !settings.acceptDineIn) {
    return { error: "Dine-in ordering is currently disabled" } as any;
  }
  if (input.type === "TAKEAWAY" && settings && !settings.acceptTakeaway) {
    return { error: "Takeaway ordering is currently disabled" } as any;
  }
  if (input.type === "PICKUP" && settings && !settings.acceptPickup) {
    return { error: "Pickup ordering is currently disabled" } as any;
  }

  const tableResult = await resolveTable(cafe.id, input.tableToken, input.type);
  if (tableResult.error) return { error: tableResult.error } as any;
  const tableId = tableResult.tableId;

  const menuItemIds = input.items.map((i) => i.menuItemId);
  const menuItems = await db.menuItem.findMany({
    where: { id: { in: menuItemIds }, cafeId: cafe.id },
    include: { options: { include: { values: true } } },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  const orderItemsData: OrderItemData[] = [];
  let subtotalCents = 0;

  for (const itemInput of input.items) {
    const menuItem = menuItemMap.get(itemInput.menuItemId);
    if (!menuItem) return { error: `Menu item ${itemInput.menuItemId} not found` } as any;
    if (!menuItem.isAvailable) return { error: `${menuItem.name} is not available` } as any;

    const optError = validateItemOptions(menuItem.options, itemInput.selectedOptions);
    if (optError) return { error: optError } as any;

    const priced = validateAndPriceItem(menuItem, itemInput);
    if (priced.error) return { error: priced.error } as any;

    subtotalCents += priced.data.totalCents;
    orderItemsData.push(priced.data);
  }

  const order = await db.$transaction(async (tx) => {
    const orderNumber = await getNextOrderNumber(cafe.id);

    return tx.order.create({
      data: {
        cafeId: cafe.id,
        orderNumber,
        type: input.type,
        status: "NEW",
        paymentStatus: "UNPAID",
        tableId,
        customerName: input.customerName || null,
        customerPhone: input.customerPhone || null,
        customerNote: input.customerNote || null,
        subtotalCents,
        totalCents: subtotalCents,
        items: { create: orderItemsData },
      },
    });
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalCents: order.totalCents,
  };
}
