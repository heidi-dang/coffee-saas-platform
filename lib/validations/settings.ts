import { z } from "zod/v4";

export const updateSettingsSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
  acceptDineIn: z.boolean().optional(),
  acceptTakeaway: z.boolean().optional(),
  acceptPickup: z.boolean().optional(),
  acceptPayAtCounter: z.boolean().optional(),
  acceptOnlinePayment: z.boolean().optional(),
});
