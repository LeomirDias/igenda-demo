import z from "zod";

export const upsertServiceSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, { message: "Nome do serviço é obrigatório." }),
    servicePriceInCents: z.number().min(0, { message: "Preço do serviço deve ser maior ou igual a 0" }),
    durationInMinutes: z.number().min(1, { message: "Duração do serviço é obrigatória" }),
})

export type upsertServiceSchema = z.infer<typeof upsertServiceSchema>;