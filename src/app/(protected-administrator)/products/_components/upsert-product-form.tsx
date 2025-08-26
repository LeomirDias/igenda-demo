import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks"
import React from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { getProductCategories } from "@/actions/get-product-categories";
import { upsertProduct } from "@/actions/upsert-product";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { productsTable } from "@/db/schema";
import { cn } from "@/lib/utils";



const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Nome do serviço é obrigatório." }),
    description: z.string().trim().optional(),
    category: z.string().trim().min(1, { message: "Categoria é obrigatório." }),
    brand: z.string().trim().min(1, { message: "Marca é obrigatório." }),
    quantity: z.string().trim().min(1, { message: "Quantidade é obrigatório." }).refine(value => !isNaN(Number(value)) && Number(value) >= 0, { message: "Quantidade deve ser um número válido." }),
    productPriceInCents: z.number().min(1, { message: "Preço do produto é obrigatório." }),
    is_consumable: z.boolean().optional(),
})

interface upsertProductoForm {
    product?: typeof productsTable.$inferSelect;
    onSuccess?: () => void;
}

const UpsertProductForm = ({ product, onSuccess }: upsertProductoForm) => {
    const [categories, setCategories] = React.useState<string[]>([]);
    const [openCategoryCombobox, setOpenCategoryCombobox] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        shouldUnregister: true,
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            category: product?.category || "",
            brand: product?.brand || "",
            quantity: product?.quantity?.toString() || "",
            productPriceInCents: product ? product.productPriceInCents / 100 : 0,
            is_consumable: product?.is_consumable || false,
        }
    })

    const getCategoriesAction = useAction(getProductCategories, {
        onSuccess: (data) => {
            if (data?.data) {
                setCategories(data.data);
            }
        },
        onError: () => {
            toast.error("Erro ao buscar categorias.");
        }
    });

    React.useEffect(() => {
        getCategoriesAction.execute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const upsertProductoAction = useAction(upsertProduct, {
        onSuccess: () => {
            toast.success("Produto adicionado com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: (error) => {
            toast.error(`Erro ao adicionar produto.`);
            console.log(error);
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        upsertProductoAction.execute({
            ...values,
            id: product?.id,
            quantity: Number(values.quantity),
            productPriceInCents: Math.round(values.productPriceInCents * 100),
        });
    };

    return (
        <DialogContent>
            <DialogTitle>{product ? product.name : "Adicionar produto"}</DialogTitle>
            <DialogDescription>{product ? "Edite as informações desse produto." : "Adicione um novo produto à sua empresa!"}</DialogDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nome do produto
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Digite o nome do produto" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Descrição
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Digite a descrição do produto" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Categoria</FormLabel>
                                <Popover open={openCategoryCombobox} onOpenChange={setOpenCategoryCombobox}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openCategoryCombobox}
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? categories.find(
                                                        (category) => category === field.value
                                                    ) || "Criar nova: " + field.value
                                                    : "Selecione ou crie uma categoria"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command shouldFilter={false}>
                                            <CommandInput
                                                placeholder="Buscar categoria ou criar nova..."
                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const value = (e.target as HTMLInputElement).value;
                                                    field.onChange(value);
                                                }}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {field.value?.length > 0 ? `Criar nova categoria: "${field.value}"` : "Nenhuma categoria encontrada."}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {categories.map((category) => (
                                                        <CommandItem
                                                            value={category}
                                                            key={category}
                                                            onSelect={() => {
                                                                form.setValue("category", category)
                                                                setOpenCategoryCombobox(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    category === field.value
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {category}
                                                        </CommandItem>
                                                    ))}
                                                    {field.value && !categories.find(cat => cat === field.value) && (
                                                        <CommandItem
                                                            value={field.value}
                                                            key={field.value}
                                                            onSelect={() => {
                                                                form.setValue("category", field.value);
                                                                setOpenCategoryCombobox(false);
                                                            }}
                                                            className="text-sm text-muted-foreground"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    "opacity-0" // Always hidden for "create new"
                                                                )}
                                                            />
                                                            Criar nova: &quot;{field.value}&quot;
                                                        </CommandItem>
                                                    )}
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
                        name="brand"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Marca
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Digite a marca do produto" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Quantidade
                                </FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Digite a quantidade em estoque" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="productPriceInCents"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Preço de compra do produto
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
                    <FormField
                        control={form.control}
                        name="is_consumable"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Produto consumível
                                    </FormLabel>
                                    <FormDescription>
                                        Marque esta opção se este produto for consumível durante os serviços
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <Button type="submit" disabled={upsertProductoAction.isPending}>
                            {upsertProductoAction.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Cadastrar produto"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}

export default UpsertProductForm;