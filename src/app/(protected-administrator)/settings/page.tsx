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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-background p-1 rounded-full gap-2">
            <TabsTrigger
              value="account"
              className="flex items-center justify-center px-3 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              Conta e Assinatura
            </TabsTrigger>
            <TabsTrigger
              value="enterprise"
              className="flex items-center justify-center px-3 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              Minha empresa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-4">
            <div className="flex flex-col md:flex-col gap-4">
              <div className="w-full">
                <UserCard user={session.user} />
              </div>
              <div className="w-full">
                <SubscriptionCard subscription={normalizedSubscription} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="enterprise" className="mt-4">
            <EnterpriseCard enterprise={enterprise} />
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageContainer>
  );
};

export default SettingsPage;
