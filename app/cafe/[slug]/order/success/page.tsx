import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FeedbackForm } from "@/components/feedback/feedback-form";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default async function SuccessPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { orderId } = await searchParams;

  if (!orderId) notFound();

  const cafe = await db.cafe.findUnique({ where: { slug } });
  if (!cafe) notFound();

  const order = await db.order.findUnique({
    where: { id: orderId, cafeId: cafe.id },
    include: { table: true, feedback: true },
  });

  if (!order) notFound();

  const isPendingPayment = order.paymentStatus === "PENDING";
  const isFailedPayment = order.paymentStatus === "FAILED";
  const isPaid = order.paymentStatus === "PAID";
  const isPayAtCounter = order.paymentStatus === "UNPAID";

  const alreadyReviewed = !!order.feedback;
  const isCompleted = order.status === "COMPLETED";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
        <p className="text-muted-foreground">
          Your order has been received.
        </p>
        {isPendingPayment && (
          <p className="mt-2 text-sm text-amber-600">
            Payment received. Your order is being prepared.
          </p>
        )}
        {isFailedPayment && (
          <p className="mt-2 text-sm text-red-600">
            Payment was not completed. Please contact the café.
          </p>
        )}
      </div>

      <div className="border rounded-lg p-6 space-y-3 text-left">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order #</span>
          <span className="font-semibold">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="font-semibold capitalize">{order.status.toLowerCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment</span>
          <span
            className={`font-semibold capitalize ${
              isPaid
                ? "text-green-600"
                : isFailedPayment
                  ? "text-red-600"
                  : isPendingPayment
                    ? "text-amber-600"
                    : ""
            }`}
          >
            {isPayAtCounter
              ? "Pay at counter"
              : isPendingPayment
                ? "Pending"
                : isFailedPayment
                  ? "Failed"
                  : isPaid
                    ? "Paid"
                    : order.paymentStatus.toLowerCase()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type</span>
          <span className="font-semibold capitalize">
            {order.type.toLowerCase().replace("_", " ")}
          </span>
        </div>
        {order.table && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Table</span>
            <span className="font-semibold">{order.table.tableNumber}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold text-lg">
            ${(order.totalCents / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Feedback form — shown for completed orders that haven't been reviewed yet */}
      {isCompleted && !alreadyReviewed && (
        <FeedbackForm orderId={order.id} cafeSlug={slug} />
      )}

      <div className="mt-8">
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
