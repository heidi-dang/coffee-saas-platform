import { EventEmitter } from "events";

const globalRef = global as any;

if (!globalRef.orderEvents) {
  globalRef.orderEvents = new EventEmitter();
}

export const orderEvents: EventEmitter = globalRef.orderEvents;

export const ORDER_EVENT_CHANNEL = "order-update";

export interface OrderEventPayload {
  cafeId: string;
  type: "CREATED" | "UPDATED";
  order: any;
}

export function publishOrderEvent(payload: OrderEventPayload) {
  orderEvents.emit(ORDER_EVENT_CHANNEL, payload);
}
