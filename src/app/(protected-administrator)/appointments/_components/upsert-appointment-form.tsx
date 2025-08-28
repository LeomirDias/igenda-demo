"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getProfessionalsByService } from "@/actions/associate-professionals-to-service";
import { getAvailableTimes } from "@/actions/get-available-times";
import {
  addAppointment,
  updateAppointment,
} from "@/actions/upsert-appointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientsTable, professionalsTable, servicesTable } from "@/db/schema";

const formSchema = z.object({
  clientId: z.string().min(1, {
    message: "Cliente é obrigatório.",
  }),
  professionalId: z.string().min(1, {
    message: "Profissional é obrigatório.",
  }),
  serviceId: z.string().min(1, {
    message: "Serviço é obrigatório.",
  }),
  date: z.date({
    message: "Data é obrigatória.",
  }),
  time: z.string().min(1, {
    message: "Horário é obrigatório.",
  }),
});

interface UpsertAppointmentFormProps {
  isOpen: boolean;
  clients: (typeof clientsTable.$inferSelect)[];
  professionals: (typeof professionalsTable.$inferSelect)[];
  services: (typeof servicesTable.$inferSelect)[];
  onSuccess?: () => void;
  appointment?: {
    id: string;
    clientId: string;
    professionalId: string;
    serviceId: string;
    date: string; // formato YYYY-MM-DD
    time: string; // formato HH:mm:ss
  };
}

const UpsertAppointmentForm = ({
  clients,
  professionals,
  services,
  onSuccess,
  isOpen,
  appointment,
}: UpsertAppointmentFormProps) => {
  const isEdit = !!appointment;
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues:
      isEdit && appointment
        ? {
          clientId: appointment.clientId,
          professionalId: appointment.professionalId,
          serviceId: appointment.serviceId,
          date: appointment.date
            ? dayjs(appointment.date).toDate()
            : undefined,
          time: appointment.time || "",
        }
        : {
          clientId: "",
          professionalId: "",
          serviceId: "",
          date: undefined,
          time: "",
        },
  });

  const selectedProfessionalId = form.watch("professionalId");
  const selectedClientId = form.watch("clientId");
  const selectedDate = form.watch("date");
  const selectedServiceId = form.watch("serviceId");

  const { data: availableTimes } = useQuery({
    queryKey: ["available-times", selectedDate, selectedProfessionalId, selectedServiceId],
    queryFn: () =>
      getAvailableTimes({
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
        professionalId: selectedProfessionalId,
        serviceId: selectedServiceId,
      }),
    enabled: !!selectedDate && !!selectedProfessionalId && !!selectedServiceId,
  });

  const { data: serviceProfessionals } = useQuery({
    queryKey: ["service-professionals", selectedServiceId],
    queryFn: () =>
      getProfessionalsByService({
        serviceId: selectedServiceId,
      }),
    enabled: !!selectedServiceId,
  });

  // Filtra profissionais baseado no serviço selecionado
  const availableProfessionals = useMemo(() => {
    return selectedServiceId && serviceProfessionals?.data
      ? serviceProfessionals.data
      : [];
  }, [selectedServiceId, serviceProfessionals?.data]);

  // Reset profissional quando serviço mudar
  useEffect(() => {
    if (selectedServiceId && selectedProfessionalId) {
      const isProfessionalAvailable = availableProfessionals.some(
        p => p.id === selectedProfessionalId
      );
      if (!isProfessionalAvailable) {
        form.setValue("professionalId", "");
      }
    }
  }, [selectedServiceId, selectedProfessionalId, availableProfessionals, form]);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && appointment) {
        form.reset({
          clientId: appointment.clientId,
          professionalId: appointment.professionalId,
          serviceId: appointment.serviceId,
          date: appointment.date ? dayjs(appointment.date).toDate() : undefined,
          time: appointment.time || "",
        });
      } else {
        form.reset({
          clientId: "",
          professionalId: "",
          serviceId: "",
          date: undefined,
          time: "",
        });
      }
    }
  }, [isOpen, form, isEdit, appointment]);

  const createAppointmentAction = useAction(addAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso.");
      onSuccess?.();
    },
    onError: (err) => {
      const message = (err?.error && typeof err.error === "object" && "serverError" in err.error
        ? (err.error as { serverError?: string }).serverError
        : undefined) ?? "";
      if (message?.includes("Time not available")) {
        toast.error("Não foi possível agendar: a duração do serviço excede o tempo disponível para o horário escolhido.");
        return;
      }
      if (message?.includes("Time conflicts")) {
        toast.error("Horário indisponível: existe um agendamento conflitante neste período.");
        return;
      }
      toast.error("Erro ao criar agendamento.");
    },
  });

  const updateAppointmentAction = useAction(updateAppointment, {
    onSuccess: () => {
      toast.success("Agendamento atualizado com sucesso.");
      onSuccess?.();
    },
    onError: (err) => {
      const message = (err?.error && typeof err.error === "object" && "serverError" in err.error
        ? (err.error as { serverError?: string }).serverError
        : undefined) ?? "";
      if (message?.includes("Time not available")) {
        toast.error("Não foi possível atualizar: a duração do serviço excede o tempo disponível para o horário escolhido.");
        return;
      }
      if (message?.includes("Time conflicts")) {
        toast.error("Horário indisponível: existe um agendamento conflitante neste período.");
        return;
      }
      toast.error("Erro ao atualizar agendamento.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEdit && appointment) {
      updateAppointmentAction.execute({
        ...values,
        id: appointment.id,
        date: dayjs(values.date).format("YYYY-MM-DD"),
      });
    } else {
      createAppointmentAction.execute({
        ...values,
        date: dayjs(values.date).format("YYYY-MM-DD"),
      });
    }
  };

  const isDateAvailable = (date: Date) => {
    if (!selectedProfessionalId) return false;
    const selectedProfessional = professionals.find(
      (professional) => professional.id === selectedProfessionalId,
    );
    if (!selectedProfessional) return false;
    const dayOfWeek = date.getDay();
    return (
      dayOfWeek >= selectedProfessional?.availableFromWeekDay &&
      dayOfWeek <= selectedProfessional?.availableToWeekDay
    );
  };

  const formatCurrency = (cents: number) => {
    const value = cents / 100;
    return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

  const isDateTimeEnabled = selectedClientId && selectedProfessionalId && selectedServiceId;

  return (
    <DialogContent className="w-[95vw] max-w-lg sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Editar agendamento" : "Novo agendamento"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Edite os dados do agendamento."
            : "Crie um novo agendamento para o seu cliente."}
        </DialogDescription>
      </DialogHeader>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {formatCurrency(service.servicePriceInCents)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professionalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableProfessionals.map((professional) => (
                          <SelectItem key={professional.id} value={professional.id}>
                            {professional.name} - {professional.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today || !isDateAvailable(date);
                        }}
                        placeholder="Selecione uma data"
                        minDate={new Date()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!isDateTimeEnabled || !selectedDate}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um horário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTimes?.data?.map(
                          (time: {
                            value: string;
                            available: boolean;
                            label: string;
                          }) => (
                            <SelectItem
                              key={time.value}
                              value={time.value}
                              disabled={!time.available}
                            >
                              {time.label} {!time.available && "(Indisponível)"}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    createAppointmentAction.isPending ||
                    updateAppointmentAction.isPending
                  }
                >
                  {createAppointmentAction.isPending ||
                    updateAppointmentAction.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    appointment ? "Editar" : "Agendar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DialogContent>
  );
};

export default UpsertAppointmentForm;
