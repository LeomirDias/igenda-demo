"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { usersSubscriptionTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { updateUserDataSchema } from "./schema";

export const updateUserData = actionClient
    .schema(updateUserDataSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const { docNumber, phoneNumber, subscription_status } = parsedInput;

        // Buscar status de assinatura na tabela usersSubscriptionTable
        const subscription = await db.query.usersSubscriptionTable.findFirst({
            where: eq(usersSubscriptionTable.phone, phoneNumber),
        });

        // Verificar se o telefone existe na tabela de assinaturas
        if (!subscription) {
            throw new Error("Telefone não encontrado na base de assinaturas.");
        }

        // Atualizar usuário
        await db.update(usersTable)
            .set({
                phone: phoneNumber,
                subscriptionStatus: subscription_status,
                docNumber: docNumber || null,
                updatedAt: new Date(),
            })
            .where(eq(usersTable.id, session.user.id));

        // Atualizar o campo id da tabela usersSubscriptionTable para ser igual ao id do usuário
        await db.update(usersSubscriptionTable)
            .set({
                id: session.user.id,
                updatedAt: new Date(),
            })
            .where(eq(usersSubscriptionTable.phone, phoneNumber));

        revalidatePath("/dashboard");
    }); 