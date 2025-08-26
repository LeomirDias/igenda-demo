import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { SlugPageContainer, SlugPageContent } from "@/components/ui/slug-page-container";
import { db } from "@/db";
import { enterprisesTable, professionalsTable, servicesTable } from "@/db/schema";

import EnterpriseCard from "./_components/enterprise-card";
import EnterpriseInfosTabs from "./_components/enterprise-infos-tabs";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

const ClientSchedulingPage = async ({ params }: PageProps) => {
    const { slug } = await params;
    const year = new Date().getFullYear();

    const enterprise = await db.query.enterprisesTable.findFirst({
        where: eq(enterprisesTable.slug, slug),
    });

    if (!enterprise) {
        redirect("/enterprise-not-found");
    }

    const services = await db.query.servicesTable.findMany({
        where: eq(servicesTable.enterpriseId, enterprise.id),
    });

    const professionals = await db.query.professionalsTable.findMany({
        where: eq(professionalsTable.enterpriseId, enterprise.id),
    });

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 relative">
            <SlugPageContainer>
                <EnterpriseCard params={params} />
                <SlugPageContent>
                    <EnterpriseInfosTabs enterprise={enterprise} services={services} professionals={professionals} />
                </SlugPageContent>
            </SlugPageContainer>
            <footer className="text-muted-foreground absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs w-full max-w-[400px] md:max-w-full">
                <span className="inline">
                    © {year} iGenda. Todos os direitos reservados.
                </span>
            </footer>
        </div>
    );
}

export default ClientSchedulingPage;