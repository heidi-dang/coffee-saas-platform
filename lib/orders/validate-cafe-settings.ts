export function validateOrderType(
  type: string,
  settings: {
    acceptDineIn: boolean;
    acceptTakeaway: boolean;
    acceptPickup: boolean;
  }
): string | null {
  if (type === "DINE_IN" && !settings.acceptDineIn) {
    return "Dine-in ordering is currently disabled";
  }
  if (type === "TAKEAWAY" && !settings.acceptTakeaway) {
    return "Takeaway ordering is currently disabled";
  }
  if (type === "PICKUP" && !settings.acceptPickup) {
    return "Pickup ordering is currently disabled";
  }
  return null;
}
