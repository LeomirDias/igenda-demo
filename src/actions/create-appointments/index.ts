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
      serviceId: parsedInput.serviceId,
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

    const appointmentStart = dayjs(parsedInput.date)
      .set("hour", parseInt(parsedInput.time.split(":")[0]))
      .set("minute", parseInt(parsedInput.time.split(":")[1]))
      .set("second", 0)
      .millisecond(0);

    const appointmentEnd = appointmentStart.add(service.durationInMinutes, "minute");

    // Verificar conflito localmente usando start/end ou, se preferir, faça via SQL
    const existing = await db.query.appointmentsTable.findMany({
      where: (appointment, { and, eq, ne }) =>
        and(
          eq(appointment.professionalId, parsedInput.professionalId),
          ne(appointment.status, "canceled"),
        ),
      with: { service: true },
    });
    const sameDay = existing
      .filter((a) => dayjs(a.date).isSame(appointmentStart, "day"))
      .map((a) => {
        const start = a.startTime
          ? (() => {
            const [h, m, s] = a.startTime.split(":").map(Number);
            return dayjs(a.date)
              .set("hour", h)
              .set("minute", m)
              .set("second", s || 0)
              .millisecond(0);
          })()
          : dayjs(a.date);
        const end = a.endTime
          ? (() => {
            const [h, m, s] = a.endTime.split(":").map(Number);
            return dayjs(a.date)
              .set("hour", h)
              .set("minute", m)
              .set("second", s || 0)
              .millisecond(0);
          })()
          : start.add(a.service?.durationInMinutes ?? 0, "minute");
        return { start, end };
      });
    const overlaps = sameDay.some(
      (appt) => appt.start.isBefore(appointmentEnd) && appt.end.isAfter(appointmentStart),
    );
    if (overlaps) {
      throw new Error("Time conflicts with another appointment");
    }



    // Obter empresa para saber o modo de confirmação ANTES de salvar
    const [enterprise] = await db
      .select()
      .from(enterprisesTable)
      .where(eq(enterprisesTable.id, parsedInput.enterpriseId));

    if (!enterprise) return;

    // Buscar cliente e profissional (para mensagens)
    const [[client], [professional]] = await Promise.all([
      db.select().from(clientsTable).where(eq(clientsTable.id, parsedInput.clientId)),
      db
        .select()
        .from(professionalsTable)
        .where(eq(professionalsTable.id, parsedInput.professionalId)),
    ]);

    if (!client || !professional) return;

    const formattedDate = dayjs(appointmentStart).format("DD/MM/YYYY");
    const formattedPrice = formatCurrencyInCents(service.servicePriceInCents);

    // Gerar identificador de 4 dígitos
    const identifier = Math.floor(1000 + Math.random() * 9000).toString();

    // Insere já com o status correto conforme a configuração da empresa
    const initialStatus = enterprise.confirmation === "automatic" ? "scheduled" : "not-confirmed" as const;
    await db
      .insert(appointmentsTable)
      .values({
        clientId: parsedInput.clientId,
        serviceId: parsedInput.serviceId,
        professionalId: parsedInput.professionalId,
        time: parsedInput.time,
        date: appointmentStart.toDate(),
        startTime: appointmentStart.format("HH:mm:ss"),
        endTime: appointmentEnd.format("HH:mm:ss"),
        enterpriseId: parsedInput.enterpriseId,
        appointmentPriceInCents: service.servicePriceInCents,
        status: initialStatus,
        identifier,
      });

    if (enterprise.confirmation === "automatic") {
      // Monta endereço completo
      const address = `${enterprise.address}, ${enterprise.number}`;
      const fullAddress = enterprise.complement
        ? `${address} - ${enterprise.complement}, ${enterprise.city}/${enterprise.state} - CEP: ${enterprise.cep}`
        : `${address}, ${enterprise.city}/${enterprise.state} - CEP: ${enterprise.cep}`;

      // Mensagem para o cliente
      const clientMsg = `Olá, ${client.name}! 👋\n\nSeu agendamento em ${enterprise.name} foi confirmado!. ✅\n\nDados do agendamento:\n• Código do agendamento: #${identifier}\n• Empresa: ${enterprise.name}\n• Serviço: ${service.name}\n• Profissional: ${professional.name}\n• Data: ${formattedDate}\n• Horário: ${parsedInput.time}\n• Valor: ${formattedPrice}\n• Endereço: ${fullAddress}\n\nCaso precise remarcar ou cancelar entre em contato com ${enterprise.name} pelo número ${enterprise.phoneNumber} \n\nAgradecemos a preferência! 💚`;
      await sendWhatsappMessage(client.phoneNumber, clientMsg);

      // Mensagem para a empresa
      const enterpriseMsg = `Olá, ${enterprise.name}! 👋\n\nUm novo agendamento foi confirmado automaticamente. ✅\n\nDados do agendamento:\n• Código do agendamento: #${identifier}\n• Cliente: ${client.name}\n• Telefone do cliente: ${client.phoneNumber}\n• Serviço: ${service.name}\n• Profissional: ${professional.name}\n• Data: ${formattedDate}\n• Horário: ${parsedInput.time}\n• Valor: ${formattedPrice}`;
      await sendWhatsappMessage(enterprise.phoneNumber, enterpriseMsg);
    } else {
      // Confirmação manual: envia mensagem de texto orientando resposta CONFIRMAR ou CANCELAR
      const message = `Olá, ${enterprise.name}!\nCódigo do agendamento: #${identifier} 👋\n\nHá um novo agendamento aguardando confirmação. 📅\n\nDados do agendamento:\n• Cliente: ${client.name}\n• Telefone do cliente: ${client.phoneNumber}\n• Serviço: ${service.name}\n• Profissional: ${professional.name}\n• Data: ${formattedDate}\n• Horário: ${parsedInput.time}\n• Valor: ${formattedPrice}\n\nPara confirmar, responda com: CONFIRMAR ${identifier}.\nPara cancelar, responda com: CANCELAR ${identifier}.`;

      await sendWhatsappMessage(enterprise.phoneNumber, message);
    }
  });
