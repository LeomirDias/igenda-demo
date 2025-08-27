import React from "react";

import { AppointmentCard, AppointmentWithRelations } from "./appointment-card";

interface AppointmentListProps {
  appointments: AppointmentWithRelations[];
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
  onConfirm?: (id: string) => void;
  isMobile?: boolean;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onEdit,
  onDelete,
  onConfirm,
  isMobile,
}) => (
  <>
    {appointments
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onEdit={onEdit}
          onDelete={onDelete}
          onConfirm={onConfirm}
          isMobile={isMobile}
        />
      ))}
  </>
);
