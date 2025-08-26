import { EditIcon, MoreVerticalIcon, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteProduct } from "@/actions/delete-product";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { productsTable } from "@/db/schema";

import UpsertProductForm from "./upsert-product-form";

interface ProductsTableActionsProps {
    product: typeof productsTable.$inferSelect;
}

const TableProductActions = ({ product }: ProductsTableActionsProps) => {

    const [upsertDialgoIsOpen, setUpsertDialgoOpen] = useState(false);
    const [deleteAlertDialogIsOpen, setDeleteAlertDialogOpen] = useState(false);

    const { execute: executeDeleteProduct, status: deleteProductStatus } = useAction(deleteProduct, {
        onSuccess: () => {
            toast.success("Produto excluído com sucesso!");
            setDeleteAlertDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.error.serverError || "Erro ao excluir produto.");
            setDeleteAlertDialogOpen(false);
        }
    });

    const handleDelete = () => {
        executeDeleteProduct({ id: product.id });
    }

    return (
        <>
            <Dialog open={upsertDialgoIsOpen} onOpenChange={setUpsertDialgoOpen}>
                <AlertDialog open={deleteAlertDialogIsOpen} onOpenChange={setDeleteAlertDialogOpen}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVerticalIcon className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Ações para {product.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setUpsertDialgoOpen(true)}>
                                <EditIcon className="w-4 h-4 mr-2" />
                                Editar
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <UpsertProductForm
                        product={product}
                        onSuccess={() => setUpsertDialgoOpen(false)}
                    />
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={deleteProductStatus === 'executing'}>
                                {deleteProductStatus === 'executing' ? "Excluindo..." : "Excluir"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Dialog>
        </>
    );
}

export default TableProductActions;