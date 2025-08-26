"use server";

import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";


export const getProductCategories = actionClient
    .action(async () => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) throw new Error("Unauthorized");
        if (!session.user.enterprise?.id) throw new Error("Enterprise not found");

        const categories = await db
            .selectDistinct({ category: productsTable.category })
            .from(productsTable)
            .where(eq(productsTable.enterpriseId, session.user.enterprise.id))
            .orderBy(asc(productsTable.category));

        return categories.map(c => c.category);
    }); 