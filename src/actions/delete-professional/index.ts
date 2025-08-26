"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { professionalsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deleteProfessional = actionClient
    .schema(
        z.object({
            id: z.string().uuid(),
        }),
    )
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            throw new Error("Unauthorized");
        }
        const professional = await db.query.professionalsTable.findFirst({
            where: eq(professionalsTable.id, parsedInput.id),
        });
        if (!professional) {
            throw new Error("Profissional não encontrado");
        }
        if (professional.enterpriseId !== session.user.enterprise?.id) {
            throw new Error("Profissional não encontrado");
        }
        await db.delete(professionalsTable).where(eq(professionalsTable.id, parsedInput.id));
        revalidatePath("/professionals");
    });