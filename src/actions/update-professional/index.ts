"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { professionalsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { updateProfessionalSchema } from "./schema";

export const updateProfessional = actionClient
    .schema(updateProfessionalSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const {
            id,
            name,
            specialty,
            phoneNumber,
            instagramURL,
            availableFromWeekDay,
            availableToWeekDay,
            availableFromTime,
            availableToTime,
        } = parsedInput;

        const professionalId = id;

        if (professionalId) {
            await db
                .update(professionalsTable)
                .set({
                    name,
                    specialty,
                    phoneNumber,
                    instagramURL,
                    availableFromWeekDay,
                    availableToWeekDay,
                    availableFromTime: availableFromTime,
                    availableToTime: availableToTime,
                    updatedAt: new Date(),
                })
                .where(eq(professionalsTable.id, professionalId));
        }

        revalidatePath("/professionals");
    }); 