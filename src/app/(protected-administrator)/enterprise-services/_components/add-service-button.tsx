"use client";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertServiceForm from "./upsert-service-form";

const AddServiceButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="text-xs sm:text-sm">
          <Plus />
          <span className="hidden lg:inline">Adicionar serviço</span>
          <span className="lg:hidden">Adicionar</span>
        </Button>
      </DialogTrigger>
      <UpsertServiceForm onSuccess={() => setIsOpen(false)} />
    </Dialog>
  );
};

export default AddServiceButton;
