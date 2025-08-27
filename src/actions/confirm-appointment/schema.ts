import { z } from "zod";

export const UpdateAppoitmentSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  status: z.string().optional(),
});

export type UpdateTicketSchema = z.infer<typeof UpdateAppoitmentSchema>;
