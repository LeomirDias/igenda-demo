import {
  Check,
  Clock,
  Edit2,
  Phone,
  ShoppingBag,
  SquareUser,
  User,
  X,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import React from "react";
import { toast } from "sonner";

import { cancelAppointment } from "@/actions/cancel-appointment";
import { confirmAppointment } from "@/actions/confirm-appointment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { AppointmentWithRelations } from "./scheduling-dashboard";

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
  onConfirm?: (id: string) => void;
  isMobile?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onDelete,
  onConfirm,
  isMobile,
}) => {
  const price = (appointment.service.servicePriceInCents / 100).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );

  const getStatusBadge = () => {
    if (appointment.status === "canceled") {
      return {
        label: "Cancelado",
        className: "bg-red-100 border-red-500 text-red-700 border-2 rounded-xl",
      };
    }
    if (appointment.status === "not-confirmed") {
      return {
        label: "Não confirmado",
        className:
          "bg-orange-100 border-orange-500 text-orange-700 border-2 rounded-xl animate-bounce",
      };
    }
    if (appointment.status === "served") {
      return {
        label: "Atendido",
        className:
          "bg-green-100 border-green-500 text-green-700 border-2 rounded-xl",
      };
    }
    return {
      label: "Agendado",
      className:
        "bg-blue-100 border-blue-500 text-blue-700 border-1 rounded-xl",
    };
  };

  const statusBadge = getStatusBadge();

  const { execute, status } = useAction(cancelAppointment, {
    onSuccess: () => {
      toast.success("Agendamento cancelado com sucesso.");
      onDelete?.(appointment.id);
    },
    onError: () => {
      toast.error("Erro ao cancelar agendamento.");
    },
  });

  const [cancellationReason, setCancellationReason] = React.useState("");

  const { execute: executeConfirm, status: confirmStatus } = useAction(confirmAppointment, {
    onSuccess: () => {
      toast.success("Agendamento confirmado com sucesso.");
      onConfirm?.(appointment.id);
    },
    onError: () => {
      toast.error("Erro ao confirmar agendamento.");
    },
  });

  if (isMobile) {
    return (
      <Card className="bg-background border-border relative flex flex-col items-center justify-start shadow-sm">
        <div className="flex w-full flex-row items-center justify-between gap-2 px-4">
          <div className="flex min-w-[70px] flex-row items-center gap-2">
            <span className="bg-primary border-primary text-md rounded-sm p-2 leading-none font-bold text-white">
              {appointment.time.substring(0, 5)}
            </span>
            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
          </div>
          <span className="text-md text-primary font-bold">{price}</span>
        </div>
        <div className="flex w-full flex-col px-4">
          <div className="mb-3 flex flex-col gap-2">
            <div className="text-foreground flex items-center gap-2">
              <SquareUser className="text-muted-foreground h-4 w-4" />
              <span className="flex items-center gap-1 text-sm font-medium">
                {appointment.client.name}{" "}
                <p className="text-muted-foreground text-xs">Cliente</p>
              </span>
            </div>
            <div className="text-foreground flex items-center gap-2">
              <Phone className="text-muted-foreground h-4 w-4" />
              <span className="flex items-center gap-1 text-sm font-medium">
                {appointment.client.phoneNumber}{" "}
                <p className="text-muted-foreground text-xs">Contato</p>
              </span>
            </div>
          </div>
          <div className="mb-3 flex flex-col gap-2">
            <div className="text-foreground flex items-center gap-2">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="flex items-center gap-1 text-sm font-medium">
                {appointment.professional.name}{" "}
                <p className="text-muted-foreground text-xs">Profissional</p>
              </span>
            </div>
            <div className="text-foreground flex items-center gap-2">
              <ShoppingBag className="text-muted-foreground h-4 w-4" />
              <span className="flex items-center gap-1 text-sm font-medium">
                {appointment.service.name}{" "}
                <p className="text-muted-foreground text-xs">Serviço</p>
              </span>
            </div>
          </div>
        </div>
        <div className="absolute right-2 bottom-2 flex flex-col">
          <Button
            onClick={() => executeConfirm({ id: appointment.id })}
            variant="link"
            className="cursor-pointer"
            disabled={confirmStatus === "executing" || appointment.status === "scheduled" || appointment.status === "canceled" || appointment.status === "served"}
          >
            <Check className="text-primary h-5 w-5" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(appointment.id);
            }}
            disabled={appointment.status === "canceled" || appointment.status === "served"}
            variant="link"
            className="cursor-pointer"
          >
            <Edit2 className="text-primary h-5 w-5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="link" className="cursor-pointer" disabled={appointment.status === "canceled" || appointment.status === "served"}>
                <p className="text-red-500">
                  <X className="h-5 w-5" />
                </p>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base md:text-lg lg:text-xl">
                  Tem certeza que deseja cancelar este agendamento?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm md:text-base lg:text-lg">
                  Essa ação não pode ser desfeita. Caso seja necessário
                  reverter, o agendamento deverá ser recriado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="mt-2">
                <Textarea
                  placeholder="Justificativa do cancelamento (opcional)"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-sm md:text-base">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => execute({ id: appointment.id, justification: cancellationReason || undefined })}
                  className="text-foreground text-sm"
                  disabled={status === "executing"}
                >
                  Cancelar agendamento
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    );
  }

  // Desktop
  return (
    <Card
      key={appointment.id}
      className="bg-background border-border hover:bg-muted/50 relative transition-colors"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-md px-3 py-1 font-semibold text-white">
              {appointment.time.substring(0, 5)}
            </div>
            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-green-400">{price}</p>
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <Clock className="h-3 w-3" />
              {appointment.service.durationInMinutes} min
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-start gap-4">
          <div className="mb-3 flex flex-col gap-2">
            <div className="text-foreground flex items-center gap-2">
              <SquareUser className="text-muted-foreground h-4 w-4" />
              <span className="flex items-center gap-1 text-sm font-medium">
                {appointment.client.name}{" "}
                <p className="text-muted-foreground text-xs">Cliente</p>
              </span>
            </div>
            <div className="text-foreground flex items-center gap-2">
              <Phone className="text-muted-foreground h-4 w-4" />
              <span className="flex items-center gap-1 text-sm font-medium">
                {appointment.client.phoneNumber}{" "}
                <p className="text-muted-foreground text-xs">Contato</p>
              </span>
            </div>
          </div>
          <div className="mb-3 flex flex-col gap-2">
            <div className="text-foreground flex items-center gap-2">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="flex items-center gap-1 text-sm font-medium">
                {appointment.professional.name}{" "}
                <p className="text-muted-foreground text-xs">Profissional</p>
              </span>
            </div>
            <div className="text-foreground flex items-center gap-2">
              <ShoppingBag className="text-muted-foreground h-4 w-4" />
              <span className="flex items-center gap-1 text-sm font-medium">
                {appointment.service.name}{" "}
                <p className="text-muted-foreground text-xs">Serviço</p>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <div className="absolute right-2 bottom-2 flex flex-col">
        <Button
          onClick={() => executeConfirm({ id: appointment.id })}
          variant="link"
          className="cursor-pointer"
          disabled={confirmStatus === "executing" || appointment.status === "scheduled" || appointment.status === "canceled" || appointment.status === "served"}
        >
          <Check className="text-primary h-5 w-5" />
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(appointment.id);
          }}
          disabled={appointment.status === "canceled" || appointment.status === "served"}
          variant="link"
          className="cursor-pointer"
        >
          <Edit2 className="text-primary h-5 w-5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="link" className="cursor-pointer" disabled={appointment.status === "canceled" || appointment.status === "served"}>
              <p className="text-red-500">
                <X className="h-5 w-5" />
              </p>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base md:text-lg lg:text-xl">
                Tem certeza que deseja cancelar este agendamento?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm md:text-base lg:text-lg">
                Essa ação não pode ser desfeita. Caso seja necessário reverter,
                o agendamento deverá ser recriado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-2">
              <Textarea
                placeholder="Justificativa do cancelamento (opcional)"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer text-sm md:text-base">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => execute({ id: appointment.id, justification: cancellationReason || undefined })}
                className="cursor-pointer text-sm"
                disabled={status === "executing"}
              >
                Cancelar agendamento
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};

export type { AppointmentWithRelations };
