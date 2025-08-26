"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { enterprisesTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deleteUser = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Buscar usuário atual
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });
  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  // Verificar se há assinatura ativa
  if (user.subscriptionStatus === "active") {
    throw new Error(
      "Não é possível excluir a conta com uma assinatura ativa. Cancele a assinatura antes.",
    );
  }

  // Excluir empresa associada (se for proprietário)
  await db
    .delete(enterprisesTable)
    .where(eq(enterprisesTable.ownerId, user.id));

  // Excluir usuário
  await db.delete(usersTable).where(eq(usersTable.id, user.id));

  // Opcional: revalidatePath("/logout") ou similar, se necessário
});
