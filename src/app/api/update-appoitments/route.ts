import dayjs from "dayjs";
import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

export async function GET() {
    const now = dayjs();
    const today = now.startOf("day").toDate();
    const tomorrow = now.add(1, "day").startOf("day").toDate();
    const currentTime = now.format("HH:mm:ss");

    try {
        // Busca agendamentos para hoje com status scheduled e horário menor que o atual
        const appointmentsToUpdate = await db
            .select({
                id: appointmentsTable.id,
                date: appointmentsTable.date,
                time: appointmentsTable.time,
                status: appointmentsTable.status,
            })
            .from(appointmentsTable)
            .where(
                and(
                    gte(appointmentsTable.date, today),
                    lt(appointmentsTable.date, tomorrow),
                    eq(appointmentsTable.status, "scheduled"),
                    sql`${appointmentsTable.time} < ${currentTime}`
                )
            );

        if (appointmentsToUpdate.length === 0) {
            return Response.json({
                status: "Nenhum agendamento encontrado para atualizar",
                count: 0
            });
        }

        // Atualiza o status dos agendamentos encontrados para "served"
        const updatePromises = appointmentsToUpdate.map(appointment =>
            db
                .update(appointmentsTable)
                .set({
                    status: "served",
                    updatedAt: new Date()
                })
                .where(eq(appointmentsTable.id, appointment.id))
        );

        await Promise.all(updatePromises);

        return Response.json({
            status: "Agendamentos atualizados com sucesso",
            count: appointmentsToUpdate.length,
            appointments: appointmentsToUpdate.map(apt => ({
                id: apt.id,
                date: apt.date,
                time: apt.time
            }))
        });

    } catch (error) {
        console.error("Erro ao atualizar agendamentos:", error);
        return Response.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
