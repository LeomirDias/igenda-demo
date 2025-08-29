"use client";

import { ChevronDown } from "lucide-react";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type UpdateItem = {
    title: string;
    date: string;
    summary: string;
    details?: React.ReactNode;
};

const updates: UpdateItem[] = [
    {
        title: "Confirmação de agendamentos por WhatsApp",
        date: "2025-08-28",
        summary:
            "Agora é possível confirmar e cancelar agendamentos diretamente pelo WhatsApp da iGenda.",
        details: (
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Envio de mensagens a cada agendamento criado para empresas cadastradas com confirmação manual;</li>
                <li>Funcionalidade para que você responda CONFIRMAR ou CANCELAR e o sistema realize a ação por você;</li>
                <li>Envio de mensagem avisando ao cliente sobre confirmação ou cancelamento.</li>
            </ul>
        ),
    },
    {
        title: "Melhorias na tela de agenda",
        date: "2025-08-28",
        summary:
            "Foram feitas melhorias na tela de agenda para otimizar a experiência de uso.",
        details: (
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Ajustes nos botões de ações rápidas: cancelamento e confirmação;</li>
                <li>Melhoras na responsividade dos cards;</li>
                <li>Estabelecimento de regras de uso dos botões de ação rápida de acordo com o status.</li>
            </ul>
        ),
    },
    {
        title: "Melhorias nas mensagens de WhatsApp",
        date: "2025-08-28",
        summary:
            "As mensagens de WhatsApp foram otimizadas para clareza na comunicação com seu cliente.",
        details: (
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Ajustes nas mensagens de confirmação;</li>
                <li>Ajustes nas mensagens de reagendamento;</li>
                <li>Ajustes nas mensagens de cancelamento;</li>
                <li>Ajustes nas mensagens de avisos e lembretes;</li>
            </ul>
        ),
    },
    {
        title: "Correção de erros e falhas",
        date: "2025-08-28",
        summary:
            "Melhorias de performance, correção em operações e funcionalidades.",
        details: (
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Ajuste no formulário de agendamento em dispositivos IOS (Iphone);</li>
                <li>Correção do relatório de faturamento para refletir resultados corretos;</li>
                <li>Solução do problema de duplicidade de agendamentos, feita a correção dos slots
                    de horários para considerar a duração dos serviços na ocupação dos horários.</li>
            </ul>
        ),
    },
];

function formatDate(isoDate: string) {
    try {
        const date = new Date(isoDate);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return isoDate;
    }
}

function TimelineItem({ title, date, summary, details }: UpdateItem) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="relative pl-8">
            <span className="absolute left-1.5 top-2 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" aria-hidden />
            <Card className="border-border">
                <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setOpen((v) => !v)}
                >
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-base">{title}</CardTitle>
                            <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
                        </div>
                        <ChevronDown
                            className={cn(
                                "h-5 w-5 shrink-0 transition-transform text-muted-foreground",
                                open && "rotate-180"
                            )}
                        />
                    </CardHeader>
                </button>
                <Separator />
                <CardContent className={cn("pt-4", !open && "hidden")}>
                    <p className="text-sm">{summary}</p>
                    {details && <div className="mt-3 text-sm">{details}</div>}
                </CardContent>
            </Card>
        </div>
    );
}

export default function Timeline() {
    return (
        <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-muted" aria-hidden />
            <div className="space-y-6">
                {updates.map((update, index) => (
                    <TimelineItem key={index} {...update} />
                ))}
            </div>
        </div>
    );
}


