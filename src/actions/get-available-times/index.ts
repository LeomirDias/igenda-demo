"use server";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { enterprisesTable, professionalsTable } from "@/db/schema";
import { generateTimeSlots } from "@/helpers/time";
import { actionClient } from "@/lib/next-safe-action";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      professionalId: z.string(),
      date: z.string().date(), // YYYY-MM-DD,
    }),
  )
  .action(async ({ parsedInput }) => {
    const professional = await db.query.professionalsTable.findFirst({
      where: eq(professionalsTable.id, parsedInput.professionalId),
    });
    if (!professional) {
      throw new Error("Profissional não encontrado");
    }
    // Buscar o intervalo configurado na empresa do profissional
    const enterprise = await db.query.enterprisesTable.findFirst({
      where: eq(enterprisesTable.id, professional.enterpriseId),
    });
    const intervalInMinutes = enterprise?.interval
      ? parseInt(enterprise.interval, 10)
      : 30;
    const selectedDayOfWeek = dayjs(parsedInput.date).day();
    const professionalIsAvailable =
      selectedDayOfWeek >= professional.availableFromWeekDay &&
      selectedDayOfWeek <= professional.availableToWeekDay;
    if (!professionalIsAvailable) {
      return [];
    }
    const appointments = await db.query.appointmentsTable.findMany({
      where: (appointment, { and, eq, ne }) =>
        and(
          eq(appointment.professionalId, parsedInput.professionalId),
          ne(appointment.status, "canceled"),
        ),
    });
    const appointmentsOnSelectedDate = appointments
      .filter((appointment) => {
        return dayjs(appointment.date).isSame(parsedInput.date, "day");
      })
      .map((appointment) => dayjs(appointment.date).format("HH:mm:ss"));
    const timeSlots = generateTimeSlots(Number.isFinite(intervalInMinutes) ? intervalInMinutes : 30);

    // Lê os horários diretamente do banco (sem conversão UTC)
    const professionalAvailableFrom = professional.availableFromTime;
    const professionalAvailableTo = professional.availableToTime;

    const professionalTimeSlots = timeSlots.filter((time) => {
      const timeHour = Number(time.split(":")[0]);
      const timeMinute = Number(time.split(":")[1]);

      // Compara diretamente os horários
      const slotTime = timeHour * 60 + timeMinute;
      const fromHour = Number(professionalAvailableFrom.split(":")[0]);
      const fromMinute = Number(professionalAvailableFrom.split(":")[1]);
      const toHour = Number(professionalAvailableTo.split(":")[0]);
      const toMinute = Number(professionalAvailableTo.split(":")[1]);

      const fromTime = fromHour * 60 + fromMinute;
      const toTime = toHour * 60 + toMinute;

      return slotTime >= fromTime && slotTime <= toTime;
    });
    return professionalTimeSlots.map((time) => {
      return {
        value: time,
        available: !appointmentsOnSelectedDate.includes(time),
        label: time.substring(0, 5),
      };
    });
  });
