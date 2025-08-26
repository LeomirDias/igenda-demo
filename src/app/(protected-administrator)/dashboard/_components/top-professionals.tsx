import { Users } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

interface TopProfessionalsProps {
  professionals: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    specialty: string;
    appointments: number;
  }[];
}

export default function TopProfessionals({
  professionals,
}: TopProfessionalsProps) {
  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-muted-foreground" />
            <CardTitle className="text-base sm:text-lg">
              Profissionais
            </CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base">
            Ranking de profissionais mais agendados
          </CardDescription>
        </div>

        {/* Doctors List */}
        <div className="space-y-4 sm:space-y-6">
          {[...professionals]
            .sort((a, b) => b.appointments - a.appointments)
            .map((professional) => (
              <div
                key={professional.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar className="relative h-12 w-12 rounded-full border-1 border-gray-200 sm:h-16 sm:w-16">
                    {professional.avatarImageUrl ? (
                      <Image
                        src={professional.avatarImageUrl}
                        alt={professional.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="text-xs sm:text-sm">
                        {professional.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium">
                      {professional.name}
                    </h3>
                    <p className="text-muted-foreground truncate text-xs sm:text-sm">
                      {professional.specialty}
                    </p>
                  </div>
                </div>
                <div className="ml-2 text-right">
                  <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                    {professional.appointments} agend.
                  </span>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
