import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import WhatsappCard from "@/app/(protected-administrator)/support/_components/whatsapp-card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import { TutorialQuestions } from "./_components/tutorial-questions";


export const metadata: Metadata = {
  title: "iGenda - Suporte"
};

const SupportPage = async () => {
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
          <PageTitle>Suporte</PageTitle>
          <PageDescription>
            Tire suas dúvidas ou entre em contato com o suporte!
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <></>
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="max-w-4xl mx-auto space-y-8">
          <TutorialQuestions />
          <WhatsappCard />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default SupportPage;
