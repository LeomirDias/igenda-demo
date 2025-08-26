"use client"

import { MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function WhatsappCard() {
    // Número de WhatsApp (substitua pelo número desejado)
    const phoneNumber = "5564992834346"
    // Mensagem pré-definida (opcional)
    const message = "Olá! Preciso de ajuda com a aplicação."

    // Cria a URL do WhatsApp com o número e a mensagem
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <CardTitle>Suporte via WhatsApp</CardTitle>
                </div>
                <CardDescription>Converse diretamente com nossa equipe de suporte pelo WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                    Atendimento rápido e personalizado. Nossa equipe está disponível de segunda a sexta, das 9h às 18h.
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full bg-primary hover:bg-green-800" onClick={() => window.open(whatsappUrl, "_blank")}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Conversar no WhatsApp
                </Button>
            </CardFooter>
        </Card>
    )
}
