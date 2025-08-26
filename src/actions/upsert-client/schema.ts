import z from "zod";

export const upsertClientSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, { message: "Nome do cliente é obrigatório." }),
    phoneNumber: z.string().min(1, { message: "Número de telefone é obrigatório." }),
    termsAccepted: z.boolean().optional(),
    termsAcceptedAt: z.date().optional(),
    termsVersionAccepted: z.string().optional(),
    privacyAccepted: z.boolean().optional(),
    privacyAcceptedAt: z.date().optional(),
    privacyVersionAccepted: z.string().optional(),
})

export type upsertClientSchema = z.infer<typeof upsertClientSchema>;