"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WhatsAppContactProps {
    phoneNumber: string;
    enterpriseName: string;
}

const WhatsAppContact = ({ phoneNumber, enterpriseName }: WhatsAppContactProps) => {
    const handleWhatsAppContact = () => {
        const message = `Olá! Gostaria de mais informações sobre os serviços da ${enterpriseName}.`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <Card className="bg-muted/50">
            <CardHeader>
                <CardTitle>Precisa de ajuda?</CardTitle>
                <CardDescription>
                    Entre em contato direto com o profissional via WhatsApp.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleWhatsAppContact}
                >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contato via WhatsApp
                </Button>
            </CardContent>
        </Card>
    );
};

export default WhatsAppContact;
