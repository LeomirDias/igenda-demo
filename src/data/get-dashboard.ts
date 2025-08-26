import dayjs from "dayjs";
import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  clientsTable,
  professionalsTable,
  servicesTable,
} from "@/db/schema";

interface Params {
  from: string;
  to: string;
  session: { user: { enterprise: { id: string } } };
}

const getDashboard = async ({ session, from, to }: Params) => {
  const chartStartDate = dayjs().subtract(7, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(7, "days").endOf("day").toDate();

  const todayStart = dayjs().startOf("day").toDate();
  const todayEnd = dayjs().endOf("day").toDate();

  // Converter as datas de string para objetos Date válidos
  const fromDate = dayjs(from).startOf("day").toDate();
  const toDate = dayjs(to).endOf("day").toDate();

  const [
    [totalRevenue],
    [totalAppointments],
    [totalClients],
    [totalProfessionals],
    [totalCanceledAppointments],
    topProfessionals,
    topServices,
    todayAppointments,
    dailyAppointmentsCountData,
    dailyRevenueData,
  ] = await Promise.all([
    db
      .select({
        total: sum(appointmentsTable.appointmentPriceInCents),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.enterpriseId, session.user.enterprise.id),
          eq(appointmentsTable.status, "scheduled"),
          gte(appointmentsTable.date, fromDate),
          lte(appointmentsTable.date, toDate),
        ),
      ),

    db
      .select({
        total: count(appointmentsTable.id),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.enterpriseId, session.user.enterprise.id),
          eq(appointmentsTable.status, "scheduled"),
          gte(appointmentsTable.date, fromDate),
          lte(appointmentsTable.date, toDate),
        ),
      ),

    db
      .select({
        total: count(),
      })
      .from(clientsTable)
      .where(and(eq(clientsTable.enterpriseId, session.user.enterprise.id))),

    db
      .select({
        total: count(),
      })
      .from(professionalsTable)
      .where(
        and(eq(professionalsTable.enterpriseId, session.user.enterprise.id)),
      ),

    db
      .select({
        total: count(appointmentsTable.id),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.enterpriseId, session.user.enterprise.id),
          eq(appointmentsTable.status, "canceled"),
          gte(appointmentsTable.date, fromDate),
          lte(appointmentsTable.date, toDate),
        ),
      ),

    db
      .select({
        id: professionalsTable.id,
        name: professionalsTable.name,
        avatarImageUrl: professionalsTable.avatarImageURL,
        specialty: professionalsTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(professionalsTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(appointmentsTable.professionalId, professionalsTable.id),
          eq(appointmentsTable.status, "scheduled"),
          gte(appointmentsTable.date, fromDate),
          lte(appointmentsTable.date, toDate),
        ),
      )
      .where(eq(professionalsTable.enterpriseId, session.user.enterprise.id))
      .groupBy(professionalsTable.id)
      .orderBy(desc(count(professionalsTable.name)))
      .limit(10),

    db
      .select({
        id: servicesTable.id,
        name: servicesTable.name,
        appointments: count(appointmentsTable.id),
      })
      .from(servicesTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(appointmentsTable.serviceId, servicesTable.id),
          eq(appointmentsTable.status, "scheduled"),
          gte(appointmentsTable.date, fromDate),
          lte(appointmentsTable.date, toDate),
        ),
      )
      .where(eq(servicesTable.enterpriseId, session.user.enterprise.id))
      .groupBy(servicesTable.id)
      .orderBy(desc(count(servicesTable.name)))
      .limit(5),

    db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.enterpriseId, session.user.enterprise.id),
        gte(appointmentsTable.date, todayStart),
        lte(appointmentsTable.date, todayEnd),
      ),
      with: {
        client: true,
        professional: true,
        service: true,
      },
      orderBy: appointmentsTable.date,
    }),

    // Contagem diária de agendamentos (todas as situações)
    db
      .select({
        date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
        appointments: count(appointmentsTable.id),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.enterpriseId, session.user.enterprise.id),
          eq(appointmentsTable.status, "scheduled"),
          gte(appointmentsTable.date, chartStartDate),
          lte(appointmentsTable.date, chartEndDate),
        ),
      )
      .groupBy(sql`DATE(${appointmentsTable.date})`)
      .orderBy(sql`DATE(${appointmentsTable.date})`),

    // Faturamento diário apenas de agendamentos com status 'scheduled'
    db
      .select({
        date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
        revenue: sql<number>`COALESCE(SUM(${appointmentsTable.appointmentPriceInCents}), 0)`.as(
          "revenue",
        ),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.enterpriseId, session.user.enterprise.id),
          eq(appointmentsTable.status, "scheduled"),
          gte(appointmentsTable.date, chartStartDate),
          lte(appointmentsTable.date, chartEndDate),
        ),
      )
      .groupBy(sql`DATE(${appointmentsTable.date})`)
      .orderBy(sql`DATE(${appointmentsTable.date})`),
  ]);

  const dailyAppointmentsData = dailyAppointmentsCountData.map((item) => ({
    date: item.date,
    appointments: item.appointments,
    revenue: dailyRevenueData.find((r) => r.date === item.date)?.revenue ?? 0,
  }));

  return {
    totalRevenue,
    totalAppointments,
    totalClients,
    totalProfessionals,
    totalCanceledAppointments,
    topProfessionals,
    topServices,
    todayAppointments,
    dailyAppointmentsData,
  };
};

export async function getDailyBillingData(enterpriseId: string) {
  const chartStartDate = dayjs().subtract(7, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(7, "days").endOf("day").toDate();

  // Busca o faturamento diário baseado nos agendamentos e valores dos serviços
  const dailyBillingData = await db
    .select({
      date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
      revenue:
        sql<number>`COALESCE(SUM(${servicesTable.servicePriceInCents}), 0)`.as(
          "revenue",
        ),
    })
    .from(appointmentsTable)
    .leftJoin(servicesTable, eq(appointmentsTable.serviceId, servicesTable.id))
    .where(
      and(
        eq(appointmentsTable.enterpriseId, enterpriseId),
        eq(appointmentsTable.status, "scheduled"),
        gte(appointmentsTable.date, chartStartDate),
        lte(appointmentsTable.date, chartEndDate),
      ),
    )
    .groupBy(sql`DATE(${appointmentsTable.date})`)
    .orderBy(sql`DATE(${appointmentsTable.date})`);

  return dailyBillingData;
}

export default getDashboard;
