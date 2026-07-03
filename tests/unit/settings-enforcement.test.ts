import { describe, expect, it } from "vitest";
import { validateOrderType } from "@/lib/orders/validate-cafe-settings";

describe("Cafe settings enforcement", () => {
  const allEnabled = { acceptDineIn: true, acceptTakeaway: true, acceptPickup: true };
  const dineInDisabled = { acceptDineIn: false, acceptTakeaway: true, acceptPickup: true };
  const allDisabled = { acceptDineIn: false, acceptTakeaway: false, acceptPickup: false };

  it("allows DINE_IN when enabled", () => {
    expect(validateOrderType("DINE_IN", allEnabled)).toBeNull();
  });

  it("blocks DINE_IN when disabled", () => {
    expect(validateOrderType("DINE_IN", dineInDisabled)).toBe(
      "Dine-in ordering is currently disabled"
    );
  });

  it("allows TAKEAWAY when enabled", () => {
    expect(validateOrderType("TAKEAWAY", allEnabled)).toBeNull();
  });

  it("blocks all types when all disabled", () => {
    expect(validateOrderType("DINE_IN", allDisabled)).toBeTruthy();
    expect(validateOrderType("TAKEAWAY", allDisabled)).toBeTruthy();
    expect(validateOrderType("PICKUP", allDisabled)).toBeTruthy();
  });
});
