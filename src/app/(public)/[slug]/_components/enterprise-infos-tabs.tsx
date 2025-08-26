"use client";

import { Calendar, Clock, MapPin } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { enterprisesTable, professionalsTable, servicesTable } from "@/db/schema";

import EnterpriseLocationCard from "./enterprise-location-card";
import ProfessionalCard from "./professional-card";
import ServiceCard from "./service-card";

interface EnterpriseInfosTabsProps {
    enterprise: typeof enterprisesTable.$inferSelect;
    services: typeof servicesTable.$inferSelect[];
    professionals: typeof professionalsTable.$inferSelect[];
}

const EnterpriseInfosTabs = ({ enterprise, services, professionals }: EnterpriseInfosTabsProps) => {
    return (
        <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-background p-1 rounded-full gap-2">
                <TabsTrigger
                    value="services"
                    className="flex items-center px-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                    <Calendar className="w-4 h-4" />
                    Serviços
                </TabsTrigger>
                <TabsTrigger
                    value="professionals"
                    className="flex items-center px-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                    <Clock className="w-4 h-4" />
                    Profissionais
                </TabsTrigger>
                <TabsTrigger
                    value="location"
                    className="flex items-center px-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                    <MapPin className="w-4 h-4" />
                    Localização
                </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-2">
                <Card className="bg-background rounded-lg shadow-lg p-4">
                    <ServiceCard services={services} />
                </Card>
            </TabsContent>

            <TabsContent value="professionals" className="mt-2">
                <Card className="bg-background rounded-lg shadow-lg p-4">
                    <ProfessionalCard professionals={professionals} />
                </Card>
            </TabsContent>

            <TabsContent value="location" className="mt-2">
                <Card className="bg-background rounded-lg shadow-lg p-4">
                    <EnterpriseLocationCard enterprise={enterprise} />
                </Card>
            </TabsContent>
        </Tabs>
    );
};

export default EnterpriseInfosTabs;