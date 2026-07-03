import { requireCafeUser } from "@/lib/auth/guards";
import { orderEvents, ORDER_EVENT_CHANNEL, type OrderEventPayload } from "@/lib/orders/order-events";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireCafeUser();
    const cafeId = user.cafeId;

    let cleanupFn: () => void = () => {};

    const responseStream = new ReadableStream({
      start(controller) {
        const keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(": keep-alive\n\n");
          } catch (e) {
            cleanupFn();
          }
        }, 15000);

        const onOrderEvent = (payload: OrderEventPayload) => {
          if (payload.cafeId === cafeId) {
            try {
              controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
            } catch (e) {
              cleanupFn();
            }
          }
        };

        orderEvents.on(ORDER_EVENT_CHANNEL, onOrderEvent);

        cleanupFn = () => {
          clearInterval(keepAliveInterval);
          orderEvents.off(ORDER_EVENT_CHANNEL, onOrderEvent);
          try {
            controller.close();
          } catch (e) {
            // Already closed or errored
          }
        };
      },
      cancel() {
        cleanupFn();
      }
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response("Unauthorized", { status: 401 });
  }
}
