import { Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";
import { formatDuration } from "@/helpers/time";

interface AvailableServicesProps {
    services: Array<{
        id: string;
        name: string;
        durationInMinutes: number;
        servicePriceInCents: number;
    }>;
}

const AvailableServices = ({ services }: AvailableServicesProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Serviços Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {services.map((service) => (
                        <div key={service.id} className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                            <div className="flex items-center gap-2 mb-2 lg:mb-0">
                                <h3 className="font-bold text-foreground text-md">
                                    {service.name}
                                </h3>
                                <div className="flex items-center space-x-1 text-muted-foreground text-xs">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDuration(service.durationInMinutes)}</span>
                                </div>
                            </div>
                            <div className="lg:ml-auto">
                                <p className="font-bold text-sm text-primary">
                                    {formatCurrencyInCents(service.servicePriceInCents)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AvailableServices;
