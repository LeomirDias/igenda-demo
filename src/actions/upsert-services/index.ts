"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { servicesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertServiceSchema } from "./schema";

dayjs.extend(utc);

export const upsertService = actionClient
    .schema(upsertServiceSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) throw new Error("Unauthorized");
        if (!session.user.enterprise?.id) throw new Error("Enterprise not found");

        const { id, name, servicePriceInCents, durationInMinutes } = parsedInput;

        // Se `id` estiver presente, atualiza o serviço existente
        let serviceId = id;

        if (serviceId) {
            await db
                .update(servicesTable)
                .set({
                    name,
                    servicePriceInCents,
                    durationInMinutes,
                    updatedAt: new Date(),
                })
                .where(eq(servicesTable.id, serviceId));
        } else {
            const [service] = await db
                .insert(servicesTable)
                .values({
                    name,
                    servicePriceInCents,
                    durationInMinutes,
                    enterpriseId: session.user.enterprise.id,
                })
                .returning({ id: servicesTable.id });

            serviceId = service.id;
        }

        revalidatePath("/services");
    });
