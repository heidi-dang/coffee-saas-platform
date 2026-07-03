import type { z } from "zod/v4";
import type { createOrderSchema } from "./create-order-schema";

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export interface OrderItemInput {
  menuItemId: string;
  quantity: number;
  selectedOptions: { optionId: string; valueId: string }[];
  notes?: string;
}

export interface OrderItemData {
  menuItemId: string;
  itemNameSnapshot: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  optionsSnapshot: {
    optionId: string;
    optionName: string;
    valueId: string;
    valueName: string;
    priceCents: number;
  }[];
  notes: string | null;
}

export interface PricedOrder {
  items: OrderItemData[];
  subtotalCents: number;
}

export interface ResolvedTable {
  id: string;
}
