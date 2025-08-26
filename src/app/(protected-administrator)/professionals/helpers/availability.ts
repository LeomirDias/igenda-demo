import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import { professionalsTable } from "@/db/schema";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale("pt-br");

export const getAvailability = (professional: typeof professionalsTable.$inferSelect) => {
    // Lê os horários diretamente do banco (sem conversão UTC)
    const from = dayjs()
        .day(professional.availableFromWeekDay)
        .set("hour", Number(professional.availableFromTime.split(":")[0]))
        .set("minute", Number(professional.availableFromTime.split(":")[1]))
        .set("second", Number(professional.availableFromTime.split(":")[2] || 0));

    const to = dayjs()
        .day(professional.availableToWeekDay)
        .set("hour", Number(professional.availableToTime.split(":")[0]))
        .set("minute", Number(professional.availableToTime.split(":")[1]))
        .set("second", Number(professional.availableToTime.split(":")[2] || 0));

    return { from, to };
};