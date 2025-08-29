"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const updateAppointmentStatusSchema = z.object({
    id: z.string().uuid(),
    status: z.enum([
        "not-confirmed",
        "scheduled",
        "served",
        "canceled",
        "no-show",
    ]),
});

export const updateAppointmentStatus = actionClient
    .schema(updateAppointmentStatusSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            throw new Error("Unauthorized");
        }
        if (!session.user.enterprise?.id) {
            throw new Error("Enterprise not found");
        }

        await db
            .update(appointmentsTable)
            .set({ status: parsedInput.status, updatedAt: new Date() })
            .where(eq(appointmentsTable.id, parsedInput.id));

        revalidatePath("/appointments");
        revalidatePath("/appointments/pending");
        revalidatePath("/dashboard");
    });

export type UpdateAppointmentStatusInput = z.infer<
    typeof updateAppointmentStatusSchema
>;


