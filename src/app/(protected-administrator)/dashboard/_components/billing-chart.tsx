"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { DollarSign } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrencyInCents } from "@/helpers/currency";

interface DailyBilling {
  date: string;
  revenue: number;
}

interface BillingChartProps {
  dailyBillingData: DailyBilling[];
}

export function BillingChart({ dailyBillingData }: BillingChartProps) {
  dayjs.locale("pt-br");
  const chartDays = Array.from({ length: 15 }).map((_, i) =>
    dayjs()
      .startOf("day")
      .subtract(7 - i, "days")
      .format("YYYY-MM-DD"),
  );

  const chartData = chartDays.map((date) => {
    const dataForDay = dailyBillingData.find((item) => item.date === date);
    return {
      date: dayjs(date).format("DD/MM"),
      fullDate: date,
      revenue: dataForDay ? Number(dataForDay.revenue) : 0,
    };
  });

  const chartConfig = {
    revenue: {
      label: "Faturamento",
      color: "#10B981",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <DollarSign className="text-muted-foreground h-6 w-6" />
        <div className="flex w-full flex-row items-center justify-between">
          <CardTitle className="text-lg">Faturamento</CardTitle>
          <CardDescription className="text-xs">
            Faturamento total dos últimos 7 dias e próximos 7 dias
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer
          config={chartConfig}
          className="min-h-[200px] sm:min-h-[250px]"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 5,
              left: 5,
              bottom: 5,
            }}
            className="w-full"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontSize={11}
              interval="preserveStartEnd"
              minTickGap={5}
            />
            <YAxis
              hide={true}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              width={30}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    return (
                      <>
                        <div className="h-3 w-3 rounded bg-[#10B981]" />
                        <span className="text-muted-foreground">
                          Faturamento:
                        </span>
                        <span className="font-semibold">
                          {formatCurrencyInCents(Number(value))}
                        </span>
                      </>
                    );
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return dayjs(payload[0].payload?.fullDate)
                        .format("DD/MM/YYYY (dddd)")
                        .replace(/^(.)/, (c) => c.toUpperCase());
                    }
                    return label;
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="var(--color-revenue)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
