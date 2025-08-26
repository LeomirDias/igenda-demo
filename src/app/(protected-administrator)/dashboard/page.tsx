import dayjs from "dayjs";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccessWhitoutPlan } from "@/components/ui/acess-without-plan";
import {
  PageActions,
  PageContainer,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import getDashboard from "@/data/get-dashboard";
import { getDailyBillingData } from "@/data/get-dashboard";
import { auth } from "@/lib/auth";

import { AppointmentsChart } from "./_components/appoitments-chart";
import { BillingChart } from "./_components/billing-chart";
import { DatePicker } from "./_components/date-picker";
import StatsCards from "./_components/stats-cards";
import TopProfessionals from "./_components/top-professionals";
import TopServices from "./_components/top-services";

export const metadata: Metadata = {
  title: "iGenda - Relatórios",
};


interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
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

  const { from, to } = await searchParams;

  if (!from || !to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }

  const {
    totalRevenue,
    totalAppointments,
    totalClients,
    totalProfessionals,
    totalCanceledAppointments,
    topProfessionals,
    topServices,
    dailyAppointmentsData,
  } = await getDashboard({
    from,
    to,
    session: { user: { enterprise: { id: session.user.enterprise.id } } },
  });

  const dailyBillingData = await getDailyBillingData(
    session.user.enterprise.id,
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Tenha uma visão geral do seu negócio.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <StatsCards
        totalRevenue={totalRevenue.total ? Number(totalRevenue.total) : null}
        totalAppointments={totalAppointments.total}
        totalCanceledAppointments={totalCanceledAppointments.total}
        totalClients={totalClients.total}
        totalProfessionals={totalProfessionals.total}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopProfessionals professionals={topProfessionals} />
        <TopServices topServices={topServices} />
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <h3 className="text-sm font-medium text-muted-foreground">
            Atenção: os gráficos não seguem as datas selecionadas, os dados mostrados neles são referentes ao período de 7 dias anteriores e 7 dias seguintes a data atual.
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
          <BillingChart dailyBillingData={dailyBillingData} />
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
