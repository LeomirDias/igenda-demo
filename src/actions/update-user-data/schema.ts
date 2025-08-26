import z from "zod";

export const updateUserDataSchema = z.object({
    docNumber: z.string().optional(),
    phoneNumber: z.string(),
    subscription_status: z.string(),
});

export type UpdateUserDataSchema = z.infer<typeof updateUserDataSchema>;