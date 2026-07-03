import { db } from "@/lib/db";
import { validateAndPriceItem } from "./price-order";
import { validateItemOptions, validateDependencyRules } from "./validate-order-options";
import { resolveTable } from "./resolve-table";
import { getNextOrderNumber } from "./order-number";
import { findDuplicateOptionSelections } from "./validate-duplicates";
import type { CreateOrderInput, OrderItemData } from "./types";
import type { PaymentMethod } from "./create-order-schema";
import type { Result } from "@/lib/result";
import { success, failure } from "@/lib/result";

interface CreateOrderSuccess {
  orderId: string;
  orderNumber: number;
  status: string;
  paymentStatus: string;
  totalCents: number;
  items: { menuItemId: string; itemNameSnapshot: string; quantity: number; unitPriceCents: number; optionsSnapshot: any; notes: string | null }[];
}

export interface CreateOrderOptions {
  paymentMethod?: PaymentMethod;
}

export async function createOrder(
  input: CreateOrderInput,
  options: CreateOrderOptions = {}
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

  const paymentMethod: PaymentMethod = options.paymentMethod ?? "PAY_AT_COUNTER";
  if (paymentMethod === "PAY_AT_COUNTER" && settings && !settings.acceptPayAtCounter) {
    return failure("Pay at counter is currently disabled");
  }
  if (paymentMethod === "ONLINE" && settings && !settings.acceptOnlinePayment) {
    return failure("Online payment is currently disabled");
  }

  const tableResult = await resolveTable(
    cafe.id,
    input.tableToken,
    input.type,
    input.tableTimestamp,
    input.tableSignature
  );
  if (tableResult.error) return failure(tableResult.error);
  const tableId = tableResult.tableId;

  const menuItemIds = input.items.map((i) => i.menuItemId);
  const menuItems = await db.menuItem.findMany({
    where: { id: { in: menuItemIds }, cafeId: cafe.id },
    include: {
      options: { include: { values: true } },
      category: true,
    },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  const orderItemsData: OrderItemData[] = [];
  let subtotalCents = 0;

  for (const itemInput of input.items) {
    const menuItem = menuItemMap.get(itemInput.menuItemId);
    if (!menuItem) return failure(`Menu item ${itemInput.menuItemId} not found`);
    if (!menuItem.isAvailable) return failure(`${menuItem.name} is not available`);
    if (menuItem.stockQuantity !== null && menuItem.stockQuantity < itemInput.quantity) {
      return failure(`Sorry, ${menuItem.name} has sold out`);
    }

    const dupError = findDuplicateOptionSelections(itemInput.selectedOptions);
    if (dupError) return failure(dupError);

    const optError = validateItemOptions(menuItem.options, itemInput.selectedOptions);
    if (optError) return failure(optError);

    const depError = validateDependencyRules(itemInput.selectedOptions, menuItem.dependencyRulesJson);
    if (depError) return failure(depError);

    const priced = validateAndPriceItem(menuItem, itemInput);
    if (priced.error) return failure(priced.error);

    subtotalCents += priced.data.totalCents;
    orderItemsData.push(priced.data);
  }

  const paymentStatus = paymentMethod === "ONLINE" ? "PENDING" : "UNPAID";

  try {
    const order = await db.$transaction(async (tx) => {
      const orderNumber = await getNextOrderNumber(tx, cafe.id);

      // Decrement stock for items with tracked inventory
      for (const itemInput of input.items) {
        const menuItem = menuItemMap.get(itemInput.menuItemId)!;
        if (menuItem.stockQuantity !== null) {
          const newStock = menuItem.stockQuantity - itemInput.quantity;
          await tx.menuItem.update({
            where: { id: menuItem.id },
            data: {
              stockQuantity: Math.max(0, newStock),
              isAvailable: newStock > 0,
            },
          });
        }
      }

      // Loyalty stamp accrual for beverages
      if (input.customerPhone) {
        const beverageItemIds = Array.from(menuItemMap.values())
          .filter((item: any) => {
            const categoryName = item.category?.name?.toLowerCase() || "";
            const itemName = item.name.toLowerCase();
            return (
              categoryName.includes("coffee") ||
              categoryName.includes("beverage") ||
              categoryName.includes("drink") ||
              categoryName.includes("tea") ||
              categoryName.includes("latte") ||
              categoryName.includes("espresso") ||
              categoryName.includes("brew") ||
              itemName.includes("coffee") ||
              itemName.includes("tea") ||
              itemName.includes("latte") ||
              itemName.includes("cappuccino") ||
              itemName.includes("flat white") ||
              itemName.includes("espresso")
            );
          })
          .map((item) => item.id);

        let beverageCount = 0;
        for (const itemInput of input.items) {
          if (beverageItemIds.includes(itemInput.menuItemId)) {
            beverageCount += itemInput.quantity;
          }
        }

        if (beverageCount > 0) {
          const formattedPhone = input.customerPhone.trim();
          await tx.loyaltyProfile.upsert({
            where: {
              cafeId_phone: {
                cafeId: cafe.id,
                phone: formattedPhone,
              },
            },
            update: {
              stampsCount: { increment: beverageCount },
              name: input.customerName || undefined,
            },
            create: {
              cafeId: cafe.id,
              phone: formattedPhone,
              name: input.customerName || null,
              stampsCount: beverageCount,
            },
          });
        }
      }

      return tx.order.create({
        data: {
          cafeId: cafe.id,
          orderNumber,
          type: input.type,
          status: "NEW",
          paymentStatus,
          tableId,
          customerName: input.customerName || null,
          customerPhone: input.customerPhone || null,
          customerNote: input.customerNote || null,
          subtotalCents,
          totalCents: subtotalCents,
          items: { create: orderItemsData },
        },
        include: {
          items: true,
          table: { select: { tableNumber: true } },
        },
      });
    });

    // Publish the created event for real-time order sync
    const { publishOrderEvent } = await import("./order-events");
    publishOrderEvent({
      cafeId: cafe.id,
      type: "CREATED",
      order,
    });

    return success({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalCents: order.totalCents,
      items: orderItemsData.map((i) => ({
        menuItemId: i.menuItemId,
        itemNameSnapshot: i.itemNameSnapshot,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        optionsSnapshot: i.optionsSnapshot,
        notes: i.notes,
      })),
    });
  } catch (err) {
    console.error("Failed to create order:", err);
    return failure("Failed to create order due to an internal error.");
  }
}
