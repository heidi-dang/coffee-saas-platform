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

const optionValueSchema = z.object({
  name: z.string().min(1, "Value name is required"),
  priceCents: z.number().int().min(0, "Price cannot be negative"),
  sortOrder: z.number().int().min(0).optional(),
});

export const createOptionSchema = z
  .object({
    menuItemId: z.string().min(1),
    name: z.string().min(1, "Option name is required"),
    type: z.enum(["SINGLE", "MULTIPLE"]),
    required: z.boolean(),
    minSelect: z.number().int().min(0),
    maxSelect: z.number().int().min(0),
    values: z.array(optionValueSchema).optional(),
  })
  .refine((data) => data.maxSelect >= data.minSelect, {
    message: "Max select cannot be lower than min select",
    path: ["maxSelect"],
  })
  .refine(
    (data) => {
      if (data.required && data.minSelect > 0) {
        return data.values && data.values.length >= data.minSelect;
      }
      return true;
    },
    { message: "Required option must have at least one value", path: ["values"] }
  );

export const updateOptionSchema = z
  .object({
    name: z.string().min(1).optional(),
    type: z.enum(["SINGLE", "MULTIPLE"]).optional(),
    required: z.boolean().optional(),
    minSelect: z.number().int().min(0).optional(),
    maxSelect: z.number().int().min(0).optional(),
    values: z.array(optionValueSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.minSelect !== undefined && data.maxSelect !== undefined) {
        return data.maxSelect >= data.minSelect;
      }
      return true;
    },
    { message: "Max select cannot be lower than min select", path: ["maxSelect"] }
  );
