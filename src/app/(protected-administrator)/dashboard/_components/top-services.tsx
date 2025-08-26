import { Tags } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

interface TopServicesProps {
  topServices: {
    id: string;
    name: string;
    appointments: number;
  }[];
}

export default function TopServices({ topServices }: TopServicesProps) {
  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Tags className="text-muted-foreground" />
            <CardTitle className="text-base sm:text-lg">Serviços</CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base">
            Ranking de serviços mais agendados
          </CardDescription>
        </div>

        {/* Services List */}
        <div className="space-y-4 sm:space-y-6">
          {[...topServices]
            .sort((a, b) => b.appointments - a.appointments)
            .map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium">
                      {service.name}
                    </h3>
                  </div>
                </div>
                <div className="ml-2 text-right">
                  <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                    {service.appointments} agend.
                  </span>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
