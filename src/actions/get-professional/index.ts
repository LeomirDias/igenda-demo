"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { professionalsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getProfessional = actionClient
    .schema(
        z.object({
            professionalId: z.string(),
        }),
    )
    .action(async ({ parsedInput }) => {
        try {
            const professional = await db.query.professionalsTable.findFirst({
                where: eq(professionalsTable.id, parsedInput.professionalId),
                with: {
                    enterprise: true
                }
            });

            if (!professional) {
                throw new Error("Profissional não encontrado");
            }

            return professional;
        } catch (error) {
            console.error("[GET_PROFESSIONAL]", error);
            throw new Error("Erro ao buscar profissional");
        }
    }); 