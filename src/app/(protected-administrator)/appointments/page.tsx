import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccessWhitoutPlan } from "@/components/ui/acess-without-plan";
import { db } from "@/db";
import {
  appointmentsTable,
  clientsTable,
  enterprisesTable,
  professionalsTable,
  servicesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import { SchedulingDashboard } from "./_components/scheduling-dashboard";

export const metadata: Metadata = {
  title: "iGenda - Agendamentos",
};


const AppointmentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.enterprise) {
    redirect("/enterprise-form");
  }
  if (session.user.subscriptionStatus !== "active") {
    return <AccessWhitoutPlan />;
  }

  const [clients, professionals, appointments, services, enterprise] =
    await Promise.all([
      db.query.clientsTable.findMany({
        where: eq(clientsTable.enterpriseId, session.user.enterprise.id),
      }),
      db.query.professionalsTable.findMany({
        where: eq(professionalsTable.enterpriseId, session.user.enterprise.id),
      }),
      db.query.appointmentsTable.findMany({
        where: eq(appointmentsTable.enterpriseId, session.user.enterprise.id),
        with: {
          client: true,
          professional: true,
          service: true,
        },
      }),
      db.query.servicesTable.findMany({
        where: eq(servicesTable.enterpriseId, session.user.enterprise.id),
      }),
      db.query.enterprisesTable.findFirst({
        where: eq(enterprisesTable.id, session.user.enterprise.id),
      }),
    ]);

  if (!enterprise) {
    redirect("/enterprise-form");
  }

  return (
    <SchedulingDashboard
      professionals={professionals}
      appointments={appointments.map((appointment) => ({
        ...appointment,
        client: {
          id: appointment.client.id,
          name: appointment.client.name,
          phoneNumber: appointment.client.phoneNumber,
        },
        professional: {
          id: appointment.professional.id,
          name: appointment.professional.name,
          specialty: appointment.professional.specialty,
        },
        service: {
          id: appointment.service.id,
          name: appointment.service.name,
          servicePriceInCents: appointment.service.servicePriceInCents,
          durationInMinutes: appointment.service.durationInMinutes,
        },
      }))}
      services={services}
      clients={clients}
      enterprise={enterprise}
    />
  );
};

export default AppointmentsPage;
