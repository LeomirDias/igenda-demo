import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks"
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { upsertStockMovement } from "@/actions/upsert-stock-movement";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productsTable } from "@/db/schema";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    productId: z.string().min(1, { message: "Produto é obrigatório." }),
    movementType: z.enum(["entry", "exit"], { required_error: "Tipo de movimento é obrigatório." }),
    quantity: z.string().trim().min(1, { message: "Quantidade é obrigatória." }).refine(value => !isNaN(Number(value)) && Number(value) > 0, { message: "Quantidade deve ser um número maior que 0." }),
    reason: z.string().trim().optional(),
})

interface UpsertMovementStockFormProps {
    products: (typeof productsTable.$inferSelect)[];
    onSuccess?: () => void;
}

const UpsertMovementStockForm = ({ products, onSuccess }: UpsertMovementStockFormProps) => {
    const [openProductCombobox, setOpenProductCombobox] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        shouldUnregister: true,
        resolver: zodResolver(formSchema),
        defaultValues: {
            productId: "",
            movementType: "entry",
            quantity: "",
            reason: "",
        }
    })

    const upsertStockMovementAction = useAction(upsertStockMovement, {
        onSuccess: () => {
            toast.success("Movimento de estoque registrado com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: (error) => {
            toast.error("Erro ao registrar movimento de estoque.");
            console.log(error);
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        upsertStockMovementAction.execute({
            productId: values.productId,
            movementType: values.movementType,
            quantity: Number(values.quantity),
            reason: values.reason,
        });
    };

    return (
        <DialogContent>
            <DialogTitle>Adicionar movimento de estoque</DialogTitle>
            <DialogDescription>Registre uma entrada ou saída de produtos no estoque.</DialogDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="productId"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Produto</FormLabel>
                                <Popover open={openProductCombobox} onOpenChange={setOpenProductCombobox}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openProductCombobox}
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? products.find(
                                                        (product) => product.id === field.value
                                                    )?.name
                                                    : "Selecione um produto"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar produto..." />
                                            <CommandList>
                                                <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                                <CommandGroup>
                                                    {products.map((product) => (
                                                        <CommandItem
                                                            value={product.name}
                                                            key={product.id}
                                                            onSelect={() => {
                                                                form.setValue("productId", product.id)
                                                                setOpenProductCombobox(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    product.id === field.value
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {product.name} - Estoque: {product.quantity_in_stock || 0}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="movementType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de movimento</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo de movimento" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="entry">Entrada</SelectItem>
                                        <SelectItem value="exit">Saída</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Entrada: adiciona produtos ao estoque | Saída: remove produtos do estoque
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantidade</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Digite a quantidade"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Motivo (opcional)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ex: Compra, Venda, Ajuste de estoque, etc."
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Descreva o motivo do movimento para fins de controle
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <Button type="submit" disabled={upsertStockMovementAction.isPending}>
                            {upsertStockMovementAction.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Registrar movimento"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}

export default UpsertMovementStockForm;