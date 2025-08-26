"use client";

import Image from "next/image";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { professionalsTable } from "@/db/schema";

interface ProfessionalCardProps {
    professionals: typeof professionalsTable.$inferSelect[]
}

const ProfessionalCard = ({ professionals }: ProfessionalCardProps) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Profissionais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {professionals.map((professional: typeof professionalsTable.$inferSelect) => (
                    <Card key={professional.id} className="p-4 bg-background shadow-sm">
                        <div className="flex flex-col h-full">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-12 w-12 relative border-1 border-gray-200 rounded-full">
                                        {professional.avatarImageURL ? (
                                            <Image
                                                src={professional.avatarImageURL}
                                                alt={professional.name}
                                                fill
                                                style={{ objectFit: "cover" }}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <AvatarFallback>{professional.name.split(" ").map((name: string) => name[0]).join("")}</AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-foreground text-md">{professional.name}</h3>
                                        <p className="text-primary text-xs">{professional.specialty}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            {professionals.length === 0 && (
                <p className="text-center text-muted-foreground">
                    Nenhum profissional disponível nesta empresa.
                </p>
            )}
        </div>
    );
}

export default ProfessionalCard;