"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import {
  AlertCircle,
  CalendarIcon,
  Clock,
  CreditCard,
  Phone,
  Tags,
  User,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { cancelAppointment } from "@/actions/cancel-appointment";
import { confirmAppointment } from "@/actions/confirm-appointment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrencyInCents } from "@/helpers/currency";

dayjs.locale("pt-br");

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  appointmentPriceInCents: number;
  createdAT: string;
  client: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  professional: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
    duration?: number;
  };
  enterprise: {
    id: string;
    name: string;
    confirmation?: string;
  };
}

export function NewAppointmentAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelJustification, setCancelJustification] = useState("");

  const { execute: executeConfirm, isExecuting: isConfirming } = useAction(
    confirmAppointment,
    {
      onSuccess: () => {
        toast.success("Agendamento confirmado com sucesso!");
        setIsOpen(false);
        setAppointment(null);
      },
      onError: (error) => {
        toast.error(
          "Erro ao confirmar agendamento: " +
          (error.error?.serverError || "Erro desconhecido"),
        );
      },
    },
  );

  const { execute: executeCancel, isExecuting: isCanceling } = useAction(
    cancelAppointment,
    {
      onSuccess: () => {
        toast.success("Agendamento cancelado com sucesso!");
        setIsOpen(false);
        setAppointment(null);
      },
      onError: (error) => {
        toast.error(
          "Erro ao cancelar agendamento: " +
          (error.error?.serverError || "Erro desconhecido"),
        );
      },
    },
  );

  useEffect(() => {
    const checkNewAppointments = async () => {
      try {
        const res = await fetch("/api/appointments/new");
        const data = await res.json();

        const isValidAppointment =
          data?.id &&
          data.status === "not-confirmed" &&
          data.client &&
          data.professional &&
          data.service;

        if (isValidAppointment) {
          if (data.enterprise?.confirmation === "automatic") {
            // Confirma automaticamente sem abrir o modal
            await executeConfirm({ id: data.id });
          } else {
            // Segue com fluxo manual
            setAppointment(data);
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar novos agendamentos:", error);
      }
    };

    const interval = setInterval(checkNewAppointments, 60000);
    return () => clearInterval(interval);
  }, [executeConfirm]);

  const handleConfirm = async () => {
    if (!appointment) return;

    setIsLoading(true);
    await executeConfirm({ id: appointment.id });
    setIsLoading(false);
  };

  const handleCancel = async () => {
    if (!appointment) return;

    setIsLoading(true);
    await executeCancel({ id: appointment.id, justification: cancelJustification || undefined });
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setAppointment(null);
  };

  if (
    !appointment ||
    !appointment.client ||
    !appointment.professional ||
    !appointment.service
  )
    return null;

  const appointmentDate = dayjs(appointment.date);
  const appointmentTime = appointment.time;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-green-500" />
            Novo agendamento
          </DialogTitle>
          <DialogDescription>
            Um novo agendamento foi solicitado. Revise os detalhes e decida se
            deseja confirmar ou cancelar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">
                  {appointment.client?.name || "Nome não disponível"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">
                  {appointment.client?.phoneNumber || "Telefone não disponível"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes do Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">
                  {appointmentDate.format("dddd, DD [de] MMMM [de] YYYY")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">{appointmentTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">
                  {appointment.professional?.name ||
                    "Profissional não disponível"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Tags className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">
                  {appointment.service?.name || "Serviço não disponível"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CreditCard className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">
                  {formatCurrencyInCents(appointment.appointmentPriceInCents)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <div className="w-full">
            <Textarea
              placeholder="Justificativa do cancelamento (opcional)"
              value={cancelJustification}
              onChange={(e) => setCancelJustification(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || isConfirming || isCanceling}
          >
            Cancelar Agendamento
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || isConfirming || isCanceling}
            variant="default"
          >
            Confirmar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
