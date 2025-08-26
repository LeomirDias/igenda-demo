import { z } from "zod";

export const getClientSessionSchema = z.object({});

export type GetClientSessionSchema = z.infer<typeof getClientSessionSchema>;
