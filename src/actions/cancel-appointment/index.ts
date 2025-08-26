"use server";

import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable, clientsTable, enterprisesTable, professionalsTable, servicesTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { sendWhatsappMessage } from "@/lib/zapi-service";

import { UpdateAppoitmentSchema } from "./schema";

export const cancelAppointment = actionClient
  .schema(UpdateAppoitmentSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    await db
      .update(appointmentsTable)
      .set({
        status: "canceled",
      })
      .where(eq(appointmentsTable.id, parsedInput.id));

    // Buscar dados do agendamento e relacionados
    const [appointment] = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, parsedInput.id));

    if (!appointment) return;

    // Buscar cliente
    const [client] = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, appointment.clientId));
    if (!client) return;

    // Buscar profissional
    const [professional] = await db
      .select()
      .from(professionalsTable)
      .where(eq(professionalsTable.id, appointment.professionalId));
    if (!professional) return;

    // Buscar serviço
    const [service] = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.id, appointment.serviceId));
    if (!service) return;

    // Buscar empresa
    const [enterprise] = await db
      .select()
      .from(enterprisesTable)
      .where(eq(enterprisesTable.id, appointment.enterpriseId));
    if (!enterprise) return;

    // Montar mensagem personalizada
    const formattedDate = dayjs(appointment.date).format("DD/MM/YYYY");
    const formattedPrice = formatCurrencyInCents(appointment.appointmentPriceInCents);

    // Montar endereço completo da empresa
    const address = `${enterprise.address}, ${enterprise.number}`;
    const fullAddress = enterprise.complement
      ? `${address} - ${enterprise.complement}, ${enterprise.city}/${enterprise.state} - CEP: ${enterprise.cep}`
      : `${address}, ${enterprise.city}/${enterprise.state} - CEP: ${enterprise.cep}`;

    const justificationText = parsedInput.justification
      ? `\n\nMotivo do cancelamento: ${parsedInput.justification}`
      : "";

    const message = `Olá, ${client.name}!👋\n\nEsta é uma mensagem automática da iGenda de ${enterprise.name}\n\n✖️ Seu agendamento foi cancelado na ${enterprise.name}.\n\nDados do agendamento cancelado:\n• Serviço: ${service.name}\n• Profissional: ${professional.name}\n• Data: ${formattedDate}\n• Horário: ${appointment.time}\n• Valor: ${formattedPrice}\n• Endereço: ${fullAddress}${justificationText}\n\n📞 Para reagendar ou esclarecer dúvidas, entre em contato com ${enterprise.name} pelo número ${enterprise.phoneNumber}.\n\nAgradecemos pela compreensão!`;

    await sendWhatsappMessage(client.phoneNumber, message);
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
  });
