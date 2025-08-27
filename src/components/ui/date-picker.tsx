"use client";

import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDeviceDetection } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DatePickerProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    disabled?: (date: Date) => boolean;
    placeholder?: string;
    className?: string;
    minDate?: Date;
}

export function DatePicker({
    value,
    onChange,
    disabled,
    placeholder = "Selecione uma data",
    className,
    minDate,
}: DatePickerProps) {
    const { isMobile, isIOS } = useDeviceDetection();

    if (isMobile && isIOS) {
        // Solução alternativa para iOS - input nativo com fallback
        return (
            <input
                type="date"
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    !value && "text-muted-foreground",
                    className
                )}
                value={value ? dayjs(value).format('YYYY-MM-DD') : ''}
                onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    onChange(date);
                }}
                min={minDate ? dayjs(minDate).format('YYYY-MM-DD') : undefined}
            />
        );
    }

    // Popover original para outros dispositivos
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? (
                        value.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                        })
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={value}
                    onSelect={onChange}
                    disabled={disabled}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
