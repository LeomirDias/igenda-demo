"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { servicesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deleteService = actionClient
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
        const service = await db.query.servicesTable.findFirst({
            where: eq(servicesTable.id, parsedInput.id),
        });
        if (!service) {
            throw new Error("Profissional não encontrado");
        }
        if (service.enterpriseId !== session.user.enterprise?.id) {
            throw new Error("Profissional não encontrado");
        }
        await db.delete(servicesTable).where(eq(servicesTable.id, parsedInput.id));
        revalidatePath("/services");
    });