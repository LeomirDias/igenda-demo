"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ClientsFiltersProps {
  onFilterChange: (filters: { name: string; phone: string }) => void;
}

export function ClientsFilters({ onFilterChange }: ClientsFiltersProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");

  const handleNameChange = (value: string) => {
    setNameFilter(value);
    onFilterChange({ name: value, phone: phoneFilter });
  };

  const handlePhoneChange = (value: string) => {
    setPhoneFilter(value);
    onFilterChange({ name: nameFilter, phone: value });
  };

  const handleResetFilters = () => {
    setNameFilter("");
    setPhoneFilter("");
    onFilterChange({ name: "", phone: "" });
  };

  const hasActiveFilters = nameFilter || phoneFilter;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome..."
            value={nameFilter}
            onChange={(e) => handleNameChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por telefone..."
            value={phoneFilter}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
