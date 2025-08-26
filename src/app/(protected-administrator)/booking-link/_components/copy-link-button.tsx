"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface CopyLinkButtonProps {
    link: string;
}

export const CopyLinkButton = ({ link }: CopyLinkButtonProps) => {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            toast.success("Link copiado!", {
            });
        } catch {
            toast.error("Não foi possível copiar o link. Tente novamente.");
        }
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            title="Copiar link"
            className="hover:bg-transparent hover:text-primary hover:border-primary"
        >
            <Copy className="h-4 w-4" />
        </Button>
    );
}; 