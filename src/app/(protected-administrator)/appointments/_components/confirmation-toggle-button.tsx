"use client";

import { Hand, Loader2, MonitorCheck } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { updateEnterprise } from "@/actions/update-enterprise-appointment-confirmation";
import { Button } from "@/components/ui/button";

interface ConfirmationToggleButtonProps {
  enterpriseId: string;
  currentConfirmation: "manual" | "automatic";
}

export function ConfirmationToggleButton({
  enterpriseId,
  currentConfirmation,
}: ConfirmationToggleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<"manual" | "automatic">(
    currentConfirmation,
  );

  const { execute } = useAction(updateEnterprise, {
    onSuccess: () => {
      toast.success(
        `Confirmação de agendamentos alterada!`,
      );
    },
    onError: (error) => {
      toast.error("Erro ao alterar confirmação");
      console.error(error);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleToggle = () => {
    setIsLoading(true);
    const newConfirmation = confirmation === "manual" ? "automatic" : "manual";
    setConfirmation(newConfirmation);

    execute({
      id: enterpriseId,
      confirmation: newConfirmation,
    });
  };

  const isAutomatic = confirmation === "automatic";

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      className="text-primary hover:bg-primary hover:border-primary flex cursor-pointer items-center border-white bg-white text-xs hover:text-white sm:text-sm"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isAutomatic ? (
        <MonitorCheck />
      ) : (
        <Hand />
      )}
      <span className="hidden lg:inline">
        {isAutomatic ? "Confirmação: Automática" : "Confirmação: Manual"}
      </span>
    </Button>
  );
}
