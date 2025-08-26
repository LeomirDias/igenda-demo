import { eq } from "drizzle-orm";
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
import { db } from "@/db";
import { enterprisesTable, usersSubscriptionTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import EnterpriseCard from "./_components/enterprise-card";
import SubscriptionCard from "./_components/subscription-card";
import UserCard from "./_components/user-card";

export const metadata: Metadata = {
  title: "iGenda - Configurações",
};

const SettingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.enterprise) {
    redirect("/enterprise-form");
  }

  const [enterprise, subscription] = await Promise.all([
    db.query.enterprisesTable.findFirst({
      where: eq(enterprisesTable.id, session.user.enterprise.id),
    }),
    db.query.usersSubscriptionTable.findFirst({
      where: eq(usersSubscriptionTable.docNumber, session.user.docNumber || ""),
    }),
  ]);

  if (!enterprise) {
    throw new Error("Empresa não encontrada");
  }

  const normalizedSubscription = subscription
    ? { ...subscription, docNumber: subscription.docNumber ?? "" }
    : null;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Ajustes</PageTitle>
          <PageDescription>
            Visualize e gerencie os ajustes da sua conta e da sua empresa.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UserCard user={session.user} />
            <SubscriptionCard subscription={normalizedSubscription} />
          </div>
          <EnterpriseCard enterprise={enterprise} />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default SettingsPage;
