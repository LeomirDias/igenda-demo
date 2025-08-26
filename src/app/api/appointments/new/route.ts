import { NextResponse } from "next/server";

import { db } from "@/db";

export async function GET() {
  const newAppointment = await db.query.appointmentsTable.findFirst({
    where: (a, { eq }) => eq(a.status, "not-confirmed"),
    orderBy: (a, { desc }) => desc(a.createdAT),
    with: {
      client: true,
      professional: true,
      service: true,
      enterprise: true,
    },
  });

  console.log("Appointment encontrado:", newAppointment); // Debug

  if (!newAppointment) {
    return NextResponse.json(null);
  }

  // Serializar os dados para JSON
  const serializedAppointment = {
    id: newAppointment.id,
    date: newAppointment.date.toISOString(),
    time: newAppointment.time.toString(),
    status: newAppointment.status,
    appointmentPriceInCents: newAppointment.appointmentPriceInCents,
    createdAT: newAppointment.createdAT.toISOString(),
    client: newAppointment.client
      ? {
        id: newAppointment.client.id,
        name: newAppointment.client.name,
        phoneNumber: newAppointment.client.phoneNumber,
      }
      : null,
    professional: newAppointment.professional
      ? {
        id: newAppointment.professional.id,
        name: newAppointment.professional.name,
        specialty: newAppointment.professional.specialty,
      }
      : null,
    service: newAppointment.service
      ? {
        id: newAppointment.service.id,
        name: newAppointment.service.name,
        servicePriceInCents: newAppointment.service.servicePriceInCents,
        durationInMinutes: newAppointment.service.durationInMinutes,
      }
      : null,
    enterprise: newAppointment.enterprise
      ? {
        id: newAppointment.enterprise.id,
        name: newAppointment.enterprise.name,
        slug: newAppointment.enterprise.slug,
        confirmation: newAppointment.enterprise.confirmation,
      }
      : null,
  };

  return NextResponse.json(serializedAppointment);
}
