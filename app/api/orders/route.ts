import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createOrderSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { cafeSlug, tableToken, type, customerName, customerPhone, customerNote, items } =
      parsed.data;

    const cafe = await db.cafe.findUnique({ where: { slug: cafeSlug } });
    if (!cafe) {
      return NextResponse.json({ error: "Cafe not found" }, { status: 404 });
    }
    if (!cafe.isActive) {
      return NextResponse.json(
        { error: "Ordering unavailable" },
        { status: 400 }
      );
    }

    let tableId: string | null = null;
    if (type === "DINE_IN") {
      if (tableToken) {
        const table = await db.cafeTable.findUnique({
          where: { qrToken: tableToken, cafeId: cafe.id },
        });
        if (!table) {
          return NextResponse.json(
            { error: "Invalid table" },
            { status: 400 }
          );
        }
        if (!table.isActive) {
          return NextResponse.json(
            { error: "This table is not available" },
            { status: 400 }
          );
        }
        tableId = table.id;
      }
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds }, cafeId: cafe.id },
      include: {
        options: { include: { values: true } },
      },
    });

    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    let subtotalCents = 0;
    const orderItemsData: {
      menuItemId: string;
      itemNameSnapshot: string;
      quantity: number;
      unitPriceCents: number;
      totalCents: number;
      optionsSnapshot: { optionId: string; optionName: string; valueId: string; valueName: string; priceCents: number }[];
      notes: string | null;
    }[] = [];

    for (const itemInput of items) {
      const menuItem = menuItemMap.get(itemInput.menuItemId);
      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item ${itemInput.menuItemId} not found` },
          { status: 400 }
        );
      }
      if (!menuItem.isAvailable) {
        return NextResponse.json(
          { error: `${menuItem.name} is not available` },
          { status: 400 }
        );
      }

      let itemPriceCents = menuItem.priceCents;
      const optionsSnapshot: {
        optionId: string;
        optionName: string;
        valueId: string;
        valueName: string;
        priceCents: number;
      }[] = [];

      for (const selectedOpt of itemInput.selectedOptions) {
        const optDef = menuItem.options.find((o) => o.id === selectedOpt.optionId);
        if (!optDef) {
          return NextResponse.json(
            { error: `Option ${selectedOpt.optionId} not found for ${menuItem.name}` },
            { status: 400 }
          );
        }
        const valueDef = optDef.values.find(
          (v) => v.id === selectedOpt.valueId
        );
        if (!valueDef) {
          return NextResponse.json(
            { error: `Option value ${selectedOpt.valueId} not found` },
            { status: 400 }
          );
        }
        itemPriceCents += valueDef.priceCents;
        optionsSnapshot.push({
          optionId: optDef.id,
          optionName: optDef.name,
          valueId: valueDef.id,
          valueName: valueDef.name,
          priceCents: valueDef.priceCents,
        });
      }

      const lineTotalCents = itemPriceCents * itemInput.quantity;
      subtotalCents += lineTotalCents;

      orderItemsData.push({
        menuItemId: menuItem.id,
        itemNameSnapshot: menuItem.name,
        quantity: itemInput.quantity,
        unitPriceCents: itemPriceCents,
        totalCents: lineTotalCents,
        optionsSnapshot,
        notes: itemInput.notes || null,
      });
    }

    const order = await db.$transaction(async (tx) => {
      const latestOrder = await tx.order.findFirst({
        where: { cafeId: cafe.id },
        orderBy: { orderNumber: "desc" },
        select: { orderNumber: true },
      });

      const orderNumber = (latestOrder?.orderNumber ?? 0) + 1;

      return tx.order.create({
        data: {
          cafeId: cafe.id,
          orderNumber,
          type,
          status: "NEW",
          paymentStatus: "UNPAID",
          tableId,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          customerNote: customerNote || null,
          subtotalCents,
          totalCents: subtotalCents,
          items: {
            create: orderItemsData,
          },
        },
      });
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalCents: order.totalCents,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
