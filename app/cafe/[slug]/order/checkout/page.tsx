import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tableToken?: string }>;
}

export default async function CheckoutPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { tableToken } = await searchParams;

  const cafe = await db.cafe.findUnique({
    where: { slug, isActive: true },
    include: { settings: true },
  });

  if (!cafe) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <CheckoutForm
        cafeSlug={cafe.slug}
        tableToken={tableToken}
        settings={{
          acceptDineIn: cafe.settings?.acceptDineIn ?? true,
          acceptTakeaway: cafe.settings?.acceptTakeaway ?? true,
          acceptPickup: cafe.settings?.acceptPickup ?? true,
          acceptPayAtCounter: cafe.settings?.acceptPayAtCounter ?? true,
          acceptOnlinePayment: cafe.settings?.acceptOnlinePayment ?? false,
        }}
      />
    </div>
  );
}
