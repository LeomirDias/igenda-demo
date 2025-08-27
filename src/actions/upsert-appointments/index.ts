"use server";

import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
    appointmentsTable,
    clientsTable,
    enterprisesTable,
    professionalsTable,
    servicesTable,
} from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { sendWhatsappMessage } from "@/lib/zapi-service";

import { getAvailableTimes } from "../get-available-times";
import { upsertAppointmentSchema } from "./schema";


export const addAppointment = actionClient
    .schema(upsertAppointmentSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            throw new Error("Unauthorized");
        }
        if (!session?.user.enterprise?.id) {
            throw new Error("Enterprise not found");
        }
        const availableTimes = await getAvailableTimes({
            professionalId: parsedInput.professionalId,
            date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
        });
        if (!availableTimes?.data) {
            throw new Error("No available times");
        }
        const isTimeAvailable = availableTimes.data?.some(
            (time) => time.value === parsedInput.time && time.available,
        );
        if (!isTimeAvailable) {
            throw new Error("Time not available");
        }

        // Busca o preço do serviço selecionado
        const service = await db.query.servicesTable.findFirst({
            where: eq(servicesTable.id, parsedInput.serviceId),
        });

        if (!service) {
            throw new Error("Service not found");
        }

        const appointmentDateTime = dayjs(parsedInput.date)
            .set("hour", parseInt(parsedInput.time.split(":")[0]))
            .set("minute", parseInt(parsedInput.time.split(":")[1]))
            .toDate();

        await db.insert(appointmentsTable).values({
            clientId: parsedInput.clientId,
            serviceId: parsedInput.serviceId,
            professionalId: parsedInput.professionalId,
            time: parsedInput.time,
            date: appointmentDateTime,
            enterpriseId: session.user.enterprise.id,
            id: parsedInput.id,
            appointmentPriceInCents: service.servicePriceInCents, // Define o preço do agendamento igual ao preço do serviço
        });

        // Buscar dados relacionados para enviar mensagem ao cliente
        const [client] = await db
            .select()
            .from(clientsTable)
            .where(eq(clientsTable.id, parsedInput.clientId));
        if (!client) {
            revalidatePath("/appointments");
            revalidatePath("/dashboard");
            return;
        }

        const [professional] = await db
            .select()
            .from(professionalsTable)
            .where(eq(professionalsTable.id, parsedInput.professionalId));
        if (!professional) {
            revalidatePath("/appointments");
            revalidatePath("/dashboard");
            return;
        }

        const [enterprise] = await db
            .select()
            .from(enterprisesTable)
            .where(eq(enterprisesTable.id, session.user.enterprise.id));
        if (!enterprise) {
            revalidatePath("/appointments");
            revalidatePath("/dashboard");
            return;
        }

        const formattedDate = dayjs(appointmentDateTime).format("DD/MM/YYYY");
        const formattedPrice = formatCurrencyInCents(service.servicePriceInCents);

        const address = `${enterprise.address}, ${enterprise.number}`;
        const fullAddress = enterprise.complement
            ? `${address} - ${enterprise.complement}, ${enterprise.city}/${enterprise.state} - CEP: ${enterprise.cep}`
            : `${address}, ${enterprise.city}/${enterprise.state} - CEP: ${enterprise.cep}`;

        const creationMessage = `Olá, ${client.name}!👋\n\nEsta é uma mensagem automática da iGenda de ${enterprise.name}\n\n✅ Seu agendamento foi criado em ${enterprise.name}.\n\nDados do agendamento:\n• Serviço: ${service.name}\n• Profissional: ${professional.name}\n• Data: ${formattedDate}\n• Horário: ${parsedInput.time}\n• Valor: ${formattedPrice}\n• Endereço: ${fullAddress}\n\nSe precisar reagendar ou tirar dúvidas, entre em contato com ${enterprise.name} pelo número ${enterprise.phoneNumber}.`;

        await sendWhatsappMessage(client.phoneNumber, creationMessage);

        revalidatePath("/appointments");
        revalidatePath("/dashboard");
    });

export const updateAppointment = actionClient
    .schema(upsertAppointmentSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            throw new Error("Unauthorized");
        }
        if (!session?.user.enterprise?.id) {
            throw new Error("Enterprise not found");
        }
        if (!parsedInput.id) {
            throw new Error("Appointment ID is required for update");
        }
        const availableTimes = await getAvailableTimes({
            professionalId: parsedInput.professionalId,
            date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
        });
        if (!availableTimes?.data) {
            throw new Error("No available times");
        }
        const isTimeAvailable = availableTimes.data?.some(
            (time) => time.value === parsedInput.time && time.available,
        );
        if (!isTimeAvailable) {
            throw new Error("Time not available");
        }
        // Busca o preço do serviço selecionado
        const service = await db.query.servicesTable.findFirst({
            where: eq(servicesTable.id, parsedInput.serviceId),
        });
        if (!service) {
            throw new Error("Service not found");
        }
        const appointmentDateTime = dayjs(parsedInput.date)
            .set("hour", parseInt(parsedInput.time.split(":")[0]))
            .set("minute", parseInt(parsedInput.time.split(":")[1]))
            .toDate();
        await db
            .update(appointmentsTable)
            .set({
                clientId: parsedInput.clientId,
                serviceId: parsedInput.serviceId,
                professionalId: parsedInput.professionalId,
                time: parsedInput.time,
                date: appointmentDateTime,
                appointmentPriceInCents: service.servicePriceInCents,
            })
            .where(eq(appointmentsTable.id, parsedInput.id));

        // Buscar dados relacionados para enviar mensagem ao cliente
        const [client] = await db
            .select()
            .from(clientsTable)
            .where(eq(clientsTable.id, parsedInput.clientId));
        if (!client) {
            revalidatePath("/appointments");
            revalidatePath("/dashboard");
            return;
        }

        const [professional] = await db
            .select()
            .from(professionalsTable)
            .where(eq(professionalsTable.id, parsedInput.professionalId));
        if (!professional) {
            revalidatePath("/appointments");
            revalidatePath("/dashboard");
            return;
        }

        const [enterprise] = await db
            .select()
            .from(enterprisesTable)
            .where(eq(enterprisesTable.id, session.user.enterprise.id));
        if (!enterprise) {
            revalidatePath("/appointments");
            revalidatePath("/dashboard");
            return;
        }

        const formattedDate = dayjs(appointmentDateTime).format("DD/MM/YYYY");
        const formattedPrice = formatCurrencyInCents(service.servicePriceInCents);

        const address = `${enterprise.address}, ${enterprise.number}`;
        const fullAddress = enterprise.complement
            ? `${address} - ${enterprise.complement}, ${enterprise.city}/${enterprise.state} - CEP: ${enterprise.cep}`
            : `${address}, ${enterprise.city}/${enterprise.state} - CEP: ${enterprise.cep}`;

        const updateMessage = `Olá, ${client.name}!👋\n\nEsta é uma mensagem automática da iGenda de ${enterprise.name}\n\n✏️ Seu agendamento foi atualizado na ${enterprise.name}.\n\nNovos dados do agendamento:\n• Serviço: ${service.name}\n• Profissional: ${professional.name}\n• Data: ${formattedDate}\n• Horário: ${parsedInput.time}\n• Valor: ${formattedPrice}\n• Endereço: ${fullAddress}\n\n📞 Caso precise ajustar novamente ou tirar dúvidas, entre em contato com ${enterprise.name} pelo número ${enterprise.phoneNumber}.\n\nAgradecemos a compreensão!💚`;

        await sendWhatsappMessage(client.phoneNumber, updateMessage);
        revalidatePath("/appointments");
        revalidatePath("/dashboard");
    });