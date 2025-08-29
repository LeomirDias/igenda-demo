import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
    PageContainer,
    PageContent,
    PageDescription,
    PageHeader,
    PageHeaderContent,
    PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import Timeline from "./_components/timeline";

export const metadata: Metadata = {
    title: "iGenda - Profissionais",
};

const ProfessionalsPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/authentication");
    }

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Novidades</PageTitle>
                    <PageDescription>
                        Confira as últimas atualizações da iGenda.
                    </PageDescription>
                </PageHeaderContent>
            </PageHeader>
            <PageContent>
                <Timeline />
            </PageContent>
        </PageContainer>
    );
};

export default ProfessionalsPage;
