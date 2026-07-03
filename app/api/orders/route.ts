import { createOrder } from "@/lib/orders/create-order";
import { createOrderSchema } from "@/lib/orders/create-order-schema";
import { badRequest, serverError, ok } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid request", parsed.error.issues);
    }

    const result = await createOrder(parsed.data);

    if (result.error) {
      return badRequest(result.error);
    }

    return ok({
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      status: result.status,
      paymentStatus: result.paymentStatus,
      totalCents: result.totalCents,
    });
  } catch (error) {
    return serverError(error);
  }
}
