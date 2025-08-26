import z from "zod";

export const upsertServiceSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, { message: "Nome do serviço é obrigatório." }),
    servicePriceInCents: z.number().min(1, { message: "Preço do serviço é obrigatório" }),
    durationInMinutes: z.number().min(1, { message: "Duração do serviço é obrigatória" }),
})

export type upsertServiceSchema = z.infer<typeof upsertServiceSchema>;