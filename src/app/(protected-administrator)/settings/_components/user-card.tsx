"use client";
import { User } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteUser } from "@/actions/delete-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import EditUserNameDialog from "./edit-user-name-dialog";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const UserCard = ({ user }: UserCardProps) => {

  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { execute: executeDeleteUser } = useAction(deleteUser, {
    onSuccess: () => {
      toast.success("Conta excluída com sucesso!");
      window.location.href = "/authentication";
    },
    onError: () => {
      toast.error(
        "Não é possível excluir a conta com uma assinatura ativa. Cancele sua assinatura antes.",
      );
    },
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    await executeDeleteUser();
    setIsDeleting(false);
    setConfirmText("");
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="text-primary h-5 w-5" />
          <CardTitle className="flex items-center gap-2">
            Dados de cadastro
            <span>
              <EditUserNameDialog user={{ id: user.id, name: user.name }} />
            </span>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-1">
          <p className="text-md">
            <span className="font-semibold">Nome: </span> {user.name}
          </p>
          <p className="text-md">
            <span className="font-semibold">Email: </span>
            {user.email}
          </p>
        </div>
      </CardContent>

      <div className="flex flex-col gap-2 p-4 pt-0">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Excluir conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir conta</DialogTitle>
              <DialogDescription>
                Esta ação é{" "}
                <span className="text-destructive font-bold">permanente</span> e
                irá excluir{" "}
                <span className="font-bold">
                  todas as informações da sua conta e da empresa criada
                </span>
                . Para confirmar, digite{" "}
                <span className="font-mono font-bold">EXCLUIR</span> no campo
                abaixo.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Digite EXCLUIR para confirmar"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-2"
              autoFocus
            />
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmText !== "EXCLUIR" || isDeleting}
                className="w-full"
              >
                {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default UserCard;
