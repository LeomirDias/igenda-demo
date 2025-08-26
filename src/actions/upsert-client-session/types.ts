import { z } from "zod";

export const upsertSessionSchema = z.object({
    clientId: z.string().uuid(),
    enterpriseId: z.string().uuid(),
});

export type SessionResponse =
    | { success: true; token: string; expiresAt: Date }
    | { success: false; message: string }; 