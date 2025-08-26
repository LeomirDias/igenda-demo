"use server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { usersSubscriptionTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const getUserSubscriptionData = actionClient.action(async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });


        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Buscar dados da tabela usersSubscriptionTable pelo email do usuário
        const subscriptionData = await db.query.usersSubscriptionTable.findFirst({
            where: eq(usersSubscriptionTable.email, session.user.email),
        });


        if (!subscriptionData) {
            throw new Error("Dados de assinatura não encontrados para este usuário");
        }

        const userData = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            phone: session.user.phone,
            docNumber: session.user.docNumber,
            subscriptionStatus: session.user.subscriptionStatus,
            // Dados da tabela usersSubscriptionTable
            subscriptionEmail: subscriptionData.email,
            subscriptionPhone: subscriptionData.phone,
            subscriptionDocNumber: subscriptionData.docNumber,
            subscriptionSubscriptionStatus: subscriptionData.subscriptionStatus,
        };

        return userData;
    } catch (error) {
        console.error("Erro em getUserSubscriptionData:", error);
        throw error;
    }
});
