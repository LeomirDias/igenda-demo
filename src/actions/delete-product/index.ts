"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deleteProduct = actionClient
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
        const product = await db.query.productsTable.findFirst({
            where: eq(productsTable.id, parsedInput.id),
        });
        if (!product) {
            throw new Error("Produto não encontrado");
        }
        if (product.enterpriseId !== session.user.enterprise?.id) {
            throw new Error("Produto não encontrado");
        }
        await db.delete(productsTable).where(eq(productsTable.id, parsedInput.id));
        revalidatePath("/products");
    });