export const ORDER_STATUSES = ["NEW", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "CANCELLED"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function isValidStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

export function canTransition(from: OrderStatus, to: string): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to as OrderStatus);
}

export function getAllowedTransitions(status: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[status] ?? [];
}

export function getActiveStatuses(): OrderStatus[] {
  return ["NEW", "ACCEPTED", "PREPARING", "READY"];
}
