import {
  EditIcon,
  MessageSquareMore,
  MoreVerticalIcon,
  Trash2,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteClient } from "@/actions/delete-clients";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clientsTable } from "@/db/schema";

import UpsertClientForm from "./upsert-client-form";

interface ClientTableActionsProps {
  client: typeof clientsTable.$inferSelect;
}

const TableClientActions = ({ client }: ClientTableActionsProps) => {
  const [upsertDialgoIsOpen, setUpsertDialgoIsOpen] = useState(false);
  const [deleteAlertDialogIsOpen, setDeleteAlertDialogIsOpen] = useState(false);

  const { execute: executeDeleteClient, status: deleteClientStatus } =
    useAction(deleteClient, {
      onSuccess: () => {
        toast.success("Cliente excluído com sucesso!");
        setDeleteAlertDialogIsOpen(false);
      },
      onError: (error) => {
        console.error("Erro ao excluir cliente:", error);
        toast.error("Erro ao excluir cliente. Tente novamente.");
      },
    });

  const handleDeleteClient = () => {
    executeDeleteClient({ id: client.id });
  };

  return (
    <>
      <Dialog open={upsertDialgoIsOpen} onOpenChange={setUpsertDialgoIsOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Ações para {client.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href={`https://wa.me/${client.phoneNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageSquareMore className="h-4 w-4" />
                Entrar em contato
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setUpsertDialgoIsOpen(true)}>
              <EditIcon className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteAlertDialogIsOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <UpsertClientForm
          client={client}
          onSuccess={() => setUpsertDialgoIsOpen(false)}
        />
      </Dialog>
      <AlertDialog
        open={deleteAlertDialogIsOpen}
        onOpenChange={setDeleteAlertDialogIsOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o
              cliente
              <span className="font-semibold"> {client.name} </span>e removerá
              seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteClientStatus === "executing"}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              disabled={deleteClientStatus === "executing"}
            >
              {deleteClientStatus === "executing" ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TableClientActions;
