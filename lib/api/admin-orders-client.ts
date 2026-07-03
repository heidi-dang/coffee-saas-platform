import { apiFetch } from "./client";

export interface OrderItem {
  id: string;
  itemNameSnapshot: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  optionsSnapshot: Record<string, any>[] | null;
  notes: string | null;
}

export interface Order {
  id: string;
  orderNumber: number;
  type: string;
  status: string;
  paymentStatus: string;
  customerName: string | null;
  customerNote: string | null;
  totalCents: number;
  createdAt: string;
  table: { tableNumber: string } | null;
  items: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
}

export async function fetchOrders(
  activeOnly = true
): Promise<OrdersResponse> {
  const params = activeOnly ? "?activeOnly=true" : "";
  return apiFetch<OrdersResponse>(`/api/admin/orders${params}`);
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ order: Order }> {
  return apiFetch<{ order: Order }>(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
