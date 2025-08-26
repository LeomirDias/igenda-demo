import { z } from "zod";

export const UpdateConfirmationSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  confirmation: z.enum(["manual", "automatic"]),
});

export type UpdateConfirmationSchema = z.infer<typeof UpdateConfirmationSchema>;
