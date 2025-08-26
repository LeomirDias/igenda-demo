import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form";
import { NumericFormat } from 'react-number-format';
import { toast } from "sonner";
import z from "zod";

import { upsertService } from "@/actions/upsert-services";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { servicesTable } from "@/db/schema";
import { formatName } from "@/helpers/format-name";

const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Nome do serviço é obrigatório." }),
    servicePrice: z.number().min(1, { message: "Preço do serviço é obrigatório" }),
    durationInMinutes: z.number().min(1, { message: "Duração do serviço é obrigatória" }),
})

interface upsertServiceFormProps {
    service?: typeof servicesTable.$inferSelect;
    onSuccess?: () => void;
}

const UpsertServiceForm = ({ service, onSuccess }: upsertServiceFormProps) => {

    const form = useForm<z.infer<typeof formSchema>>({
        shouldUnregister: true,
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: service?.name || "",
            servicePrice: service ? service.servicePriceInCents / 100 : 0, // Convert cents to float
            durationInMinutes: service ? service.durationInMinutes : 0,
        }
    })

    const upsertServiceAction = useAction(upsertService, {
        onSuccess: () => {
            toast.success(service ? "Serviço atualizado com sucesso!" : "Serviço adicionado com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: () => {
            toast.error(`Erro ao adicionar serviço.`);
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        upsertServiceAction.execute({
            ...values,
            id: service?.id,
            servicePriceInCents: Math.round(values.servicePrice * 100),
            durationInMinutes: values.durationInMinutes,
        });
    };

    return (
        <DialogContent>
            <DialogTitle>{service ? service.name : "Adicionar serviço"}</DialogTitle>
            <DialogDescription>{service ? "Edite as informações desse serviço." : "Adicione um novo serviço à sua empresa!"}</DialogDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nome do serviço
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Digite o nome do serviço"
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
                        name="durationInMinutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Duração do serviço
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Digite a duração do serviço"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="servicePrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Preço do serviço
                                </FormLabel>
                                <NumericFormat
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value.floatValue);
                                    }}
                                    decimalScale={2}
                                    fixedDecimalScale
                                    decimalSeparator=","
                                    allowNegative={false}
                                    allowLeadingZeros={false}
                                    thousandSeparator="."
                                    customInput={Input}
                                    prefix="R$"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <Button type="submit" disabled={form.formState.isSubmitting || upsertServiceAction.isPending}>
                            {form.formState.isSubmitting || upsertServiceAction.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : service ? (
                                "Editar serviço"
                            ) : (
                                "Cadastrar serviço"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}

export default UpsertServiceForm;