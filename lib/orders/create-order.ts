import { db } from "@/lib/db";
import { validateAndPriceItem } from "./price-order";
import { validateItemOptions } from "./validate-order-options";
import { resolveTable } from "./resolve-table";
import { getNextOrderNumber } from "./order-number";
import { findDuplicateOptionSelections } from "./validate-duplicates";
import type { CreateOrderInput, OrderItemData } from "./types";
import type { Result } from "@/lib/result";
import { success, failure } from "@/lib/result";

interface CreateOrderSuccess {
  orderId: string;
  orderNumber: number;
  status: string;
  paymentStatus: string;
  totalCents: number;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<Result<CreateOrderSuccess>> {
  const cafe = await db.cafe.findUnique({
    where: { slug: input.cafeSlug },
    include: { settings: true },
  });
  if (!cafe) return failure("Cafe not found");
  if (!cafe.isActive) return failure("Ordering unavailable");

  const settings = cafe.settings;
  if (input.type === "DINE_IN" && settings && !settings.acceptDineIn) {
    return failure("Dine-in ordering is currently disabled");
  }
  if (input.type === "TAKEAWAY" && settings && !settings.acceptTakeaway) {
    return failure("Takeaway ordering is currently disabled");
  }
  if (input.type === "PICKUP" && settings && !settings.acceptPickup) {
    return failure("Pickup ordering is currently disabled");
  }

  const tableResult = await resolveTable(cafe.id, input.tableToken, input.type);
  if (tableResult.error) return failure(tableResult.error);
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
    if (!menuItem) return failure(`Menu item ${itemInput.menuItemId} not found`);
    if (!menuItem.isAvailable) return failure(`${menuItem.name} is not available`);

    const dupError = findDuplicateOptionSelections(itemInput.selectedOptions);
    if (dupError) return failure(dupError);

    const optError = validateItemOptions(menuItem.options, itemInput.selectedOptions);
    if (optError) return failure(optError);

    const priced = validateAndPriceItem(menuItem, itemInput);
    if (priced.error) return failure(priced.error);

    subtotalCents += priced.data.totalCents;
    orderItemsData.push(priced.data);
  }

  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const order = await db.$transaction(async (tx) => {
        const orderNumber = await getNextOrderNumber(tx, cafe.id);

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

      return success({
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalCents: order.totalCents,
      });
    } catch (err: any) {
      const isUniqueConflict =
        err?.code === "P2002" &&
        err?.meta?.target?.includes("orderNumber");

      if (isUniqueConflict && attempt < MAX_RETRIES - 1) {
        continue;
      }
      throw err;
    }
  }

  return failure("Failed to create order due to a conflict. Please try again.");
}
