import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CancelPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { orderId } = await searchParams;

  const cafe = await db.cafe.findUnique({ where: { slug } });
  if (!cafe) notFound();

  if (orderId) {
    const order = await db.order.findUnique({
      where: { id: orderId, cafeId: cafe.id },
    });
    if (order && order.paymentStatus === "PENDING") {
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-muted-foreground">
          Your payment was cancelled. No charge was made.
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          href={`/cafe/${slug}/order`}
          className="inline-flex h-12 items-center justify-center rounded-full bg-foreground text-background px-8 font-medium hover:opacity-90"
        >
          Back to Menu
        </Link>
      </div>
    </div>
  );
}
