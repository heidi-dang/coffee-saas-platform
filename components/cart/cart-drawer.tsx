"use client";

import { useCart } from "./cart-provider";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus } from "lucide-react";
import Link from "next/link";

interface CartDrawerProps {
  cafeSlug: string;
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ cafeSlug, open, onClose }: CartDrawerProps) {
  const { items, totalCents, updateQuantity, removeItem } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-md bg-background h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Your cart is empty
            </p>
          )}
          {items.map((item) => {
            const optionsPrice = item.selectedOptions.reduce(
              (s, o) => s + o.priceCents,
              0
            );
            const lineTotal =
              ((item.unitPriceCents + optionsPrice) * item.quantity) / 100;
            return (
              <div key={item.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.selectedOptions.map((o) => o.valueName).join(", ")}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-medium text-sm">
                    ${lineTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${(totalCents / 100).toFixed(2)}</span>
            </div>
            <Link href={`/cafe/${cafeSlug}/order/checkout`}>
              <Button className="w-full" size="lg" onClick={onClose}>
                Go to Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
