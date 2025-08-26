"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { enterprisesTable, verificationCodesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { sendWhatsappMessage } from "@/lib/zapi-service";

import {
  generateCodeSchema,
  VerificationResponse,
} from "./types";

// Generate random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateCode = actionClient
  .schema(generateCodeSchema)
  .action(async ({ parsedInput }): Promise<VerificationResponse> => {
    try {
      // Generate verification code
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

      // Remove any previous code for this phone
      await db.delete(verificationCodesTable).where(
        eq(verificationCodesTable.phoneNumber, parsedInput.phoneNumber)
      );

      // Store the code and client data in the database
      await db.insert(verificationCodesTable).values({
        phoneNumber: parsedInput.phoneNumber,
        code: verificationCode,
        clientData: JSON.stringify(parsedInput.clientData),
        expiresAt,
      });

      // Buscar nome da empresa pelo slug
      const enterpriseSlug = parsedInput.clientData?.enterpriseSlug;
      let enterpriseName = "sua empresa";
      if (enterpriseSlug) {
        const enterprise = await db
          .select()
          .from(enterprisesTable)
          .where(eq(enterprisesTable.slug, enterpriseSlug))
          .limit(1);
        if (enterprise.length > 0) {
          enterpriseName = enterprise[0].name;
        }
      }

      // Enviar mensagem personalizada
      await sendWhatsappMessage(
        parsedInput.phoneNumber,
        `Olá, ${parsedInput.clientData?.name || ""}!
Esta é uma mensagem automática da iGenda de ${enterpriseName}. 💚

Seu código de verificação para acesso ao iGenda é: *${verificationCode}*

⚠️ Atenção: 

O código é válido por 5 minutos. ⏳ 

Caso não tenha solicitado, desconsidere esta mensagem.`
      );
      console.log("Código enviado para:", parsedInput.phoneNumber);

      return { success: true, message: "Verification code sent" };
    } catch (error) {
      console.error("Error generating verification code:", error);
      return { success: false, message: "Failed to send verification code" };
    }
  });