"use client";
import { Calendar1Icon, Clock10Icon } from "lucide-react";
import Image from "next/image";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteProfessional } from "@/actions/delete-professional";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { professionalsTable } from "@/db/schema";

import { getAvailability } from "../helpers/availability";
import UpdateProfessionalForm from "./update-professional-form";

interface ProfessionalCardProps {
  professional: typeof professionalsTable.$inferSelect;
}

const ProfessionalCard = ({ professional }: ProfessionalCardProps) => {
  const [isUpsertPRofessionalFormOpen, setIsUpsertProfessionalFormOpen] =
    useState(false);

  const professionalInitials = professional.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  const availability = getAvailability(professional);

  const deleteProfessionalAction = useAction(deleteProfessional, {
    onSuccess: () => {
      toast.success("Profissional deletado com sucesso!");
    },
    onError: () => {
      toast.error(`Erro ao deletar profissional.`);
    },
  });

  const handleDeleteProfessional = () => {
    if (!professional?.id) {
      toast.error("Profissional não encontrado.");
      return;
    }
    deleteProfessionalAction.execute({ id: professional?.id || "" });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar className="border-border relative h-16 w-16 flex-shrink-0 rounded-full border-1 sm:h-16 sm:w-16 md:h-20 md:w-20">
            {professional.avatarImageURL ? (
              <Image
                src={professional.avatarImageURL}
                alt={professional.name}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-full"
              />
            ) : (
              <AvatarFallback className="border-border h-16 w-16 rounded-full text-sm sm:h-16 sm:w-16 md:h-20 md:w-20 md:text-lg lg:text-2xl">
                {professionalInitials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="text-md lg:text-lg">{professional.name}</h3>
            <p className="lg:text-md text-muted-foreground text-sm">
              {professional.specialty}
            </p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2 px-4 sm:px-6">
        <Badge
          variant="outline"
          className="justify-start text-xs sm:text-sm md:text-base"
        >
          <Calendar1Icon className="mr-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
          <span className="truncate">
            {availability.from.format("ddd")} a {availability.to.format("ddd")}
          </span>
        </Badge>
        <Badge
          variant="outline"
          className="justify-start text-xs sm:text-sm md:text-base"
        >
          <Clock10Icon className="mr-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-5 lg:w-5" />
          <span className="truncate">
            {availability.from.format("HH:mm")} às{" "}
            {availability.to.format("HH:mm")}
          </span>
        </Badge>
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col gap-2 px-4 pt-3 sm:px-6">
        <Dialog
          open={isUpsertPRofessionalFormOpen}
          onOpenChange={setIsUpsertProfessionalFormOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full text-xs sm:text-sm md:text-base">
              Ver detalhes
            </Button>
          </DialogTrigger>
          <UpdateProfessionalForm
            professional={{
              ...professional,
              availableToTime: availability.to.format("HH:mm:ss"),
              availableFromTime: availability.from.format("HH:mm:ss"),
            }}
            onSuccess={() => setIsUpsertProfessionalFormOpen(false)}
          />
        </Dialog>

        {professional && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-xs hover:border-red-300 hover:bg-red-200 hover:text-red-500 sm:text-sm md:text-base"
              >
                Deletar profissional
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base md:text-lg lg:text-xl">
                  Tem certeza que deseja deletar esse profissional?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm md:text-base lg:text-lg">
                  Essa ação não pode ser desfeita. Todos os dados relacionados a
                  esse profissional serão perdidos permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-sm md:text-base">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProfessional}
                  className="text-sm md:text-base"
                >
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProfessionalCard;
