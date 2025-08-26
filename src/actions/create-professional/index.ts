"use server";

import crypto from "crypto";
import { headers } from "next/headers";

import { db } from "@/db";
import { professionalsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const createProfessional = async (
    name: string,
    specialty: string,
    phoneNumber: string,
    instagramURL: string,
    availableFromWeekDay: number,
    availableToWeekDay: number,
    availableFromTime: string,
    availableToTime: string,
) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        throw new Error("Unauthorized");
    }
    if (!session?.user.enterprise?.id) {
        throw new Error("Enterprise not found");
    }

    const [professional] = await db
        .insert(professionalsTable)
        .values({
            id: crypto.randomUUID(),
            name,
            specialty,
            phoneNumber,
            instagramURL,
            availableFromWeekDay,
            availableToWeekDay,
            availableFromTime: availableFromTime,
            availableToTime: availableToTime,
            enterpriseId: session.user.enterprise.id,
        }).returning();

    return { professionalId: professional.id, revalidatePath: "/professionals" };
};