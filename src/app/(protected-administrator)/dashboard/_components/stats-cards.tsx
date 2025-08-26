import {
  CalendarDays,
  DollarSignIcon,
  TicketX,
  UserPlus2,
  UsersIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";

interface StatsCardsProps {
  totalRevenue: number | null;
  totalAppointments: number;
  totalClients: number;
  totalProfessionals: number;
  totalCanceledAppointments: number;
}

const StatsCards = ({
  totalRevenue,
  totalAppointments,
  totalClients,
  totalProfessionals,
  totalCanceledAppointments,
}: StatsCardsProps) => {
  const stats = [
    {
      title: "Faturamento",
      value: totalRevenue ? formatCurrencyInCents(totalRevenue) : "R$ 0,00",
      icon: DollarSignIcon,
    },
    {
      title: "Agendamentos",
      value: totalAppointments.toString(),
      icon: CalendarDays,
    },
    {
      title: "Cancelamentos",
      value: totalCanceledAppointments.toString(),
      icon: TicketX,
    },
    {
      title: "Clientes",
      value: totalClients.toString(),
      icon: UserPlus2,
    },
    {
      title: "Profissionais",
      value: totalProfessionals.toString(),
      icon: UsersIcon,
    },
  ];

  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="w-full gap-2">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                <Icon className="text-primary h-4 w-4" />
              </div>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
