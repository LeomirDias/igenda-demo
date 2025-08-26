"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import Forms from "./forms";

const OpenTermsButton = ({ className = "" }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className={`text-white font-normal ${className}`}>
          Termos de uso
        </Button>
      </DialogTrigger>
      <Forms />
    </Dialog>
  );
};

export default OpenTermsButton;
