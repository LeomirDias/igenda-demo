"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import PrivacyPolicies from "./privacy-policies";

const OpenPrivacyPoliciesButton = ({
  className = "",
}: {
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className={`text-white font-normal ${className}`}>
          Política de privacidade
        </Button>
      </DialogTrigger>
      <PrivacyPolicies />
    </Dialog>
  );
};

export default OpenPrivacyPoliciesButton;
