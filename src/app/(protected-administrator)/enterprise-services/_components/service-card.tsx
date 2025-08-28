"use client";
import { Clock, DollarSign } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteService } from "@/actions/delete-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { professionalsTable, servicesTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";
import { formatDuration } from "@/helpers/time";

import ManageServiceProfessionals from "./manage-service-professionals";
import UpsertServiceForm from "./upsert-service-form";

interface ServiceCardProps {
  service: typeof servicesTable.$inferSelect;
  professionals: (typeof professionalsTable.$inferSelect)[];
}

const ServiceCard = ({ service, professionals }: ServiceCardProps) => {
  const [isUpsertServiceFormOpen, setIsUpsertServiceFormOpen] = useState(false);
  const [isManageProfessionalsOpen, setIsManageProfessionalsOpen] =
    useState(false);

  const deleteServiceAction = useAction(deleteService, {
    onSuccess: () => {
      toast.success("Serviço deletado com sucesso!");
    },
    onError: () => {
      toast.error(`Erro ao deletar serviço.`);
    },
  });

  const handleDeleteService = () => {
    if (!service?.id) {
      toast.error("Serviço não encontrado.");
      return;
    }
    deleteServiceAction.execute({ id: service?.id || "" });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col items-center text-center">
          <div className="min-w-0 flex-1">
            <h3 className="text-md font-semibold">{service.name}</h3>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2 px-4 sm:px-6">
        <Badge
          variant="outline"
          className="justify-start text-xs sm:text-sm md:text-base"
        >
          <Clock className="mr-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
          <span className="truncate">{formatDuration(service.durationInMinutes)}</span>
        </Badge>
        <Badge
          variant="outline"
          className="justify-start text-xs sm:text-sm md:text-base"
        >
          <DollarSign className="mr-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-5 lg:w-5" />
          <span className="truncate">
            {formatCurrencyInCents(service.servicePriceInCents)}
          </span>
        </Badge>
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col gap-2 px-4 pt-3 sm:px-6">
        <Dialog
          open={isUpsertServiceFormOpen}
          onOpenChange={setIsUpsertServiceFormOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full text-xs sm:text-sm md:text-base">
              Ver detalhes
            </Button>
          </DialogTrigger>
          <UpsertServiceForm
            service={service}
            onSuccess={() => setIsUpsertServiceFormOpen(false)}
          />
        </Dialog>

        <Dialog
          open={isManageProfessionalsOpen}
          onOpenChange={setIsManageProfessionalsOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="hover:bg-primary/5 w-full text-xs sm:text-sm md:text-base"
            >
              <p className="hidden lg:inline">Profissionais associados</p>
              <p className="lg:hidden">Prof. Associados</p>
            </Button>
          </DialogTrigger>
          <ManageServiceProfessionals
            service={service}
            allProfessionals={professionals}
            onSuccess={() => setIsManageProfessionalsOpen(false)}
          />
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full text-xs hover:border-red-300 hover:bg-red-200 hover:text-red-500 sm:text-sm md:text-base"
            >
              Excluir serviço
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base md:text-lg lg:text-xl">
                Tem certeza que deseja deletar esse serviço?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm md:text-base lg:text-lg">
                Essa ação não pode ser desfeita. Todos os dados relacionados a
                esse serviço serão perdidos permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-sm md:text-base">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteService}
                className="text-sm md:text-base"
              >
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
