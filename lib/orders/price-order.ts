import type { OrderItemInput, OrderItemData } from "./types";

interface OptionValue {
  id: string;
  name: string;
  priceCents: number;
  sortOrder: number;
}

interface OptionDef {
  id: string;
  name: string;
  type: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  values: OptionValue[];
}

interface FullMenuItem {
  id: string;
  cafeId: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  options: OptionDef[];
}

export function validateAndPriceItem(
  menuItem: FullMenuItem,
  input: OrderItemInput
): { data: OrderItemData; error?: string } {
  let itemPriceCents = menuItem.priceCents;
  const optionsSnapshot: OrderItemData["optionsSnapshot"] = [];

  for (const selectedOpt of input.selectedOptions) {
    const optDef = menuItem.options.find((o) => o.id === selectedOpt.optionId);
    if (!optDef) {
      return { data: null as any, error: `Option ${selectedOpt.optionId} not found for ${menuItem.name}` };
    }
    const valueDef = optDef.values.find((v) => v.id === selectedOpt.valueId);
    if (!valueDef) {
      return { data: null as any, error: `Option value ${selectedOpt.valueId} not found` };
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

  const lineTotalCents = itemPriceCents * input.quantity;

  return {
    data: {
      menuItemId: menuItem.id,
      itemNameSnapshot: menuItem.name,
      quantity: input.quantity,
      unitPriceCents: itemPriceCents,
      totalCents: lineTotalCents,
      optionsSnapshot,
      notes: input.notes || null,
    },
  };
}
