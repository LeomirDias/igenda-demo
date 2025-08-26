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
import { professionalsTable, servicesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddServiceButton from "./_components/add-service-button";
import ServiceCard from "./_components/service-card";

export const metadata: Metadata = {
  title: "iGenda - Serviços",
};


const EnterpriseServicesPage = async () => {
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

  const services = await db.query.servicesTable.findMany({
    where: eq(servicesTable.enterpriseId, session.user.enterprise.id),
  });

  const professionals = await db.query.professionalsTable.findMany({
    where: eq(professionalsTable.enterpriseId, session.user.enterprise.id),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Serviços</PageTitle>
          <PageDescription>
            Gerencie o catalogo de serviços da sua empresa.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddServiceButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              professionals={professionals}
            />
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default EnterpriseServicesPage;
