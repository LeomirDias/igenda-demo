import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AvailableServicesProps {
    services: Array<{
        id: string;
        name: string;
        servicePriceInCents: number;
    }>;
}

const AvailableServices = ({ services }: AvailableServicesProps) => {
    const formatCurrency = (cents: number) => {
        const value = cents / 100;
        return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Serviços Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {services.map((service) => (
                        <div key={service.id} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{service.name}</span>
                            <span className="text-sm font-semibold text-primary">
                                {formatCurrency(service.servicePriceInCents)}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AvailableServices;
