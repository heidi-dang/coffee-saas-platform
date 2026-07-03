import { describe, expect, it } from "vitest";
import { validateItemOptions } from "@/lib/orders/validate-order-options";

function makeOption(overrides: any = {}) {
  return {
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
    ],
    ...overrides,
  };
}

describe("validateItemOptions", () => {
  it("passes when required option is selected", () => {
    const result = validateItemOptions([makeOption()], [
      { optionId: "opt-1", valueId: "val-1" },
    ]);
    expect(result).toBeNull();
  });

  it("fails when required option is missing", () => {
    const result = validateItemOptions([makeOption()], []);
    expect(result).toBe("Size requires at least 1 selection(s)");
  });

  it("fails when required option has too few selections", () => {
    const result = validateItemOptions(
      [makeOption({ minSelect: 2, maxSelect: 3 })],
      [{ optionId: "opt-1", valueId: "val-1" }]
    );
    expect(result).toBe("Size requires at least 2 selection(s)");
  });

  it("fails when max select is exceeded", () => {
    const result = validateItemOptions(
      [makeOption({ type: "MULTIPLE", maxSelect: 1, required: false })],
      [
        { optionId: "opt-1", valueId: "val-1" },
        { optionId: "opt-1", valueId: "val-2" },
      ]
    );
    expect(result).toBe("Size allows at most 1 selection(s)");
  });

  it("passes for optional skipped option", () => {
    const result = validateItemOptions(
      [makeOption({ required: false })],
      []
    );
    expect(result).toBeNull();
  });

  it("passes with no options defined", () => {
    const result = validateItemOptions([], []);
    expect(result).toBeNull();
  });
});
