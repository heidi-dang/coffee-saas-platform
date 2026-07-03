import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { isStripeConfigured } from "@/lib/payments/stripe";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tableToken?: string; t?: string; s?: string }>;
}

export default async function CheckoutPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { tableToken, t, s } = await searchParams;
  const tableTimestamp = t ? parseInt(t, 10) : undefined;
  const tableSignature = s || undefined;

  const cafe = await db.cafe.findUnique({
    where: { slug, isActive: true },
    include: { settings: true },
  });

  if (!cafe) notFound();

  let tableError: string | null = null;
  if (tableToken) {
    const table = await db.cafeTable.findUnique({
      where: { qrToken: tableToken, cafeId: cafe.id },
    });
    if (!table) {
      tableError = "Invalid table. The QR code may be expired or unrecognised.";
    } else if (!table.isActive) {
      tableError = "This table is not available for ordering.";
    }
  }

  if (tableError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Table Unavailable</h1>
        <p className="text-muted-foreground mb-6">{tableError}</p>
        <Link
          href={`/cafe/${slug}/order`}
          className="inline-flex h-12 items-center justify-center rounded-full bg-foreground text-background px-8 font-medium hover:opacity-90"
        >
          Back to Menu
        </Link>
      </div>
    );
  }

  const onlinePaymentAvailable =
    Boolean(cafe.settings?.acceptOnlinePayment) && isStripeConfigured();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <CheckoutForm
        cafeSlug={cafe.slug}
        tableToken={tableToken}
        tableTimestamp={tableTimestamp}
        tableSignature={tableSignature}
        settings={{
          acceptDineIn: cafe.settings?.acceptDineIn ?? true,
          acceptTakeaway: cafe.settings?.acceptTakeaway ?? true,
          acceptPickup: cafe.settings?.acceptPickup ?? true,
          acceptPayAtCounter: cafe.settings?.acceptPayAtCounter ?? true,
          acceptOnlinePayment: onlinePaymentAvailable,
        }}
      />
    </div>
  );
}
