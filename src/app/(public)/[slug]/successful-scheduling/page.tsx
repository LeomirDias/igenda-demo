import { eq } from "drizzle-orm";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SlugPageContainer, SlugPageContent, SlugPageHeader, SlugPageHeaderContent, SlugPageTitle } from "@/components/ui/slug-page-container";
import { db } from "@/db";
import { enterprisesTable } from "@/db/schema";

interface SuccessfulSchedulingPageProps {
    params: Promise<{
        slug: string;
    }>;
}

const SuccessfulSchedulingPage = async ({ params }: SuccessfulSchedulingPageProps) => {
    const { slug } = await params;

    // Buscar empresa pelo slug
    const enterprise = await db.query.enterprisesTable.findFirst({
        where: eq(enterprisesTable.slug, slug),
    });

    if (!enterprise) {
        redirect("/enterprise-not-found");
    }

    return (
        <SlugPageContainer>
            <SlugPageHeader>
                <SlugPageHeaderContent>
                    <div className="flex items-center gap-3">
                        <div>
                            <SlugPageTitle>{enterprise.name}</SlugPageTitle>
                        </div>
                    </div>
                </SlugPageHeaderContent>
            </SlugPageHeader>

            <SlugPageContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Agendamento Realizado!</h1>
                    <p className="text-muted-foreground mb-6">
                        Seu agendamento foi realizado com sucesso. Você receberá uma confirmação em breve.
                    </p>
                    <Button asChild>
                        <Link href={`/${slug}`}>
                            Voltar ao Início
                        </Link>
                    </Button>
                </div>
            </SlugPageContent>
        </SlugPageContainer>
    );
};

export default SuccessfulSchedulingPage;