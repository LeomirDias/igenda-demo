import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
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
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { AppointmentRow } from "./_components/appointment-row";


export default async function PendingAppointmentsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/authentication");
    if (!session.user.enterprise) redirect("/enterprise-form");

    const enterpriseId = session.user.enterprise.id;

    const appointments = await db.query.appointmentsTable.findMany({
        where: eq(appointmentsTable.enterpriseId, enterpriseId),
        with: { client: true, professional: true, service: true },
    });

    const confirmations = appointments.filter((a) => a.status === "not-confirmed");
    const now = dayjs();
    const toConclude = appointments.filter((a) => {
        const dt = dayjs(a.date).hour(parseInt(a.time.split(":")[0])).minute(parseInt(a.time.split(":")[1]));
        return a.status === "scheduled" && dt.isBefore(now);
    });

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle> Agendamentos pendentes</PageTitle>
                    <PageDescription>
                        Gerencie seus agendamentos pendentes e conclua atendimentos
                    </PageDescription>
                </PageHeaderContent>
            </PageHeader>
            <PageContent>
                <Tabs defaultValue="confirm" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-background p-1 rounded-full gap-2">
                        <TabsTrigger
                            value="confirm"
                            className="flex items-center justify-center px-3 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                        >
                            Confirmação
                            {confirmations.length > 0 && (
                                <Badge className="ml-2 rounded-full bg-yellow-500 text-white">{confirmations.length}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="conclude"
                            className="flex items-center justify-center px-3 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                        >
                            Conclusão
                            {toConclude.length > 0 && (
                                <Badge className="ml-2 rounded-full bg-green-500 text-white">{toConclude.length}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="confirm" className="mt-4 space-y-3">
                        {confirmations.map((a) => (
                            <AppointmentRow
                                key={a.id}
                                type="confirm"
                                appointmentId={a.id}
                                title={a.service.name}
                                clientName={a.client.name}
                                professionalName={a.professional.name}
                                date={dayjs(a.date).format("DD/MM/YYYY")}
                                time={a.time}
                                priceInCents={a.appointmentPriceInCents}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="conclude" className="mt-4 space-y-3">
                        {toConclude.map((a) => (
                            <AppointmentRow
                                key={a.id}
                                type="conclude"
                                appointmentId={a.id}
                                title={a.service.name}
                                clientName={a.client.name}
                                professionalName={a.professional.name}
                                date={dayjs(a.date).format("DD/MM/YYYY")}
                                time={a.time}
                                priceInCents={a.appointmentPriceInCents}
                            />
                        ))}
                    </TabsContent>
                </Tabs>
            </PageContent>
        </PageContainer>
    );
}

