"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface AnualPlanCardProps {
    active?: boolean;
}

export default function AnualPlanCard({
    active = false,
}: AnualPlanCardProps) {


    return (
        <Card className="flex h-full w-full flex-col border-2 border-emerald-500 bg-background shadow-lg hover:shadow-xl transition-all duration-300 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span
                    className="bg-gradient-to-r from-emerald-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-pulse"
                >
                    🤑 MELHOR PREÇO
                </span>
            </div>
            <CardHeader className="pb-4  text-white rounded-t-lg">
                <div className="mb-2 flex items-center justify-between">
                    <CardTitle className="text-white text-lg font-bold sm:text-xl">
                        Assinatura Anual
                    </CardTitle>
                    {active && (
                        <Badge className="text-emerald-500 text-xs bg-white">Assinatura atual</Badge>
                    )}
                </div>
                <CardDescription className="text-white mb-4 text-sm">
                    Perfeito para quem quer organizar tudo e gastar pouco
                </CardDescription>
                <div className="flex items-baseline">
                    <span className="text-white text-2xl font-bold sm:text-3xl">
                        R$ 199,90
                    </span>
                    <span className="text-white ml-1">/ ano</span>
                </div>
                <div className="mt-2">
                    <span
                        className="bg-emerald-900 text-emerald-300 px-2 py-1 rounded text-xs"
                    >
                        Em até 12x R$ 20,28
                    </span>
                </div>

            </CardHeader>

            <CardFooter className="mt-auto">
                <Button
                    onClick={() => { window.open("https://pay.cakto.com.br/5aqjg9q_513522", "_blank") }}
                    variant="default"
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-500 hover:from-emerald-600 hover:to-emerald-600"
                    size="lg"
                >
                    Assinar agora!
                </Button>
            </CardFooter>
        </Card>
    );
}
