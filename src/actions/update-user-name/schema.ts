import { z } from "zod";

export const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  id: z.string().min(1, "ID é obrigatório"),
});
