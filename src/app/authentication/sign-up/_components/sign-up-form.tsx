"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { checkSubscriptionByEmail } from "@/actions/check-subscription-by-email";
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
import { formatName } from "@/helpers/format-name";
import { authClient } from "@/lib/auth-client";

const registerSchema = z.object({
  name: z.string().trim().min(1, { message: "O nome é obrigatório" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "E-mail é obrigatório." })
    .email({ message: "Email inválido" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

const SignUpForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const pendingValuesRef = useRef<z.infer<typeof registerSchema> | null>(null);

  const { execute: executeCheckSubscription } = useAction(
    checkSubscriptionByEmail,
    {
      onSuccess: async ({ data }) => {
        if (!data?.exists) {
          toast.error("E-mail não encontrado em nossa base de assinantes.");
          return;
        }

        const values = pendingValuesRef.current;
        if (!values) return;

        await authClient.signUp.email(
          {
            email: values.email,
            password: values.password,
            name: formatName(values.name),
            callbackURL: "/dashboard",
          },
          {
            onSuccess: () => {
              router.push("/dashboard");
              toast.success(
                "Conta criada com sucesso!",
              );
            },
            onError: (ctx) => {
              if (ctx.error.code === "USER_ALREADY_EXISTS") {
                toast.error("Já existe uma conta com este e-mail.");
                return;
              }
              toast.error("Erro ao criar conta. Tente outro e-mail.");
            },
          },
        );
      },
      onError: () => {
        toast.error("Não foi possível validar a assinatura. Tente novamente.");
      },
    },
  );

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    pendingValuesRef.current = values;
    executeCheckSubscription({ email: values.email });
  }

  const handleGoogleSignUp = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <Card className="border-none bg-gradient-to-br from-[#347d61] to-[#88b94d] backdrop-blur-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-bold text-white">
              Cadastro
            </CardTitle>
            <CardDescription className="text-center text-white/80">
              Crie uma conta para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu nome..."
                      className="border-none bg-[#191919] text-white placeholder:text-white/70 focus:border-[#424242] focus:ring-[#424242]"
                      {...field}
                      onBlur={(e) => {
                        const formatted = formatName(e.target.value);
                        if (formatted !== field.value) {
                          field.onChange(formatted);
                        }
                        field.onBlur();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">E-mail<span className="text-red-300 text-bold">(Deve ser o mesmo e-mail utilizado na assinatura)</span>

                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu e-mail..."
                      className="border-none bg-[#191919] text-white placeholder:text-white/70 focus:border-[#424242] focus:ring-[#424242]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Senha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite sua senha..."
                      type="password"
                      className="border-none bg-[#191919] text-white placeholder:text-white/70 focus:border-[#424242] focus:ring-[#424242]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-3">
              <Button
                type="submit"
                className="w-full border-green-600 bg-green-600 text-white hover:border-green-900 hover:bg-green-900"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Criar conta"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full border-green-600 bg-green-600 text-white hover:border-green-900 hover:bg-green-900"
                type="button"
                onClick={handleGoogleSignUp}
              >
                <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Cadastrar com Google
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SignUpForm;
