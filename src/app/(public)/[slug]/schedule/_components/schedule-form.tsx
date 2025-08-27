"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getProfessionalsByServicePublic } from "@/actions/associate-professionals-to-service";
import { createAppointment } from "@/actions/create-appointments";
import { getAvailableTimes } from "@/actions/get-available-times";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const scheduleFormSchema = z.object({
    serviceId: z.string({
        required_error: "O serviço é obrigatório",
    }),
    professionalId: z.string({
        required_error: "O profissional é obrigatório",
    }),
    date: z.date({
        required_error: "A data é obrigatória",
    }),
    time: z.string({
        required_error: "O horário é obrigatório",
    }),
});

interface ScheduleFormProps {
    services: Array<{
        id: string;
        name: string;
        servicePriceInCents: number;
    }>;
    professionals: Array<{
        id: string;
        name: string;
        specialty: string;
        availableFromWeekDay: number;
        availableToWeekDay: number;
    }>;
    enterpriseId: string;
    clientId: string;
    enterpriseSlug: string;
}

const ScheduleForm = ({ services, professionals, enterpriseId, clientId, enterpriseSlug }: ScheduleFormProps) => {
    const router = useRouter();

    const form = useForm<z.infer<typeof scheduleFormSchema>>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            serviceId: "",
            professionalId: "",
            date: undefined,
            time: "",
        },
    });

    const selectedProfessionalId = form.watch("professionalId");
    const selectedDate = form.watch("date");
    const selectedServiceId = form.watch("serviceId");

    const { data: availableTimes } = useQuery({
        queryKey: ["available-times", selectedDate, selectedProfessionalId],
        queryFn: () =>
            getAvailableTimes({
                date: dayjs(selectedDate).format("YYYY-MM-DD"),
                professionalId: selectedProfessionalId,
            }),
        enabled: !!selectedDate && !!selectedProfessionalId,
    });

    const { data: serviceProfessionals } = useQuery({
        queryKey: ["service-professionals", selectedServiceId],
        queryFn: () =>
            getProfessionalsByServicePublic({
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

    const createAppointmentAction = useAction(createAppointment, {
        onSuccess: () => {
            toast.success("Agendamento realizado com sucesso!");
            setTimeout(() => {
                router.push(`/${enterpriseSlug}/successful-scheduling`);
            }, 1000);
        },
        onError: () => {
            toast.error("Erro ao realizar agendamento.");
        },
    });

    const onSubmit = (values: z.infer<typeof scheduleFormSchema>) => {
        createAppointmentAction.execute({
            clientId,
            serviceId: values.serviceId,
            professionalId: values.professionalId,
            date: dayjs(values.date).format("YYYY-MM-DD"),
            time: values.time,
            enterpriseId,
        });
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Agende seu horário
                </CardTitle>
                <CardDescription>
                    Escolha o serviço, profissional, data e horário para seu agendamento
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="serviceId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Serviço</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                        disabled={!selectedDate}
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

                        <Button type="submit" className="w-full" disabled={createAppointmentAction.isPending}>
                            {createAppointmentAction.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Agendando...
                                </>
                            ) : (
                                "Agendar"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default ScheduleForm;
