import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccessWhitoutPlan } from "@/components/ui/acess-without-plan";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { professionalsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddProfessionalButton from "./_components/add-professional-button";
import ProfessionalCard from "./_components/profesisonal-card";

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
  if (!session.user.enterprise) {
    redirect("/enterprise-form");
  }
  if (session.user.subscriptionStatus !== "active") {
    return <AccessWhitoutPlan />;
  }

  const professionals = await db.query.professionalsTable.findMany({
    where: eq(professionalsTable.enterpriseId, session.user.enterprise.id),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Profissionais</PageTitle>
          <PageDescription>
            Gerencie os profissionais da sua empresa.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddProfessionalButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
            />
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default ProfessionalsPage;
