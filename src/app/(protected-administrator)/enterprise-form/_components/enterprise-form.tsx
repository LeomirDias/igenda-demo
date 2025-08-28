"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HelpCircle, Loader2, Upload } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { createEnterprise } from "@/actions/create-enterprise";
import { uploadEnterpriseProfilePicture } from "@/actions/upsert-enterprise-profile-picture";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatName } from "@/helpers/format-name";
import { useIsMobile } from "@/hooks/use-mobile";

import { enterpriseSpecialty } from "../_constants";

const enterpriseFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome da empresa é obrigatório." }),
  specialty: z
    .string()
    .trim()
    .min(1, { message: "Área de atuação da empresa é obrigatória." }),
  phoneNumber: z
    .string()
    .trim()
    .min(11, { message: "Telefone da empresa é obrigatório." }),
  register: z
    .string()
    .trim()
    .min(11, {
      message: "CPF do responsável ou CNPJ da empresa é obrigatório.",
    })
    .max(14, { message: "CNPJ deve conter no máximo 14 caracteres." }),
  instagramURL: z
    .string()
    .trim()
    .url({ message: "URL do Instagram inválida." })
    .or(z.literal("")),
  cep: z
    .string()
    .trim()
    .min(8, { message: "CEP deve conter 8 dígitos." })
    .max(9, { message: "CEP deve conter no máximo 9 caracteres com hífen." }),
  address: z.string().trim().min(1, { message: "Logradouro é obrigatório." }),
  number: z.string().trim().min(1, { message: "Número é obrigatório." }),
  complement: z.string().trim().optional(),
  city: z.string().trim().min(1, { message: "Cidade é obrigatória." }),
  state: z.string().trim().min(2, {
    message: "Estado é obrigatório e deve ter no mínimo 2 caracteres.",
  }),
  interval: z.string(),
});

const EnterpriseForm = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File>();
  const [avatarPreview, setAvatarPreview] = useState<string>();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const form = useForm<z.infer<typeof enterpriseFormSchema>>({
    resolver: zodResolver(enterpriseFormSchema),
    defaultValues: {
      name: "",
      specialty: "",
      phoneNumber: "",
      register: "",
      instagramURL: "",
      cep: "",
      address: "",
      number: "",
      complement: "",
      city: "",
      state: "",
      interval: "30"
    },
  });

  const cep = form.watch("cep");

  // Usar um valor padrão para evitar problemas de hidratação
  const isMobileSafe = isMobile ?? false;

  useEffect(() => {
    const fetchAddressFromCep = async (cep: string) => {
      const formattedCep = cep.replace(/\D/g, "");
      if (formattedCep.length === 8) {
        setIsCepLoading(true);
        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${formattedCep}/json/`,
          );
          if (!response.ok) {
            throw new Error("CEP não encontrado");
          }
          const data = await response.json();
          if (data.erro) {
            toast.error("CEP não encontrado. Verifique o CEP digitado.");
            form.setValue("address", "", { shouldValidate: true });
            form.setValue("city", "", { shouldValidate: true });
            form.setValue("state", "", { shouldValidate: true });
            form.setValue("complement", "", { shouldValidate: true });
          } else {
            form.setValue("address", data.logradouro, { shouldValidate: true });
            form.setValue("city", data.localidade, { shouldValidate: true });
            form.setValue("state", data.uf, { shouldValidate: true });
            toast.success("Endereço preenchido automaticamente!");
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
          toast.error("Erro ao buscar CEP. Tente novamente.");
          form.setValue("address", "", { shouldValidate: true });
          form.setValue("city", "", { shouldValidate: true });
          form.setValue("state", "", { shouldValidate: true });
        } finally {
          setIsCepLoading(false);
        }
      } else if (formattedCep.length > 0 && formattedCep.length < 8) {
        form.setValue("address", "", { shouldValidate: false });
        form.setValue("city", "", { shouldValidate: false });
        form.setValue("state", "", { shouldValidate: false });
      }
    };

    if (cep) {
      fetchAddressFromCep(cep);
    }
  }, [cep, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: z.infer<typeof enterpriseFormSchema>) => {
    try {
      // Limpar o telefone removendo caracteres especiais e adicionar código do país
      const cleanPhoneNumber = `55${data.phoneNumber.replace(/\D/g, "")}`;

      const result = await createEnterprise(
        data.name,
        data.specialty,
        cleanPhoneNumber,
        data.register,
        data.instagramURL || "",
        data.cep,
        data.address,
        data.number,
        data.complement || "",
        data.city,
        data.state,
        data.interval,
      );

      // Se houver um arquivo de avatar, faz o upload
      if (avatarFile) {
        setIsUploadingAvatar(true);
        try {
          const formData = new FormData();
          formData.append("photo", avatarFile);

          // Faz upload e atualiza avatar direto no banco
          await uploadEnterpriseProfilePicture(formData, result.enterpriseId);
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          toast.error(
            "Erro ao enviar imagem. A empresa foi criada com sucesso."
          );
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      router.push("/valid-subscription");
    } catch (error) {
      if (isRedirectError(error)) {
        return;
      }
      console.error("Erro ao cadastrar empresa:", error);
      toast.error("Erro ao cadastrar empresa. Por favor, tente novamente.");
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`${isMobileSafe ? "space-y-3" : "space-y-4"} pb-2`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="bg-muted relative mx-auto h-24 w-24 overflow-hidden rounded-full sm:mx-0">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Upload className="text-muted-foreground h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <FormLabel>Foto da Empresa</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
              />
              {isUploadingAvatar && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    Enviando imagem...
                  </span>
                </div>
              )}
            </div>
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nome <span className="text-red-300">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o nome da sua empresa"
                    className="text-sm"
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
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Área de atuação <span className="text-red-300">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Selecione sua área de atuação..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {enterpriseSpecialty.map((specialty) => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
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
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contato <span className="text-red-300">*</span>
                </FormLabel>
                <FormControl>
                  <PatternFormat
                    format="(##) #####-####"
                    mask="_"
                    placeholder="Digite o número de contato da sua empresa"
                    customInput={Input}
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="register"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Registro (CPF ou CNPJ) <span className="text-red-300">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o CNPJ ou CPF do responsável pela empresa"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  CEP <span className="text-red-300">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Digite o CEP"
                      className="text-sm"
                      {...field}
                    />
                    {isCepLoading && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>
                    Logradouro <span className="text-red-300">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Rua das Palmeiras"
                      className="text-sm"
                      {...field}
                      disabled={isCepLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Número <span className="text-red-300">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 123"
                      className="text-sm"
                      {...field}
                      id="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="complement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Complemento{" "}
                  <span className="text-muted-foreground text-xs">
                    (Opcional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Apto 101, Bloco B"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Cidade <span className="text-red-300">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: São Paulo"
                      className="text-sm"
                      {...field}
                      disabled={isCepLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Estado <span className="text-red-300">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: SP"
                      className="text-sm"
                      {...field}
                      disabled={isCepLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="instagramURL"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Instagram{" "}
                  <span className="text-muted-foreground text-xs">
                    (Opcional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Cole aqui o link do Instagram da sua empresa..."
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p>Intervalo de horário de atendimento</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                              aria-label="Ajuda sobre intervalo de horário"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" align="start" className="max-w-xs bg-background border-border shadow-lg text-white">
                            <p>
                              Define o tamanho dos slots de disponibilidade dos profissionais. Ex.: 30 min, 60 min. <br />
                              <br />Um serviço ocupa múltiplos slots conforme sua duração (ex.: Serviço de 2h ocupa 4 slots de 30 min). <br />
                              <br />Selecione esta opção de acordo com a sua estimativa de tempo de atendimento geral.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="texto-xs font-extrabold text-red-500">Atenção: essa configuração não pode ser alterada mais tarde.</span>
                  </div>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo de confirmação..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="flex-col gap-3 pt-4 sm:flex-row sm:gap-2 sm:pt-0">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isCepLoading || isUploadingAvatar}
              className="w-full sm:w-auto"
              variant="default"
            >
              {form.formState.isSubmitting || isCepLoading || isUploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Cadastrar empresa"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default EnterpriseForm;
