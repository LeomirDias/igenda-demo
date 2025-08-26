"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { usersSubscriptionTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { validateSubscriptionSchema } from "./schema";

export const validateSubscription = actionClient
    .schema(validateSubscriptionSchema)
    .action(async ({ parsedInput }) => {
        try {
            const session = await auth.api.getSession({
                headers: await headers(),
            });

            if (!session?.user) {
                throw new Error("Unauthorized");
            }

            const { email, phone, docNumber, subscriptionStatus } = parsedInput;

            // Buscar usuário pelo email recebido
            const user = await db.query.usersTable.findFirst({
                where: eq(usersTable.email, email),
            });

            if (!user) {
                throw new Error("Usuário não encontrado com este email");
            }

            // Atualizar usuário com os dados recebidos
            await db.update(usersTable)
                .set({
                    phone,
                    subscriptionStatus,
                    docNumber: docNumber || null,
                    updatedAt: new Date(),
                })
                .where(eq(usersTable.id, user.id));

            // Atualizar o campo id da tabela usersSubscriptionTable para ser igual ao id do usuário
            await db.update(usersSubscriptionTable)
                .set({
                    id: user.id,
                    updatedAt: new Date(),
                })
                .where(eq(usersSubscriptionTable.email, email));
            revalidatePath("/dashboard");

            return { success: true };
        } catch (error) {
            console.error("Erro em validateSubscription:", error);
            throw error;
        }
    });
