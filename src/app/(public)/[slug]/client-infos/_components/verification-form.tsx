"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { verifyCode } from "@/actions/client-verifications";
import { generateCode } from "@/actions/client-verifications/generate-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const verificationSchema = z.object({
    code: z.string().length(6, { message: "O código deve ter 6 dígitos" }),
});

interface VerificationFormProps {
    clientData: {
        name: string;
        phoneNumber: string;
    };
    isLogin: boolean;
}

const EXPIRATION_TIME = 5 * 60; // 5 minutos em segundos

const VerificationForm = ({ clientData }: VerificationFormProps) => {
    const router = useRouter();
    const params = useParams();
    const enterpriseSlug = params?.slug as string;
    const [timeLeft, setTimeLeft] = useState(EXPIRATION_TIME);
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const form = useForm<z.infer<typeof verificationSchema>>({
        resolver: zodResolver(verificationSchema),
        defaultValues: {
            code: "",
        },
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((time) => {
                if (time <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
                return time - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const normalizedPhone = clientData.phoneNumber.replace(/\D/g, "");
    const phoneNumberIntl = normalizedPhone.startsWith("55") ? normalizedPhone : `55${normalizedPhone}`;

    const handleResendCode = async () => {
        try {
            setIsResending(true);
            const result = await generateCode({
                phoneNumber: phoneNumberIntl,
                clientData: {
                    ...clientData,
                    phoneNumber: phoneNumberIntl,
                    enterpriseSlug,
                },
            });

            if (result?.data?.success) {
                toast.success("Novo código enviado para seu Whatsapp!");
                setTimeLeft(EXPIRATION_TIME);
                setCanResend(false);
            } else {
                toast.error("Erro ao reenviar código. Por favor, tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao reenviar código:", error);
            toast.error("Erro ao reenviar código. Por favor, tente novamente.");
        } finally {
            setIsResending(false);
        }
    };

    const verifyCodeAction = useAction(verifyCode, {
        onSuccess: async ({ data }) => {
            if (data?.success && data.client) {
                toast.success("Código verificado com sucesso!");
                router.push(`/${enterpriseSlug}/schedule`);
            } else {
                toast.error(data?.message || "Código inválido. Por favor, tente novamente.");
            }
        },
        onError: (error) => {
            console.error("Erro ao verificar código:", error);
            toast.error("Erro ao verificar código. Por favor, tente novamente.");
        },
    });

    const onSubmit = (values: z.infer<typeof verificationSchema>) => {
        verifyCodeAction.execute({
            phoneNumber: phoneNumberIntl,
            code: values.code,
            enterpriseSlug,
        });
    };

    return (
        <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                    <CardHeader>
                        <CardTitle>Verificação</CardTitle>
                        <CardDescription>
                            Digite o código de 6 dígitos enviado para seu Whatsapp.
                            {timeLeft > 0 && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    O código expira em: {formatTime(timeLeft)}
                                </p>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código de Verificação</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o código..."
                                            maxLength={6}
                                            autoComplete="off"
                                            type="text"
                                            inputMode="numeric"
                                            value={field.value}
                                            onChange={(e) => {
                                                // Permite apenas números
                                                const value = e.target.value.replace(/\D/g, '');
                                                if (value.length <= 6) {
                                                    field.onChange(value);
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={verifyCodeAction.isPending}>
                            {verifyCodeAction.isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>
                            ) : (
                                "Verificar"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={!canResend || isResending}
                            onClick={handleResendCode}
                        >
                            {isResending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reenviando...</>
                            ) : canResend ? (
                                "Reenviar código"
                            ) : (
                                `Aguarde ${formatTime(timeLeft)} para reenviar`
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
};

export default VerificationForm; 