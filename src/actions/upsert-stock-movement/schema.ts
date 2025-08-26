import { z } from "zod";

export const upsertStockMovementSchema = z.object({
    productId: z.string().min(1, "Produto é obrigatório"),
    movementType: z.enum(["entry", "exit"], {
        required_error: "Tipo de movimento é obrigatório",
    }),
    quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
    reason: z.string().optional(),
}); 