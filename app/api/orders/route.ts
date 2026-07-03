import { createOrder } from "@/lib/orders/create-order";
import { createOrderWithPaymentSchema } from "@/lib/orders/create-order-schema";
import { badRequest, serverError, ok } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderWithPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid request", parsed.error.issues);
    }

    const { paymentMethod, ...orderInput } = parsed.data;
    const result = await createOrder(orderInput, { paymentMethod });

    if (!result.ok) {
      return badRequest(result.error);
    }

    return ok({
      orderId: result.data.orderId,
      orderNumber: result.data.orderNumber,
      status: result.data.status,
      paymentStatus: result.data.paymentStatus,
      totalCents: result.data.totalCents,
    });
  } catch (error) {
    return serverError(error);
  }
}
