import { Card, CardContent } from "@/components/ui/card";

interface ClientGreetingProps {
    clientName: string;
}

const ClientGreeting = ({ clientName }: ClientGreetingProps) => {
    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-primary">
                        Olá, {clientName}! 👋
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Estamos felizes em atendê-lo. Escolha seu serviço e horário preferido.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default ClientGreeting;
