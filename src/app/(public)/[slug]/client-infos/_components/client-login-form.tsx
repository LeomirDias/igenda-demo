"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { generateCode } from "@/actions/client-verifications/generate-code";
import { validatePhone } from "@/actions/client-verifications/validate-phone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import VerificationForm from "./verification-form";

const clientLoginSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(11, { message: "Telefone deve ter 11 dígitos" }),
});

const ClientLoginForm = () => {
  const params = useParams();
  const enterpriseSlug = params?.slug as string;
  const [showVerification, setShowVerification] = useState(false);
  const [clientData, setClientData] = useState<{
    name: string;
    phoneNumber: string;
  } | null>(null);

  const form = useForm<z.infer<typeof clientLoginSchema>>({
    resolver: zodResolver(clientLoginSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const validatePhoneAction = useAction(validatePhone, {
    onSuccess: async ({ data }) => {
      if (data?.success && data.client) {
        try {
          // Normaliza o telefone para formato internacional
          const normalizedPhone = data.client.phoneNumber.replace(/\D/g, "");
          const phoneNumberIntl = normalizedPhone.startsWith("55") ? normalizedPhone : `55${normalizedPhone}`;

          // Gera o código de verificação
          const result = await generateCode({
            phoneNumber: phoneNumberIntl,
            clientData: {
              name: data.client.name,
              phoneNumber: phoneNumberIntl,
              enterpriseSlug,
            },
          });

          if (result?.data?.success) {
            setClientData({
              name: data.client.name,
              phoneNumber: phoneNumberIntl,
            });
            setShowVerification(true);
            toast.success("Código de verificação enviado para seu Whatsapp!");
          } else {
            toast.error(
              "Erro ao gerar código de verificação. Por favor, tente novamente.",
            );
          }
        } catch (error) {
          console.error("Erro ao gerar código:", error);
          toast.error(
            "Erro ao gerar código de verificação. Por favor, tente novamente.",
          );
        }
      } else {
        toast.error(
          data?.message ||
          "Cliente não encontrado com este número de telefone. Por favor, cadastre-se.",
        );
      }
    },
    onError: (error) => {
      console.error("Erro ao validar telefone:", error);
      toast.error(
        "Erro ao validar telefone. Por favor informe o telefone cadastrado.",
      );
    },
  });

  const onSubmit = (values: z.infer<typeof clientLoginSchema>) => {
    validatePhoneAction.execute({
      phoneNumber: `55${values.phoneNumber.replace(/\D/g, "")}`,
      enterpriseSlug,
    });
  };

  if (showVerification && clientData) {
    return <VerificationForm clientData={clientData} isLogin={true} />;
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Faça login na sua conta para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground select-none">+55</span>
                      <Input
                        type="tel"
                        placeholder="11999999999"
                        value={field.value}
                        onChange={(e) => {
                          // Aceita apenas números
                          field.onChange(e.target.value.replace(/\D/g, ""));
                        }}
                        maxLength={11}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={validatePhoneAction.isPending}
            >
              {validatePhoneAction.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ClientLoginForm;
