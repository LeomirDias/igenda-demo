"use client";

import dayjs from "dayjs";
import { Filter } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  appointmentsTable,
  clientsTable,
  enterprisesTable,
  professionalsTable,
  servicesTable,
} from "@/db/schema";

import AddAppointmentButton from "./add-appointment-button";
import { AppointmentList } from "./appointment-list";
import { ConfirmationToggleButton } from "./confirmation-toggle-button";
import { EditAppointmentDialog } from "./edit-appointment-dialog";
import { NewAppointmentAlert } from "./new-appointment-alert";
import { SidebarContent } from "./sidebar-content";

// Definição do tipo AppointmentWithRelations
export type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  client: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  professional: {
    id: string;
    name: string;
    specialty: string;
  };
  service: {
    id: string;
    name: string;
    servicePriceInCents: number;
    durationInMinutes: number;
  };
};

export function SchedulingDashboard({
  professionals,
  appointments,
  services,
  clients,
  enterprise,
}: {
  professionals: (typeof professionalsTable.$inferSelect)[];
  appointments: AppointmentWithRelations[];
  services: (typeof servicesTable.$inferSelect)[];
  clients: (typeof clientsTable.$inferSelect)[];
  enterprise: typeof enterprisesTable.$inferSelect;
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingAppointmentId, setEditingAppointmentId] = useState<
    string | null
  >(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filtro dos agendamentos para o dia selecionado e filtros laterais
  const filteredAppointments = appointments.filter((appointment) => {
    const appDate = dayjs(appointment.date);
    const inDay = date ? appDate.isSame(dayjs(date), "day") : true;
    const matchesProfessional =
      !selectedProfessional ||
      appointment.professional.id === selectedProfessional;
    const matchesService =
      !selectedService || appointment.service.id === selectedService;
    const matchesSearch =
      !searchTerm ||
      appointment.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    return inDay && matchesProfessional && matchesService && matchesSearch;
  });

  // Função de reset dos filtros
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedProfessional("");
    setSelectedService("");
  };

  return (
    <div className="bg-background flex h-screen w-full">
      {/* Área Principal - Timeline do Dia */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4">
          <div>
            <h1 className="text-foreground text-xl font-bold lg:text-2xl">
              Agendamentos
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              {date
                ?.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
                .replace(/^ w/, (c) => c.toUpperCase())}
            </p>
          </div>

          <div className="flex flex-row gap-2">
            <ConfirmationToggleButton
              enterpriseId={enterprise.id}
              currentConfirmation={
                enterprise.confirmation as "manual" | "automatic"
              }
            />
            <AddAppointmentButton
              clients={clients}
              professionals={professionals}
              services={services}
            />
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="default" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SidebarContent
                  date={date}
                  setDate={setDate}
                  setIsSidebarOpen={setIsSidebarOpen}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedProfessional={selectedProfessional}
                  setSelectedProfessional={setSelectedProfessional}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  professionals={professionals}
                  services={services}
                  onResetFilters={handleResetFilters}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Timeline do dia - Mobile*/}
        <div className="lg:hidden">
          <div className="flex flex-col gap-4 p-4">
            <div
              className="flex flex-col gap-4 overflow-y-auto"
              style={{ maxHeight: "calc(100dvh - 110px)" }}
            >
              <AppointmentList
                appointments={filteredAppointments}
                onEdit={setEditingAppointmentId}
                isMobile
              />
            </div>
            <EditAppointmentDialog
              open={!!editingAppointmentId}
              onOpenChange={(open) => {
                if (!open) setEditingAppointmentId(null);
              }}
              appointmentId={editingAppointmentId}
              appointments={appointments}
              clients={clients}
              professionals={professionals}
              services={services}
              onSuccess={() => setEditingAppointmentId(null)}
            />
          </div>
        </div>

        {/* Timeline do dia - PC*/}
        <div className="mt-4 hidden lg:flex">
          <div
            className="grid w-full grid-cols-3 gap-4 overflow-y-auto px-4"
            style={{ maxHeight: "calc(100dvh - 110px)" }}
          >
            <AppointmentList
              appointments={filteredAppointments}
              onEdit={setEditingAppointmentId}
            />
            <EditAppointmentDialog
              open={!!editingAppointmentId}
              onOpenChange={(open) => {
                if (!open) setEditingAppointmentId(null);
              }}
              appointmentId={editingAppointmentId}
              appointments={appointments}
              clients={clients}
              professionals={professionals}
              services={services}
              onSuccess={() => setEditingAppointmentId(null)}
            />
            <NewAppointmentAlert />
          </div>
        </div>
      </div>
    </div>
  );
}
