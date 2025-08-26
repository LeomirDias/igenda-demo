"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { clientsTable, enterprisesTable, verificationCodesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { upsertClientSession } from "../upsert-client-session";
import { verifyCodeSchema, VerifyResponse } from "./types";

export const verifyCode = actionClient
  .schema(verifyCodeSchema)
  .action(async ({ parsedInput }): Promise<VerifyResponse> => {
    try {
      // Buscar código no banco
      console.log("Buscando código para:", parsedInput.phoneNumber);
      const codeRow = await db.query.verificationCodesTable.findFirst({
        where: eq(verificationCodesTable.phoneNumber, parsedInput.phoneNumber),
      });

      if (!codeRow) {
        return {
          success: false,
          message: "Nenhum código de verificação encontrado",
        };
      }

      if (codeRow.code !== parsedInput.code) {
        return { success: false, message: "Código de verificação inválido" };
      }

      if (codeRow.expiresAt < new Date()) {
        // Código expirado
        await db.delete(verificationCodesTable).where(
          eq(verificationCodesTable.phoneNumber, parsedInput.phoneNumber)
        );
        return { success: false, message: "Código expirado, solicite um novo." };
      }

      // Parse dos dados do cliente
      const clientData = JSON.parse(codeRow.clientData ?? '{}');

      // Get enterprise by slug
      const enterprise = await db.query.enterprisesTable.findFirst({
        where: eq(enterprisesTable.slug, parsedInput.enterpriseSlug),
      });

      if (!enterprise) {
        return { success: false, message: "Empresa não encontrada" };
      }

      // Verificar se o cliente já existe
      const existingClient = await db.query.clientsTable.findFirst({
        where: eq(clientsTable.phoneNumber, parsedInput.phoneNumber),
      });

      let client = existingClient;

      // Se o cliente não existe, cria um novo
      if (!existingClient) {
        const [newClient] = await db
          .insert(clientsTable)
          .values({
            name: String(clientData.name ?? ''),
            phoneNumber: String(clientData.phoneNumber ?? ''),
            termsAccepted: true,
            termsAcceptedAt: new Date(),
            termsVersionAccepted: "v1.0.0",
            privacyAccepted: true,
            privacyAcceptedAt: new Date(),
            privacyVersionAccepted: "v1.0.0",
            enterpriseId: enterprise.id,
          })
          .returning();

        if (!newClient) {
          return { success: false, message: "Erro ao criar cliente" };
        }

        client = newClient;
      }

      // Cria ou atualiza a sessão do cliente
      if (!client) {
        return { success: false, message: "Erro ao processar cliente" };
      }

      const sessionResult = await upsertClientSession({
        clientId: client.id,
        enterpriseId: enterprise.id,
      });

      if (!sessionResult?.data?.success) {
        return { success: false, message: "Falha ao criar sessão do cliente" };
      }

      // Set session token in cookie
      const cookieStore = await cookies();
      cookieStore.set("client_token", sessionResult.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: sessionResult.data.expiresAt,
      });

      // Remover código após uso
      await db.delete(verificationCodesTable).where(
        eq(verificationCodesTable.phoneNumber, parsedInput.phoneNumber)
      );

      return { success: true, client };
    } catch (error) {
      console.error("Error verifying code:", error);
      return { success: false, message: "Falha ao verificar código" };
    }
  });
