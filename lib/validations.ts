import { z } from "zod/v4";

export const selectedOptionSchema = z.object({
  optionId: z.string(),
  valueId: z.string(),
});

export const orderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().min(1),
  selectedOptions: z.array(selectedOptionSchema).default([]),
  notes: z.string().optional(),
});

export const createOrderSchema = z.object({
  cafeSlug: z.string(),
  tableToken: z.string().optional(),
  type: z.enum(["DINE_IN", "TAKEAWAY", "PICKUP"]),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerNote: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
