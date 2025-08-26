"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import ClientsForms from "./clients-forms";



const OpenClientsTermsButton = ({ className = "" }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className={`text-primary ${className}`}>
          Termos de uso
        </Button>
      </DialogTrigger>
      <ClientsForms />
    </Dialog>
  );
};

export default OpenClientsTermsButton;
