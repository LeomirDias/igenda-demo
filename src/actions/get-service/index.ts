"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { servicesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getService = actionClient
    .schema(
        z.object({
            serviceId: z.string(),
        }),
    )
    .action(async ({ parsedInput }) => {
        try {
            const service = await db.query.servicesTable.findFirst({
                where: eq(servicesTable.id, parsedInput.serviceId),
            });

            if (!service) {
                throw new Error("Serviço não encontrado");
            }

            return service;
        } catch (error) {
            console.error("[GET_SERVICE]", error);
            throw new Error("Erro ao buscar serviço");
        }
    }); 