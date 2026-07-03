import { z } from "zod/v4";

export const createTableSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
});

export const updateTableSchema = z.object({
  isActive: z.boolean().optional(),
  regenerateQr: z.boolean().optional(),
});
