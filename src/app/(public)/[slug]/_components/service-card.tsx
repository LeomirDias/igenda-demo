"use client";

import { Clock } from "lucide-react";

import { Card } from "@/components/ui/card";
import { servicesTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";
import { formatDuration } from "@/helpers/time";

interface ServiceCardProps {
    services: typeof servicesTable.$inferSelect[]
}

const ServiceCard = ({ services }: ServiceCardProps) => {
    return (
        <div className="space-y-4 bg">
            <h2 className="text-xl font-bold text-foreground">Serviços ofertados</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service: typeof servicesTable.$inferSelect) => (
                    <Card key={service.id} className="p-4 bg-backfround shadow-sm">
                        <div className="flex flex-col h-full">
                            <div className="flex-1">
                                <h3 className="font-bold text-foreground text-md mb-2">
                                    {service.name}
                                </h3>
                                <div className="flex items-center space-x-1 text-muted-foreground text-xs mb-3">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDuration(service.durationInMinutes)}</span>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <p className="font-bold text-foreground text-sm">
                                    {formatCurrencyInCents(service.servicePriceInCents)}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default ServiceCard;