import { z } from "zod/v4";

export const selectedOptionSchema = z.object({
  optionId: z.string().min(1).max(100),
  valueId: z.string().min(1).max(100),
});

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(999),
  selectedOptions: z.array(selectedOptionSchema).max(50).default([]),
  notes: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  cafeSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  tableToken: z.string().min(1).max(200).optional(),
  tableTimestamp: z.number().optional(),
  tableSignature: z.string().optional(),
  type: z.enum(["DINE_IN", "TAKEAWAY", "PICKUP"]),
  customerName: z.string().max(100).optional(),
  customerPhone: z.string().max(30).optional(),
  customerNote: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).min(1).max(50),
});

export const paymentMethodSchema = z.enum(["PAY_AT_COUNTER", "ONLINE"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const createOrderWithPaymentSchema = createOrderSchema.extend({
  paymentMethod: paymentMethodSchema.default("PAY_AT_COUNTER"),
});
