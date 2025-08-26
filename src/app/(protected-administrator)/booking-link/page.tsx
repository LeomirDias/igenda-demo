import { eq } from "drizzle-orm";
import { Link } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccessWhitoutPlan } from "@/components/ui/acess-without-plan";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { usersToEnterprisesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { CopyLinkButton } from "./_components/copy-link-button";

export const metadata: Metadata = {
  title: "iGenda - Link de Agendamento",
};

const BookingLinkPage = async () => {
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

  const enterprise = await db.query.usersToEnterprisesTable.findFirst({
    where: eq(usersToEnterprisesTable.userId, session.user.id),
    with: {
      enterprise: true,
    },
  });

  if (!enterprise?.enterprise.slug) {
    throw new Error("Enterprise slug not found");
  }

  const bookingLink = `${process.env.NEXT_PUBLIC_APP_URL}/${enterprise.enterprise.slug}`;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Link de agendamento</PageTitle>
          <PageDescription>
            Copie seu link de agendamento para compartilhar com seus clientes.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="flex w-full items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex flex-row items-center gap-2">
                <Link className="text-primary h-5 w-5" />
                <CardTitle className="text-xl">
                  Copie aqui seu link de agendamento!
                </CardTitle>
              </div>
              <CardDescription className="text-sm">
                Compartilhe este link com seus clientes para que eles possam
                agendar serviços diretamente pelo sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      id="booking-link"
                      value={bookingLink}
                      readOnly
                      className="text-primary font-medium"
                    />
                    <CopyLinkButton link={bookingLink} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default BookingLinkPage;
