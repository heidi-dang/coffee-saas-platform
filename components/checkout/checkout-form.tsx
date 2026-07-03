"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/components/cart/cart-provider";
import { CartSummary } from "@/components/cart/cart-summary";
import { CheckCircle, AlertCircle, User } from "lucide-react";

interface CustomerSession {
  id: string;
  email: string;
  name: string | null;
  isVerified: boolean;
}

interface CheckoutFormProps {
  cafeSlug: string;
  tableToken?: string;
  tableTimestamp?: number;
  tableSignature?: string;
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
  tableTimestamp,
  tableSignature,
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
  const [customer, setCustomer] = useState<CustomerSession | null>(null);

  // Pre-fill from customer session
  useEffect(() => {
    fetch("/api/customer/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.customer) {
          setCustomer(d.customer);
          if (d.customer.name) setCustomerName(d.customer.name);
        }
      })
      .catch(() => {});
  }, []);

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
          tableTimestamp: tableTimestamp || undefined,
          tableSignature: tableSignature || undefined,
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

      {/* Customer session banner */}
      {customer ? (
        <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${
          customer.isVerified
            ? "border-green-200 bg-green-50"
            : "border-amber-200 bg-amber-50"
        }`}>
          <div className={`mt-0.5 shrink-0 ${customer.isVerified ? "text-green-600" : "text-amber-600"}`}>
            {customer.isVerified
              ? <CheckCircle className="h-4 w-4" />
              : <AlertCircle className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-xs ${customer.isVerified ? "text-green-800" : "text-amber-800"}`}>
              {customer.isVerified ? "Signed in" : "Signed in — email not verified"}
            </p>
            <p className={`text-[11px] truncate mt-0.5 ${customer.isVerified ? "text-green-700" : "text-amber-700"}`}>
              {customer.email}
            </p>
            {!customer.isVerified && (
              <Link
                href={`/cafe/${cafeSlug}/auth/verify-email?email=${encodeURIComponent(customer.email)}`}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 mt-1 inline-block"
              >
                Verify your email →
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-sm">
          <User className="h-4 w-4 text-stone-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-stone-600">
              <Link
                href={`/cafe/${cafeSlug}/auth/login?redirect=${encodeURIComponent(`/cafe/${cafeSlug}/order/checkout`)}`}
                className="font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2"
              >
                Sign in
              </Link>{" "}
              or{" "}
              <Link
                href={`/cafe/${cafeSlug}/auth/signup?redirect=${encodeURIComponent(`/cafe/${cafeSlug}/order/checkout`)}`}
                className="font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2"
              >
                create account
              </Link>{" "}
              to save your order history
            </p>
          </div>
        </div>
      )}

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
