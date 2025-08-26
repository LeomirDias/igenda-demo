"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { clientSessionsTable } from "@/db/schema";

export async function getClientSession() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("client_token")?.value;

        if (!token) {
            return { success: false, message: "Token não encontrado" };
        }

        const session = await db.query.clientSessionsTable.findFirst({
            where: eq(clientSessionsTable.token, token),
            with: {
                client: true,
            },
        });

        if (!session) {
            return { success: false, message: "Sessão não encontrada" };
        }

        if (session.expiresAt < new Date()) {
            return { success: false, message: "Sessão expirada" };
        }

        return { success: true, client: session.client };
    } catch (error) {
        console.error("Erro ao buscar sessão do cliente:", error);
        return { success: false, message: "Erro interno do servidor" };
    }
}
