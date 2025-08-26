import { ptBR } from "date-fns/locale";
import React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SidebarContentProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  setIsSidebarOpen?: (open: boolean) => void; // nova prop opcional
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedProfessional: string;
  setSelectedProfessional: (id: string) => void;
  selectedService: string;
  setSelectedService: (id: string) => void;
  professionals: { id: string; name: string }[];
  services: { id: string; name: string }[];
  onResetFilters: () => void;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({
  date,
  setDate,
  setIsSidebarOpen, // nova prop
  searchTerm,
  setSearchTerm,
  selectedProfessional,
  setSelectedProfessional,
  selectedService,
  setSelectedService,
  professionals,
  services,
  onResetFilters,
}) => (
  <div className="flex h-full flex-col items-center space-y-6 p-4 text-center">
    {/* Calendário */}
    <div>
      <h2 className="text-foreground text-md mb-4">Calendário</h2>
      <Calendar
        mode="single"
        selected={date}
        locale={ptBR}
        onSelect={(selectedDate) => {
          setDate(selectedDate);
          if (setIsSidebarOpen) setIsSidebarOpen(false);
        }}
        className="border-border rounded-md border"
      />
    </div>
    {/* Filtros */}
    <div className="w-full space-y-4">
      <h3 className="text-foreground text-md mb-4">Filtros</h3>
      <div className="space-y-2">
        <Label htmlFor="search">Cliente</Label>
        <Input
          id="search"
          placeholder="Nome do cliente..."
          value={searchTerm}
          className="w-full"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="professional">Profissional</Label>
        <Select
          value={selectedProfessional}
          onValueChange={setSelectedProfessional}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Busque por profissional" />
          </SelectTrigger>
          <SelectContent>
            {professionals.map((professional) => (
              <SelectItem key={professional.id} value={professional.id}>
                {professional.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="service">Serviço</Label>
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Busque por serviço" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Button
          type="button"
          variant="outline"
          className="hover:border-destructive hover:bg-destructive/10 hover:text-destructive w-full text-sm"
          onClick={onResetFilters}
        >
          Resetar filtros
        </Button>
      </div>
    </div>
  </div>
);
