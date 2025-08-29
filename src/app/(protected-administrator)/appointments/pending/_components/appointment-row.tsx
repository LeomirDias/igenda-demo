"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { updateAppointmentStatus } from "@/actions/update-appointment-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AppointmentRow({
    type,
    date,
    appointmentId,
    title,
    clientName,
    professionalName,
    time,
    priceInCents,
}: {
    type: "confirm" | "conclude";
    appointmentId: string;
    title: string;
    clientName: string;
    professionalName: string;
    time: string;
    date: string;
    priceInCents: number;
}) {
    const { execute, status } = useAction(updateAppointmentStatus, {
        onSuccess: () => toast.success("Status atualizado."),
        onError: () => toast.error("Falha ao atualizar status."),
    });

    const price = (priceInCents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

    const handle = (statusValue: "scheduled" | "served" | "no-show" | "canceled") => {
        execute({ id: appointmentId, status: statusValue });
    };

    return (
        <Card className="border-border">
            <CardContent className="flex items-center justify-between p-4">
                <div>
                    <p className="text-lg font-bold">{title}</p>
                    <p className="text-sm text-muted-foreground mb-4">{clientName}</p>
                    <p className="text-xs text-muted-foreground mb-0.5">Profissional: {professionalName}</p>
                    <p className="text-xs mb-0.5">{date} às {time}</p>
                    <p className="text-xs">{price}</p>
                </div>
                <div className="flex gap-2">
                    {type === "confirm" ? (
                        <>
                            <Button disabled={status === "executing"} onClick={() => handle("scheduled")}>Confirmar</Button>
                            <Button variant="outline" disabled={status === "executing"} onClick={() => handle("canceled")}>Recusar</Button>
                        </>
                    ) : (
                        <>
                            <Button disabled={status === "executing"} onClick={() => handle("served")}>Finalizado</Button>
                            <Button variant="outline" disabled={status === "executing"} onClick={() => handle("no-show")}>Falta</Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


