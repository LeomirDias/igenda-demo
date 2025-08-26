import { z } from "zod";

export const UpdateAppoitmentSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  status: z.string().optional(),
  justification: z.string().trim().max(500).optional(),
});

export type UpdateTicketSchema = z.infer<typeof UpdateAppoitmentSchema>;
