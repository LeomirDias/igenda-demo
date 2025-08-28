"use server";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { enterprisesTable, professionalsTable, servicesTable } from "@/db/schema";
import { generateTimeSlots } from "@/helpers/time";
import { actionClient } from "@/lib/next-safe-action";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      professionalId: z.string(),
      date: z.string().date(), // YYYY-MM-DD,
      serviceId: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    // Helper para interpretar o intervalo (minutos) mesmo que venha "1hora", "1h", etc.
    const parseIntervalMinutes = (raw: string | null | undefined): number => {
      if (!raw) return 30;
      const trimmed = String(raw).trim().toLowerCase();
      // Tenta capturar número e unidade opcional
      const match = trimmed.match(/^(\d+)\s*(h|hora|horas|hr|hrs|m|min|mins|minute|minutes)?$/);
      if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        if (!unit) return Number.isFinite(value) && value > 0 ? value : 30; // assume minutos
        if (unit.startsWith("h")) return value * 60;
        return Number.isFinite(value) && value > 0 ? value : 30; // minutos
      }
      // Se for só número puro
      const numeric = parseInt(trimmed, 10);
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
      return 30;
    };
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
    const intervalInMinutes = parseIntervalMinutes(enterprise?.interval);
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
      with: { service: true },
    });

    // Calcular requiredSlots com base no serviceId (se informado)
    let requiredSlots = 1;
    if (parsedInput.serviceId) {
      const service = await db.query.servicesTable.findFirst({
        where: eq(servicesTable.id, parsedInput.serviceId),
      });
      if (service?.durationInMinutes && intervalInMinutes > 0) {
        requiredSlots = Math.max(
          1,
          Math.ceil(service.durationInMinutes / intervalInMinutes),
        );
      }
    }

    // Normalizar compromissos do dia em janelas [start,end)
    const appointmentsOnSelectedDate = appointments
      .filter((appointment) => {
        return dayjs(appointment.date).isSame(parsedInput.date, "day");
      })
      .map((appointment) => {
        const start = (() => {
          if (appointment.startTime) {
            const [h, m, s] = appointment.startTime.split(":").map(Number);
            return dayjs(appointment.date)
              .set("hour", h)
              .set("minute", m)
              .set("second", s || 0)
              .millisecond(0);
          }
          return dayjs(appointment.date);
        })();
        const end = (() => {
          if (appointment.endTime) {
            const [h, m, s] = appointment.endTime.split(":").map(Number);
            return dayjs(appointment.date)
              .set("hour", h)
              .set("minute", m)
              .set("second", s || 0)
              .millisecond(0);
          }
          const duration = appointment.service?.durationInMinutes ?? 0;
          return start.add(duration, "minute");
        })();
        return { start, end };
      });
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
    // Bloquear apenas os inícios dentro das janelas ocupadas existentes
    const blockedStartTimes = new Set<string>();
    for (const appt of appointmentsOnSelectedDate) {
      let cursor = appt.start.clone();
      while (cursor.isBefore(appt.end)) {
        blockedStartTimes.add(cursor.format("HH:mm:ss"));
        cursor = cursor.add(intervalInMinutes, "minute");
      }
    }

    // Verificar janelas de múltiplos slots livres:
    // - janela deve caber (selected.length == requiredSlots)
    // - o PRIMEIRO slot não pode estar em blockedStartTimes
    const isWindowAvailable = (slotIndex: number) => {
      const selected = professionalTimeSlots.slice(
        slotIndex,
        slotIndex + requiredSlots,
      );
      if (selected.length < requiredSlots) return false;
      const first = selected[0];
      return !blockedStartTimes.has(first);
    };

    return professionalTimeSlots.map((time, i) => {
      return {
        value: time,
        available: isWindowAvailable(i),
        label: time.substring(0, 5),
      };
    });
  });
