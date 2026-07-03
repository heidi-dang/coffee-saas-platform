"use client";

import { useCart } from "./cart-provider";

export function CartSummary() {
  const { items, totalCents, itemCount } = useCart();

  if (items.length === 0) return null;

  return (
    <div className="border-t pt-4 mt-4 space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex justify-between text-sm">
          <span>
            {item.quantity}x {item.name}
          </span>
          <span className="font-medium">
            $
            {(
              (item.unitPriceCents +
                item.selectedOptions.reduce((s, o) => s + o.priceCents, 0)) *
              item.quantity /
              100
            ).toFixed(2)}
          </span>
        </div>
      ))}
      <div className="flex justify-between font-bold text-base pt-2 border-t">
        <span>Total ({itemCount} items)</span>
        <span>${(totalCents / 100).toFixed(2)}</span>
      </div>
    </div>
  );
}
