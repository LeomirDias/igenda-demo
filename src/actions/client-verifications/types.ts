import { z } from "zod";

// Store verification codes temporarily (in production, use Redis or similar)
export const verificationCodes = new Map<string, { code: string, clientData: z.infer<typeof generateCodeSchema> }>();

// Response schemas
export const verificationResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
});

export const verifyResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    client: z.object({
        id: z.string(),
        name: z.string(),
        phoneNumber: z.string(),
        createdAT: z.date(),
        updatedAt: z.date().nullable(),
        enterpriseId: z.string(),
    }).optional(),
});

// Input schemas
export const generateCodeSchema = z.object({
    phoneNumber: z.string(),
    clientData: z.any()
});

export const verifyCodeSchema = z.object({
    phoneNumber: z.string(),
    code: z.string().length(6),
    enterpriseSlug: z.string()
});

// Types
export type VerificationResponse = z.infer<typeof verificationResponseSchema>;
export type VerifyResponse = z.infer<typeof verifyResponseSchema>; 