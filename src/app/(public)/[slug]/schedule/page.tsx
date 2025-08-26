import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getClientSession } from "@/actions/get-client-session";
import { Button } from "@/components/ui/button";
import { SlugPageContainer, SlugPageContent, SlugPageDescription, SlugPageHeader, SlugPageHeaderContent, SlugPageTitle } from "@/components/ui/slug-page-container";
import { db } from "@/db";
import { enterprisesTable, professionalsTable, servicesTable } from "@/db/schema";

import AvailableServices from "./_components/available-services";
import ClientGreeting from "./_components/client-greeting";
import ScheduleFormWrapper from "./_components/schedule-form-wrapper";
import WhatsAppContact from "./_components/whatsapp-contact";

interface SchedulePageProps {
    params: Promise<{
        slug: string;
    }>;
}

const SchedulePage = async ({ params }: SchedulePageProps) => {
    const { slug } = await params;

    // Buscar empresa pelo slug
    const enterprise = await db.query.enterprisesTable.findFirst({
        where: eq(enterprisesTable.slug, slug),
    });

    if (!enterprise) {
        redirect("/enterprise-not-found");
    }

    // Buscar sessão do cliente
    const sessionResult = await getClientSession();

    if (!sessionResult?.success || !sessionResult.client) {
        redirect(`/${slug}/client-infos`);
    }

    const client = sessionResult.client;

    // Buscar serviços da empresa
    const services = await db.query.servicesTable.findMany({
        where: eq(servicesTable.enterpriseId, enterprise.id),
    });

    // Buscar profissionais da empresa
    const professionals = await db.query.professionalsTable.findMany({
        where: eq(professionalsTable.enterpriseId, enterprise.id),
    });

    return (
        <SlugPageContainer>
            <SlugPageHeader>
                <SlugPageHeaderContent>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/${slug}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <SlugPageTitle>{enterprise.name}</SlugPageTitle>
                            <SlugPageDescription>
                                {enterprise.specialty || "Estabelecimento"}
                            </SlugPageDescription>
                        </div>
                    </div>
                </SlugPageHeaderContent>
            </SlugPageHeader>

            <SlugPageContent>
                <ClientGreeting clientName={client.name} />

                <ScheduleFormWrapper
                    services={services}
                    professionals={professionals}
                    enterpriseId={enterprise.id}
                    clientId={client.id}
                    enterpriseSlug={slug}
                />

                <AvailableServices services={services} />

                <WhatsAppContact
                    phoneNumber={enterprise.phoneNumber || ""}
                    enterpriseName={enterprise.name}
                />
            </SlugPageContent>
        </SlugPageContainer>
    );
};

export default SchedulePage;
