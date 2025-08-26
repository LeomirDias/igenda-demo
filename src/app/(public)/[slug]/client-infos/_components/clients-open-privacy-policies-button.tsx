"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import ClientsPrivacyPolicies from "./clients-privacy-policies";



const OpenClientsPrivacyPoliciesButton = ({
  className = "",
}: {
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className={`text-primary ${className}`}>
          Política de privacidade
        </Button>
      </DialogTrigger>
      <ClientsPrivacyPolicies />
    </Dialog>
  );
};

export default OpenClientsPrivacyPoliciesButton;
