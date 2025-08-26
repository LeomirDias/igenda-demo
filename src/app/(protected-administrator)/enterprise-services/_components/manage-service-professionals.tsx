"use client";

import { Check, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
    associateProfessionalsToService,
    getProfessionalsByService,
} from "@/actions/associate-professionals-to-service";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { professionalsTable, servicesTable } from "@/db/schema";

interface ManageServiceProfessionalsProps {
    service: typeof servicesTable.$inferSelect;
    allProfessionals: (typeof professionalsTable.$inferSelect)[];
    onSuccess?: () => void;
}

export default function ManageServiceProfessionals({
    service,
    allProfessionals,
    onSuccess
}: ManageServiceProfessionalsProps) {
    const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);
    // const [setAssociatedProfessionals] = useState<(typeof professionalsTable.$inferSelect)[]>([]);

    const { execute: fetchProfessionals } = useAction(getProfessionalsByService, {
        onSuccess: ({ data }) => {
            if (!data) return;
            // setAssociatedProfessionals(data);
            setSelectedProfessionals(data.map(p => p.id));
        },
        onError: (error) => {
            toast.error(error.error?.serverError || "Erro ao buscar profissionais");
        }
    });

    const associateProfessionalsAction = useAction(associateProfessionalsToService, {
        onSuccess: () => {
            toast.success("Profissionais associados atualizados com sucesso!");
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.error?.serverError || "Erro ao associar profissionais");
        }
    });

    // const { execute: removeProfessional } = useAction(removeProfessionalFromService, {
    //     onSuccess: () => {
    //         fetchProfessionals({ serviceId: service.id });
    //         toast.success("Profissional removido com sucesso!");
    //     },
    //     onError: (error) => {
    //         toast.error(error.error?.serverError || "Erro ao remover profissional");
    //     }
    // });

    useEffect(() => {
        if (service.id) {
            fetchProfessionals({ serviceId: service.id });
        }
    }, [service.id, fetchProfessionals]);

    const handleToggleProfessional = (professionalId: string) => {
        setSelectedProfessionals(current => {
            if (current.includes(professionalId)) {
                return current.filter(id => id !== professionalId);
            }
            return [...current, professionalId];
        });
    };

    const handleSave = () => {
        associateProfessionalsAction.execute({
            serviceId: service.id,
            professionalIds: selectedProfessionals
        });
    };

    // const handleRemoveProfessional = (professionalId: string) => {
    //     removeProfessional({
    //         serviceId: service.id,
    //         professionalId
    //     });
    // };

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{service.name}</DialogTitle>
                <DialogDescription>Profissionais associados ao serviço</DialogDescription>
            </DialogHeader>

            <Command className="rounded-md border shadow-sm">
                <CommandInput placeholder="Buscar profissional..." />
                <CommandEmpty>Nenhum profissional associado ao serviço.</CommandEmpty>
                <CommandGroup>
                    <ScrollArea className="h-[200px]">
                        {allProfessionals.map((professional) => (
                            <CommandItem
                                key={professional.id}
                                onSelect={() => handleToggleProfessional(professional.id)}
                                className="flex items-center justify-between data-[selected=true]:bg-primary/10"
                            >
                                <span>{professional.name} - {professional.specialty}</span>
                                {selectedProfessionals.includes(professional.id) && (
                                    <Check className="h-4 w-4 text-green-500" />
                                )}
                            </CommandItem>
                        ))}
                    </ScrollArea>
                </CommandGroup>
            </Command>

            <DialogFooter>
                <Button onClick={handleSave} disabled={associateProfessionalsAction?.isPending}>
                    {associateProfessionalsAction?.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        "Salvar"
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}  