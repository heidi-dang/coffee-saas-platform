"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchOrders, updateOrderStatus } from "@/lib/api/admin-orders-client";
import type { Order } from "@/lib/api/admin-orders-client";
import { getAllowedTransitions } from "@/lib/orders/status-machine";
import type { OrderStatus } from "@/lib/orders/status-machine";

const statusLanes = ["NEW", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

const statusColors: Record<string, string> = {
  NEW: "border-blue-400",
  ACCEPTED: "border-yellow-400",
  PREPARING: "border-orange-400",
  READY: "border-green-400",
  COMPLETED: "border-gray-400",
  CANCELLED: "border-red-400",
};

function OrderCard({
  order,
  error,
  updating,
  onUpdate,
}: {
  order: Order;
  error: string | null;
  updating: boolean;
  onUpdate: (newStatus: string) => void;
}) {
  const created = new Date(order.createdAt);
  const timeStr = created.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const allowedActions = getAllowedTransitions((order.status as OrderStatus));

  return (
    <div
      className={`border-l-4 ${statusColors[order.status] || "border-gray-300"} bg-background rounded-lg p-3 shadow-sm space-y-2`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold">#{order.orderNumber}</p>
          <p className="text-xs text-muted-foreground">{timeStr}</p>
        </div>
        <span className="text-xs capitalize px-2 py-0.5 rounded bg-muted">
          {order.type.toLowerCase().replace("_", " ")}
        </span>
      </div>

      {order.table && (
        <p className="text-xs text-muted-foreground">
          Table: {order.table.tableNumber}
        </p>
      )}
      {order.customerName && (
        <p className="text-xs text-muted-foreground">{order.customerName}</p>
      )}

      <div className="space-y-1">
        {order.items.map((item) => (
          <div key={item.id} className="text-sm">
            <p>
              <span className="font-medium">{item.quantity}x</span>{" "}
              {item.itemNameSnapshot}
            </p>
            {item.optionsSnapshot && item.optionsSnapshot.length > 0 && (
              <p className="text-xs text-muted-foreground ml-3">
                {(item.optionsSnapshot as Array<{ valueName: string }>).map((o) => o.valueName).join(", ")}
              </p>
            )}
            {item.notes && (
              <p className="text-xs italic text-muted-foreground ml-3">
                Note: {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {order.customerNote && (
        <p className="text-xs italic text-muted-foreground">
          Customer note: {order.customerNote}
        </p>
      )}

      <div className="flex justify-between items-center pt-1">
        <span className="font-bold text-sm">
          ${(order.totalCents / 100).toFixed(2)}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            order.paymentStatus === "PAID"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {order.paymentStatus === "UNPAID" ? "Pay at counter" : order.paymentStatus.toLowerCase()}
        </span>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">{error}</p>
      )}

      {allowedActions.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1 border-t">
          {allowedActions.map((action) => (
            <button
              key={action}
              onClick={() => onUpdate(action)}
              disabled={updating}
              className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "..." : action === "CANCELLED"
                ? "Cancel"
                : action.charAt(0) + action.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchOrders(true);
      setOrders(data.orders);
    } catch {
      // polling errors silently ignored
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const eventSource = new EventSource("/api/admin/orders/stream");

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "CREATED") {
          setOrders((prev) => {
            if (prev.some((o) => o.id === payload.order.id)) return prev;
            return [payload.order, ...prev];
          });
        } else if (payload.type === "UPDATED") {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.order.id ? payload.order : o))
          );
        }
      } catch (err) {
        console.error("Error processing order update:", err);
      }
    };

    eventSource.onerror = () => {
      // Re-fetch data on error/disconnect to ensure state consistency
      fetchData();
    };

    return () => {
      eventSource.close();
    };
  }, [fetchData]);

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    setErrors((prev) => ({ ...prev, [orderId]: "" }));
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchData();
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        [orderId]: err?.message || "Failed to update order. Please try again.",
      }));
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  const grouped = statusLanes.reduce(
    (acc, status) => {
      acc[status] = orders.filter((o) => o.status === status);
      return acc;
    },
    {} as Record<string, Order[]>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statusLanes.map((status) => (
            <div key={status}>
              <h2 className="font-semibold text-sm mb-3 uppercase tracking-wide text-muted-foreground">
                {status === "CANCELLED" ? "Cancelled" : status.charAt(0) + status.slice(1).toLowerCase()}
                <span className="ml-1 text-xs font-normal">
                  ({grouped[status].length})
                </span>
              </h2>
              <div className="space-y-3">
                {grouped[status].map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    error={errors[order.id] ?? null}
                    updating={!!updating[order.id]}
                    onUpdate={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
