"use server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersSubscriptionTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { checkSubscriptionByEmailSchema } from "./schema";

export const checkSubscriptionByEmail = actionClient
    .schema(checkSubscriptionByEmailSchema)
    .action(async ({ parsedInput }) => {
        const { email } = parsedInput;

        const subscription = await db.query.usersSubscriptionTable.findFirst({
            where: eq(usersSubscriptionTable.email, email),
        });

        if (!subscription) {
            return { exists: false } as const;
        }
        return { exists: true } as const;
    });


