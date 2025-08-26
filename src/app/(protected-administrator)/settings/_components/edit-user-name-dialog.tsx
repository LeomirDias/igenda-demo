import { Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpdateUserForm from "./update-user-form";

interface EditUserNameDialogProps {
  user: { id: string; name: string };
}

const EditUserNameDialog = ({ user }: EditUserNameDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Editar nome">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <UpdateUserForm user={user} onSuccess={() => setOpen(false)} />
    </Dialog>
  );
};

export default EditUserNameDialog;
