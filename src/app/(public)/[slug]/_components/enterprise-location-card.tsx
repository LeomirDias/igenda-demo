"use client";

import { ExternalLink, GraduationCap, Instagram, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { enterprisesTable } from "@/db/schema";

interface EnterpriseLocationCardProps {
    enterprise: typeof enterprisesTable.$inferSelect;
}

const EnterpriseLocationCard = ({ enterprise }: EnterpriseLocationCardProps) => {
    const formatAddress = () => {
        const parts = [
            enterprise.address,
            enterprise.number,
            enterprise.complement,
            enterprise.city,
            enterprise.state,
            enterprise.cep
        ].filter(Boolean);

        return parts.join(", ");
    };

    const formatAddressForDisplay = () => {
        const parts = [
            enterprise.address && enterprise.number ? `${enterprise.address}, ${enterprise.number}` : enterprise.address,
            enterprise.complement,
            enterprise.city && enterprise.state ? `${enterprise.city} - ${enterprise.state}` : enterprise.city,
            enterprise.cep ? `CEP: ${enterprise.cep}` : null
        ].filter(Boolean);

        return parts;
    };

    const getGoogleMapsUrl = () => {
        const address = formatAddress();
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    };

    const getWhatsAppUrl = () => {
        const phoneNumber = enterprise.phoneNumber?.replace(/\D/g, '');
        return `https://wa.me/55${phoneNumber}`;
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Informações da Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card de Localização */}
                <Card className="p-4 bg-background shadow-sm">
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground text-md mb-3">Localização</h3>
                            <div className="space-y-1 text-sm text-foreground mb-4">
                                {formatAddressForDisplay().map((part, index) => (
                                    <p key={index}>{part}</p>
                                ))}
                            </div>
                        </div>
                        <div className="mt-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.open(getGoogleMapsUrl(), '_blank')}
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                Ver no Google Maps
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Card de Telefone */}
                <Card className="p-4 bg-background shadow-sm">
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground text-md mb-3">Telefone</h3>
                            <div className="flex items-center gap-2 cursor-pointer">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <a
                                    href={getWhatsAppUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm hover:underline"
                                >
                                    {enterprise.phoneNumber}
                                </a>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Card de Especialidade */}
                <Card className="p-4 bg-background shadow-sm">
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground text-md mb-3">Especialidade</h3>
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                <p className="text-sm text-foreground">{enterprise.specialty}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Card de Instagram */}
                <Card className="p-4 bg-background shadow-sm">
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground text-md mb-3">Instagram</h3>
                            <div className="flex items-center gap-2 cursor-pointer">
                                <Instagram className="w-4 h-4 text-muted-foreground" />
                                <a
                                    href={`https://instagram.com/${enterprise.instagramURL}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm hover:underline"
                                >
                                    {enterprise.instagramURL
                                        ? `@${enterprise.instagramURL.replace(/^@/, "")}`
                                        : <span className="text-muted-foreground">Não informado</span>
                                    }
                                </a>
                            </div>
                        </div>
                    </div>
                </Card>


            </div>
        </div>
    )
}

export default EnterpriseLocationCard;