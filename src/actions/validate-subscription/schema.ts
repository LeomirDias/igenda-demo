import { z } from "zod";

export const validateSubscriptionSchema = z.object({
    email: z.string().email(),
    phone: z.string(),
    docNumber: z.string().optional(),
    subscriptionStatus: z.string(),
});

export type ValidateSubscriptionSchema = z.infer<typeof validateSubscriptionSchema>;
