import {
  BanknoteArrowUp,
  CalendarDays,
  HelpCircle,
  TicketX,
  UserPlus2,
  Wallet,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrencyInCents } from "@/helpers/currency";

interface StatsCardsProps {
  totalRevenue: number | null;
  totalAppointments: number;
  totalClients: number;
  forecastedRevenue: number;
  totalCanceledAppointments: number;
}

const StatsCards = ({
  totalRevenue,
  totalAppointments,
  totalClients,
  forecastedRevenue,
  totalCanceledAppointments,
}: StatsCardsProps) => {
  const stats = [
    {
      title: "Faturamento atual",
      value: totalRevenue ? formatCurrencyInCents(totalRevenue) : "R$ 0,00",
      icon: Wallet,
      help: "Valor total recebido de agendamentos já realizados (status 'atendido') no período selecionado.",
    },
    {
      title: "Faturamento previsto",
      value: forecastedRevenue ? formatCurrencyInCents(forecastedRevenue) : "R$ 0,00",
      icon: BanknoteArrowUp,
      help: "Valor total esperado de agendamentos futuros (status 'agendado') no período selecionado.",
    },
    {
      title: "Agendamentos",
      value: totalAppointments.toString(),
      icon: CalendarDays,
      help: "Total de agendamentos confirmados (agendados e atendidos) no período selecionado.",
    },
    {
      title: "Cancelamentos",
      value: totalCanceledAppointments.toString(),
      icon: TicketX,
      help: "Total de agendamentos cancelados no período selecionado.",
    },
    {
      title: "Clientes",
      value: totalClients.toString(),
      icon: UserPlus2,
      help: "Total de clientes cadastrados na sua empresa.",
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
              <CardTitle className="text-sm font-medium">
                {stat.title}
                <span className="inline-flex items-center gap-1 ml-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="hidden text-muted-foreground hover:text-foreground md:inline-flex"
                          aria-label={`Ajuda sobre ${stat.title.toLowerCase()}`}
                        >
                          <HelpCircle className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="max-w-xs bg-background border-border shadow-lg text-white">
                        <p className="text-sm">{stat.help}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground md:hidden"
                        aria-label={`Ajuda sobre ${stat.title.toLowerCase()} (mobile)`}
                      >
                        <HelpCircle className="h-3 w-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="center" className="max-w-xs">
                      <p className="text-sm">{stat.help}</p>
                    </PopoverContent>
                  </Popover>
                </span>
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
