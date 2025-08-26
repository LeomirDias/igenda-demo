"use client";

import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getUserSubscriptionData } from "@/actions/get-user-subscription-data";
import { validateSubscription } from "@/actions/validate-subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ValidSubscriptionLoading = () => {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<string>("");

    const { execute: executeValidation } = useAction(validateSubscription, {
        onSuccess: () => {
            setStatus("success");
            toast.success("Assinatura validada com sucesso!");
            // Redirecionar após 2 segundos para mostrar o sucesso
            setTimeout(() => {
                router.push("/dashboard");
            }, 3000);
        },
        onError: (error) => {
            console.error("Erro na validação:", error);
            setStatus("error");
            setError(error.error?.serverError || "Erro ao validar assinatura");
            toast.error("Erro ao validar assinatura");
        },
    });

    const { execute: executeGetUserData } = useAction(getUserSubscriptionData, {
        onSuccess: (userData) => {
            // Com os dados do usuário, executar a validação
            if (userData.data) {
                executeValidation({
                    email: userData.data.subscriptionEmail || "",
                    phone: userData.data.subscriptionPhone || "",
                    docNumber: userData.data.subscriptionDocNumber || "",
                    subscriptionStatus: userData.data.subscriptionSubscriptionStatus || "",
                });
            } else {
                console.error("Dados do usuário não encontrados");
                setStatus("error");
                setError("Dados do usuário não encontrados");
            }
        },
        onError: (error) => {
            console.error("Erro ao buscar dados do usuário:", error);
            setStatus("error");
            setError(error.error?.serverError || "Erro ao buscar dados do usuário");
            toast.error("Erro ao buscar dados do usuário");
        },
    });

    useEffect(() => {
        // Simular um processo de carregamento e depois buscar os dados do usuário
        const timer = setTimeout(() => {
            executeGetUserData();
        }, 3000); // Aguardar 3 segundos para simular o processo

        return () => clearTimeout(timer);
    }, [executeGetUserData]);

    const renderContent = () => {
        switch (status) {
            case "loading":
                return (
                    <>
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                            <div className="text-center">
                                <h3 className="text-lg font-semibold">Validando sua assinatura...</h3>
                                <p className="text-sm text-muted-foreground">
                                    Estamos verificando os dados da sua assinatura. Por favor, aguarde.
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                <span className="text-sm text-muted-foreground">Verificando dados do usuário...</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                <span className="text-sm text-muted-foreground">Validando assinatura...</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                <span className="text-sm text-muted-foreground">Atualizando perfil...</span>
                            </div>
                        </div>
                    </>
                );
            case "success":
                return (
                    <div className="flex flex-col items-center space-y-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-green-600">Assinatura validada com sucesso!</h3>
                            <p className="text-sm text-muted-foreground">
                                Redirecionando para o dashboard...
                            </p>
                        </div>
                    </div>
                );
            case "error":
                return (
                    <div className="flex flex-col items-center space-y-4">
                        <XCircle className="h-16 w-16 text-red-500" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-red-600">Erro na validação</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {error}
                            </p>
                            <div className="space-y-2">
                                <Button
                                    onClick={() => {
                                        setStatus("loading");
                                        setError("");
                                        // Tentar novamente
                                        setTimeout(() => {
                                            executeGetUserData();
                                        }, 1000);
                                    }}
                                    className="w-full"
                                >
                                    Tentar novamente
                                </Button>
                                <Button
                                    onClick={() => router.push("/support")}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Suporte iGenda
                                </Button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Validação de Assinatura</CardTitle>
                    <CardDescription>
                        {status === "loading"
                            ? "Processando sua solicitação..."
                            : status === "success"
                                ? "Processo concluído com sucesso!"
                                : "Ocorreu um erro durante o processo"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default ValidSubscriptionLoading;
