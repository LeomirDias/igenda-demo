"use client";
import dayjs from "dayjs";
import { AlertCircle, CreditCard, ExternalLink, MessageCircle } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubscriptionCardProps {
    subscription: {
        id: string;
        email: string;
        docNumber: string;
        phone: string | null;
        planId: string | null;
        plan: string | null;
        subscriptionStatus: string | null;
        subscriptionId: string | null;
        paymentMethod: string | null;
        paidAt: Date | null;
        canceledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
}

const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500">Assinatura Ativa</Badge>;
            case "subscription_renewal_refused":
                return <Badge className="bg-yellow-500">Renovação Recusada</Badge>;
            case "subscription_canceled":
                return <Badge className="bg-red-500">Cancelada</Badge>;
            default:
                return <Badge variant="secondary">Desconhecido</Badge>;
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "N/A";
        return dayjs(date).format("DD/MM/YYYY HH:mm");
    };

    if (!subscription) {
        return (
            <Card className="relative">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CreditCard className="text-primary h-5 w-5" />
                        <CardTitle>Dados da Assinatura</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Nenhuma assinatura encontrada para este usuário.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="relative">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CreditCard className="text-primary h-5 w-5" />
                    <CardTitle>Dados da Assinatura</CardTitle>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Status:</span>
                        {getStatusBadge(subscription.subscriptionStatus)}
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm">
                            <span className="font-semibold">Plano: </span>
                            {subscription.plan || "N/A"}
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">CPF: </span>
                            {subscription.docNumber}
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">Telefone: </span>
                            {subscription.phone || "N/A"}
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">Método de Pagamento: </span>
                            {subscription.paymentMethod === "credit_card"
                                ? "Cartão de crédito"
                                : subscription.paymentMethod === "pix"
                                    ? "Pix"
                                    : subscription.paymentMethod || "N/A"}
                        </p>

                        {subscription.canceledAt && (
                            <p className="text-sm">
                                <span className="font-semibold">Cancelado em: </span>
                                {formatDate(subscription.canceledAt)}
                            </p>
                        )}
                        <p className="text-sm">
                            <span className="font-semibold">Assinatura feita em: </span>
                            {formatDate(subscription.createdAt)}
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">Ultimo pagamento feito em: </span>
                            {formatDate(subscription.paidAt)}
                        </p>
                    </div>
                </div>
            </CardContent>

            <div className="flex flex-col gap-2 p-4 pt-0">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="w-full"
                            disabled={subscription.subscriptionStatus !== "active"}
                        >
                            Cancelar Assinatura
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Deseja cancelar sua assinatura?</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-4">
                                <p>
                                    O cancelamento da assinatura é feito diretamente com a Cakto, processadora oficial das assinaturas iGenda.
                                </p>
                                <div className="space-y-2">
                                    <p className="font-semibold">Se você deseja cancelar manualmente, siga este caminho:</p>
                                    <p>
                                        Envie um e-mail para:{" "}
                                        <span className="font-mono text-primary">
                                            compradores@cakto.com.br
                                        </span>
                                    </p>
                                    <p className="text-sm text-muted-foreground flex flex-row gap-1 items-center">
                                        <AlertCircle className="h-4 w-4 text-primary" />
                                        Inclua o e-mail utilizado na compra e o nome do produto ou
                                        assinatura.
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                            <AlertDialogAction
                                onClick={() =>
                                    window.open(
                                        "https://ajuda.cakto.com.br/pt/article/como-cancelar-uma-assinatura-na-cakto-80ufd1/#3-quando-posso-cancelar-uma-assinatura",
                                        "_blank"
                                    )
                                }
                                className="w-full sm:w-auto flex items-center justify-center"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Saiba Mais
                            </AlertDialogAction>
                            <AlertDialogAction
                                onClick={() =>
                                    window.open(
                                        "https://wa.me/64992834346?text=Olá! Preciso de ajuda com o cancelamento da minha assinatura.",
                                        "_blank"
                                    )
                                }
                                className="w-full sm:w-auto flex items-center justify-center"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Suporte iGenda
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
    );
};

export default SubscriptionCard; 