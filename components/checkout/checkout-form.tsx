"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/components/cart/cart-provider";
import { CartSummary } from "@/components/cart/cart-summary";

interface CheckoutFormProps {
  cafeSlug: string;
  tableToken?: string;
  settings: {
    acceptDineIn: boolean;
    acceptTakeaway: boolean;
    acceptPickup: boolean;
    acceptPayAtCounter: boolean;
    acceptOnlinePayment: boolean;
  };
}

export function CheckoutForm({
  cafeSlug,
  tableToken,
  settings,
}: CheckoutFormProps) {
  const router = useRouter();
  const { items, totalCents, clearCart } = useCart();
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY" | "PICKUP">(
    tableToken ? "DINE_IN" : "TAKEAWAY"
  );
  const [paymentMethod, setPaymentMethod] = useState<"PAY_AT_COUNTER" | "ONLINE">(
    settings.acceptPayAtCounter ? "PAY_AT_COUNTER" : "ONLINE"
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button onClick={() => router.push(`/cafe/${cafeSlug}/order`)}>
          Back to Menu
        </Button>
      </div>
    );
  }

  const showPayAtCounter = settings.acceptPayAtCounter;
  const showOnlinePayment = settings.acceptOnlinePayment;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (paymentMethod === "ONLINE") {
        const res = await fetch(`/api/cafes/${cafeSlug}/checkout/stripe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cafeSlug,
            tableToken: tableToken || undefined,
            type: orderType,
            paymentMethod: "ONLINE",
            customerName: customerName || undefined,
            customerPhone: customerPhone || undefined,
            customerNote: customerNote || undefined,
            items: items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              selectedOptions: item.selectedOptions.map((o) => ({
                optionId: o.optionId,
                valueId: o.valueId,
              })),
              notes: item.notes,
            })),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to start payment");
          return;
        }

        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }

        setError("No checkout URL received");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeSlug,
          tableToken: tableToken || undefined,
          type: orderType,
          paymentMethod: "PAY_AT_COUNTER",
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          customerNote: customerNote || undefined,
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions.map((o) => ({
              optionId: o.optionId,
              valueId: o.valueId,
            })),
            notes: item.notes,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to place order");
        return;
      }

      clearCart();
      router.push(`/cafe/${cafeSlug}/order/success?orderId=${data.orderId}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Order Type</Label>
        <RadioGroup
          value={orderType}
          onValueChange={(v) => setOrderType(v as typeof orderType)}
          className="mt-2 space-y-2"
        >
          {settings.acceptDineIn && (
            <div className="flex items-center gap-3 border rounded-lg p-3">
              <RadioGroupItem
                value="DINE_IN"
                id="dine-in"
                disabled={!!tableToken}
              />
              <Label htmlFor="dine-in" className="font-normal">
                Dine-in
                {tableToken && " (table selected)"}
              </Label>
            </div>
          )}
          {settings.acceptTakeaway && (
            <div className="flex items-center gap-3 border rounded-lg p-3">
              <RadioGroupItem value="TAKEAWAY" id="takeaway" />
              <Label htmlFor="takeaway" className="font-normal">
                Takeaway
              </Label>
            </div>
          )}
          {settings.acceptPickup && (
            <div className="flex items-center gap-3 border rounded-lg p-3">
              <RadioGroupItem value="PICKUP" id="pickup" />
              <Label htmlFor="pickup" className="font-normal">
                Pickup
              </Label>
            </div>
          )}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="name">Name (optional)</Label>
          <Input
            id="name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="0412 345 678"
          />
        </div>
        <div>
          <Label htmlFor="note">Order Note (optional)</Label>
          <Textarea
            id="note"
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Any notes for the kitchen..."
            rows={2}
          />
        </div>
      </div>

      {tableToken && (
        <input type="hidden" name="tableToken" value={tableToken} />
      )}

      {settings.acceptPayAtCounter && (
        <div className="border rounded-lg p-3">
          <p className="font-medium">Payment Method</p>
          <p className="text-sm text-muted-foreground">Pay at counter</p>
        </div>
      )}

      {(showPayAtCounter || showOnlinePayment) && (
        <div>
          <Label className="text-base font-semibold">Payment Method</Label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
            className="mt-2 space-y-2"
          >
            {showPayAtCounter && (
              <div className="flex items-center gap-3 border rounded-lg p-3">
                <RadioGroupItem value="PAY_AT_COUNTER" id="pay-counter" />
                <Label htmlFor="pay-counter" className="font-normal">
                  Pay at counter
                </Label>
              </div>
            )}
            {showOnlinePayment && (
              <div className="flex items-center gap-3 border rounded-lg p-3">
                <RadioGroupItem value="ONLINE" id="pay-online" />
                <Label htmlFor="pay-online" className="font-normal">
                  Pay online (card)
                </Label>
              </div>
            )}
          </RadioGroup>
        </div>
      )}

      <CartSummary />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={submitting}
      >
        {submitting
          ? "Processing..."
          : paymentMethod === "ONLINE"
            ? `Pay $${(totalCents / 100).toFixed(2)}`
            : `Place Order — $${(totalCents / 100).toFixed(2)}`}
      </Button>
    </form>
  );
}
