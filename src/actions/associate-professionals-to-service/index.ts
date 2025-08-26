"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { professionalsTable, professionalsToServicesTable, servicesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { associateProfessionalsSchema, removeProfessionalFromServiceSchema } from "./schema";

// Action para associar vários profissionais a um serviço
export const associateProfessionalsToService = actionClient
    .schema(associateProfessionalsSchema)
    .action(async ({ parsedInput }) => {
        try {
            const session = await auth.api.getSession({
                headers: await headers(),
            });

            if (!session?.user) {
                throw new Error("Não autorizado");
            }

            // Verifica se o serviço existe e pertence à empresa do usuário
            const service = await db.query.servicesTable.findFirst({
                where: eq(servicesTable.id, parsedInput.serviceId),
            });

            if (!service || service.enterpriseId !== session.user.enterprise?.id) {
                throw new Error("Serviço não encontrado");
            }

            // Verifica se todos os profissionais existem e pertencem à empresa
            const professionals = await db.query.professionalsTable.findMany({
                where: eq(professionalsTable.enterpriseId, session.user.enterprise.id),
            });

            const validProfessionalIds = professionals.map(p => p.id);
            const invalidProfessionals = parsedInput.professionalIds.filter(
                id => !validProfessionalIds.includes(id)
            );

            if (invalidProfessionals.length > 0) {
                throw new Error("Um ou mais profissionais não encontrados");
            }

            // Remove associações existentes
            await db
                .delete(professionalsToServicesTable)
                .where(eq(professionalsToServicesTable.serviceId, parsedInput.serviceId));

            // Se não há profissionais para associar, apenas retorna sucesso
            if (parsedInput.professionalIds.length === 0) {
                revalidatePath("/enterprise-services");
                return { success: true };
            }

            // Cria as novas associações
            const values = parsedInput.professionalIds.map(professionalId => ({
                professionalId,
                serviceId: parsedInput.serviceId,
            }));

            await db.insert(professionalsToServicesTable).values(values);

            revalidatePath("/enterprise-services");
            return { success: true };
        } catch (error) {
            console.error("[ASSOCIATE_PROFESSIONALS_TO_SERVICE]", error);
            throw new Error("Erro ao associar profissionais ao serviço");
        }
    });

// Action para buscar todos os profissionais que realizam um serviço
export const getProfessionalsByService = actionClient
    .schema(associateProfessionalsSchema.pick({ serviceId: true }))
    .action(async ({ parsedInput }) => {
        try {
            const session = await auth.api.getSession({
                headers: await headers(),
            });

            if (!session?.user) {
                throw new Error("Não autorizado");
            }

            const professionals = await db.query.professionalsToServicesTable.findMany({
                where: eq(professionalsToServicesTable.serviceId, parsedInput.serviceId),
                with: {
                    professional: true
                }
            });

            return professionals.map(p => p.professional);
        } catch (error) {
            console.error("[GET_PROFESSIONALS_BY_SERVICE]", error);
            throw new Error("Erro ao buscar profissionais do serviço");
        }
    });

// Action para buscar profissionais associados a um serviço (para uso público)
export const getProfessionalsByServicePublic = actionClient
    .schema(associateProfessionalsSchema.pick({ serviceId: true }))
    .action(async ({ parsedInput }) => {
        try {
            const professionals = await db.query.professionalsToServicesTable.findMany({
                where: eq(professionalsToServicesTable.serviceId, parsedInput.serviceId),
                with: {
                    professional: true
                }
            });

            return professionals.map(p => p.professional);
        } catch (error) {
            console.error("[GET_PROFESSIONALS_BY_SERVICE_PUBLIC]", error);
            throw new Error("Erro ao buscar profissionais do serviço");
        }
    });

// Action para remover a associação entre um profissional e um serviço
export const removeProfessionalFromService = actionClient
    .schema(removeProfessionalFromServiceSchema)
    .action(async ({ parsedInput }) => {
        try {
            const session = await auth.api.getSession({
                headers: await headers(),
            });

            if (!session?.user) {
                throw new Error("Não autorizado");
            }

            // Verifica se o serviço existe e pertence à empresa do usuário
            const service = await db.query.servicesTable.findFirst({
                where: eq(servicesTable.id, parsedInput.serviceId),
            });

            if (!service || service.enterpriseId !== session.user.enterprise?.id) {
                throw new Error("Serviço não encontrado");
            }

            // Remove a associação
            await db
                .delete(professionalsToServicesTable)
                .where(
                    and(
                        eq(professionalsToServicesTable.serviceId, parsedInput.serviceId),
                        eq(professionalsToServicesTable.professionalId, parsedInput.professionalId)
                    )
                );

            revalidatePath("/enterprise-services");
            return { success: true };
        } catch (error) {
            console.error("[REMOVE_PROFESSIONAL_FROM_SERVICE]", error);
            throw new Error("Erro ao remover profissional do serviço");
        }
    }); 