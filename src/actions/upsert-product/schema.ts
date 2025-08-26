import z from "zod";

export const upsertProductSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, { message: "Nome do serviço é obrigatório." }),
    description: z.string().trim().optional(),
    category: z.string().trim().min(1, { message: "Categoria é obrigatório." }),
    brand: z.string().trim().min(1, { message: "Marca é obrigatório." }),
    quantity: z.number().min(1, { message: "Quantidade é obrigatório." }),
    productPriceInCents: z.number().min(1, { message: "Preço do produto é obrigatório." }),
    is_consumable: z.boolean().optional(),
})

export type upsertProductSchema = z.infer<typeof upsertProductSchema>;