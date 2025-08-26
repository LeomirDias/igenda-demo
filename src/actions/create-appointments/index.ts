"use server";

import dayjs from "dayjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  clientsTable,
  enterprisesTable,
  professionalsTable,
  servicesTable,
} from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";
import { actionClient } from "@/lib/next-safe-action";
import { sendWhatsappMessage } from "@/lib/zapi-service";

import { getAvailableTimes } from "../get-available-times";
import { createAppointmentSchema } from "./schema";

export const createAppointment = actionClient
  .schema(createAppointmentSchema)
  .action(async ({ parsedInput }) => {
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
      enterpriseId: parsedInput.enterpriseId,
      appointmentPriceInCents: service.servicePriceInCents,
      status: "not-confirmed",
    });

    // Enviar mensagem para a empresa quando a confirmação for manual
    const [enterprise] = await db
      .select()
      .from(enterprisesTable)
      .where(eq(enterprisesTable.id, parsedInput.enterpriseId));

    if (!enterprise) return;

    if (enterprise.confirmation === "manual") {
      const [[client], [professional]] = await Promise.all([
        db.select().from(clientsTable).where(eq(clientsTable.id, parsedInput.clientId)),
        db
          .select()
          .from(professionalsTable)
          .where(eq(professionalsTable.id, parsedInput.professionalId)),
      ]);

      if (!client || !professional) return;

      const formattedDate = dayjs(appointmentDateTime).format("DD/MM/YYYY");
      const formattedPrice = formatCurrencyInCents(service.servicePriceInCents);

      const message = `Olá, ${enterprise.name}!👋\n\nHá um novo agendamento pendente de confirmação.📅\n\nDados do agendamento:\n• Cliente: ${client.name}\n• Telefone do cliente: ${client.phoneNumber}\n• Serviço: ${service.name}\n• Profissional: ${professional.name}\n• Data: ${formattedDate}\n• Horário: ${parsedInput.time}\n• Valor: ${formattedPrice}\n\nAcesse o painel da iGenda para confirmar ou recusar este agendamento.\n\nAtenciosamente, equipe iGenda💚`;

      await sendWhatsappMessage(enterprise.phoneNumber, message);
    }
  });
