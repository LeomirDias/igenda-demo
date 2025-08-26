import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

import { mockTutorialVideos, TutorialVideoGallery } from "./_components";

export const metadata: Metadata = {
  title: "iGenda - Tutoriais",
};

const TutorialsPage = async () => {
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
          <PageTitle>Tutoriais</PageTitle>
          <PageDescription>
            Tire suas dúvidas e aprenda mais sobre sua iGenda! Assista aos vídeos tutoriais para dominar todas as funcionalidades da plataforma.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <></>
        </PageActions>
      </PageHeader>
      <PageContent>
        <TutorialVideoGallery videos={mockTutorialVideos} />
      </PageContent>
    </PageContainer>
  );
};

export default TutorialsPage;
