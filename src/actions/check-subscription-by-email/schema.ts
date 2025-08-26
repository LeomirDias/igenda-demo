import z from "zod";

export const checkSubscriptionByEmailSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, { message: "E-mail é obrigatório." })
        .email({ message: "Email inválido" }),
});

export type CheckSubscriptionByEmailInput = z.infer<typeof checkSubscriptionByEmailSchema>;

