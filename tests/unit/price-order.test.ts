import { describe, expect, it } from "vitest";
import { validateAndPriceItem } from "@/lib/orders/price-order";

function makeMenuItem(overrides: any = {}) {
  return {
    id: "item-1",
    cafeId: "cafe-1",
    categoryId: "cat-1",
    name: "Flat White",
    description: null,
    imageUrl: null,
    priceCents: 550,
    isAvailable: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    options: [
      {
        id: "opt-1",
        menuItemId: "item-1",
        name: "Size",
        type: "SINGLE" as const,
        required: true,
        minSelect: 1,
        maxSelect: 1,
        values: [
          { id: "val-1", optionId: "opt-1", name: "Small", priceCents: 0, sortOrder: 1 },
          { id: "val-2", optionId: "opt-1", name: "Medium", priceCents: 100, sortOrder: 2 },
          { id: "val-3", optionId: "opt-1", name: "Large", priceCents: 200, sortOrder: 3 },
        ],
      },
      {
        id: "opt-2",
        menuItemId: "item-1",
        name: "Extras",
        type: "MULTIPLE" as const,
        required: false,
        minSelect: 0,
        maxSelect: 2,
        values: [
          { id: "val-4", optionId: "opt-2", name: "Extra Shot", priceCents: 100, sortOrder: 1 },
          { id: "val-5", optionId: "opt-2", name: "Vanilla Syrup", priceCents: 80, sortOrder: 2 },
        ],
      },
    ],
    ...overrides,
  };
}

describe("validateAndPriceItem", () => {
  it("prices base item without options", () => {
    const item = makeMenuItem({ options: [] });
    const result = validateAndPriceItem(item, {
      menuItemId: "item-1",
      quantity: 1,
      selectedOptions: [],
    });
    expect(result.data.unitPriceCents).toBe(550);
    expect(result.data.totalCents).toBe(550);
    expect(result.data.optionsSnapshot).toEqual([]);
  });

  it("adds option prices to base price", () => {
    const item = makeMenuItem();
    const result = validateAndPriceItem(item, {
      menuItemId: "item-1",
      quantity: 1,
      selectedOptions: [
        { optionId: "opt-1", valueId: "val-2" }, // Medium +100
        { optionId: "opt-2", valueId: "val-4" }, // Extra Shot +100
      ],
    });
    // 550 + 100 + 100 = 750
    expect(result.data.unitPriceCents).toBe(750);
    expect(result.data.totalCents).toBe(750);
  });

  it("calculates total for multiple quantity", () => {
    const item = makeMenuItem();
    const result = validateAndPriceItem(item, {
      menuItemId: "item-1",
      quantity: 2,
      selectedOptions: [
        { optionId: "opt-1", valueId: "val-3" }, // Large +200
      ],
    });
    // (550 + 200) * 2 = 1500
    expect(result.data.unitPriceCents).toBe(750);
    expect(result.data.totalCents).toBe(1500);
  });

  it("returns error for unknown option", () => {
    const item = makeMenuItem();
    const result = validateAndPriceItem(item, {
      menuItemId: "item-1",
      quantity: 1,
      selectedOptions: [
        { optionId: "nonexistent", valueId: "val-1" },
      ],
    });
    expect(result.error).toBe("Option nonexistent not found for Flat White");
  });

  it("returns error for unknown option value", () => {
    const item = makeMenuItem();
    const result = validateAndPriceItem(item, {
      menuItemId: "item-1",
      quantity: 1,
      selectedOptions: [
        { optionId: "opt-1", valueId: "nonexistent" },
      ],
    });
    expect(result.error).toBe("Option value nonexistent not found");
  });
});
