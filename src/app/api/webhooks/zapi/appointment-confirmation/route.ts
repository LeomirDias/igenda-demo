import { and, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { appointmentsTable, clientsTable, enterprisesTable, professionalsTable, servicesTable } from "@/db/schema";
import { sendWhatsappMessage } from "@/lib/zapi-service";


const WEBHOOK_SECRET = (process.env.ZAPI_WEBHOOK_SECRET);

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    // Z-API normalmente não envia headers customizados.
    // Exigimos o segredo via query string: ?secret=...
    const rawSecret = url.searchParams.get("secret");
    const secret = rawSecret ? decodeURIComponent(rawSecret).trim() : null;

    if (!secret) {
        console.warn("[ZAPI][Webhook] Missing secret query param");
        return Response.json({ ok: false, error: "missing_secret", hint: "append ?secret=YOUR_SECRET to the webhook URL" }, { status: 401 });
    }
    if (secret !== WEBHOOK_SECRET) {
        console.warn("[ZAPI][Webhook] Invalid secret provided", { providedLength: secret.length });
        return Response.json({ ok: false, error: "invalid_secret" }, { status: 401 });
    }

    const payload = await req.json();
    console.log("[ZAPI][Webhook] Received payload:", {
        type: payload?.type,
        phone: payload?.phone ?? payload?.from ?? payload?.participantPhone ?? payload?.participant,
        text: payload?.text?.message ?? payload?.message?.text?.message ?? payload?.body,
    });

    // Aceita múltiplos formatos de eventos: "message", "ReceivedCallback", etc.
    // Prossegue se houver algum texto reconhecível
    const textMsg: string | undefined =
        payload?.text?.message ??
        payload?.message?.text?.message ??
        payload?.body ??
        payload?.message?.message?.conversation ??
        payload?.message?.extendedTextMessage?.text;
    const label = (textMsg ?? "").trim().toUpperCase();

    // Captura um possível código de 4 dígitos
    const codeMatch = (textMsg ?? "").match(/(\d{4})/);
    const code = codeMatch?.[1];

    let decision: "scheduled" | "canceled" | null = null;
    if (label.includes("CONFIRMAR")) decision = "scheduled";
    else if (label.includes("CANCELAR") || label.includes("REJEITAR")) decision = "canceled";

    if (!decision) {
        return Response.json({ ok: true, ignored: true, reason: "no decision found" });
    }

    if (!code) {
        return Response.json({ ok: true, ignored: true, reason: "no code found" });
    }

    // Correlaciona pelo identificador de 4 dígitos
    const appt = await db.query.appointmentsTable.findFirst({
        where: and(
            eq(appointmentsTable.identifier, code),
            eq(appointmentsTable.status, "not-confirmed"),
        ),
        orderBy: desc(appointmentsTable.date),
    });

    if (!appt) {
        return Response.json({ ok: false, error: "no pending appointment found" });
    }

    // atualiza o status
    await db
        .update(appointmentsTable)
        .set({ status: decision })
        .where(eq(appointmentsTable.id, appt.id));

    // Busca dados completos para as mensagens
    const [enterprise, client, professional, service] = await Promise.all([
        db.query.enterprisesTable.findFirst({
            where: eq(enterprisesTable.id, appt.enterpriseId),
        }),
        db.query.clientsTable.findFirst({
            where: eq(clientsTable.id, appt.clientId),
        }),
        db.query.professionalsTable.findFirst({
            where: eq(professionalsTable.id, appt.professionalId),
        }),
        db.query.servicesTable.findFirst({
            where: eq(servicesTable.id, appt.serviceId),
        }),
    ]);

    if (!enterprise || !client || !professional || !service) {
        console.error("[ZAPI][Webhook] Missing data for messages:", { enterprise: !!enterprise, client: !!client, professional: !!professional, service: !!service });
        return Response.json({ ok: false, error: "missing data for messages" });
    }

    // Formata data e hora para as mensagens
    const formattedDate = new Date(appt.date).toLocaleDateString("pt-BR");
    const formattedTime = appt.time;

    const address = `${enterprise.address}, ${enterprise.number}`;
    const fullAddress = enterprise.complement
        ? `${address} - ${enterprise.complement}, ${enterprise.city}/${enterprise.state} - CEP: ${enterprise.cep}`
        : `${address}, ${enterprise.city}/${enterprise.state} - CEP: ${enterprise.cep}`;

    // Envia mensagem de retorno para o cliente
    try {
        const clientMessage = decision === "scheduled"
            ? `✅ Olá, ${client.name}! Seu agendamento foi confirmado com sucesso!\n\nDados do agendamento:\n• Código: #${appt.identifier}\n• Empresa: ${enterprise.name}\n• Serviço: ${service.name}\n• Profissional: ${professional.name}\n• Data: ${formattedDate}\n• Horário: ${formattedTime}\n\n• Endereço: ${fullAddress}\n\nCaso precise remarcar ou cancelar entre em contato com ${enterprise.name} pelo número ${enterprise.phoneNumber} \n\nAgradecemos a preferência! 💚`
            : `❌ Olá, ${client.name}! Seu agendamento foi cancelado por ${enterprise.name}.\n\nDados do agendamento cancelado:\n• Código: #${appt.identifier}\n• Serviço: ${service.name}\n• Profissional: ${professional.name}\n• Data: ${formattedDate}\n• Horário: ${formattedTime}\n\nPara reagendar, entre em contato com ${enterprise.name} pelo número ${enterprise.phoneNumber}.`;

        await sendWhatsappMessage(client.phoneNumber, clientMessage);

        // Envia mensagem de confirmação para a empresa
        const enterpriseMessage = decision === "scheduled"
            ? `✅ Agendamento #${appt.identifier} confirmado com sucesso!`
            : `❌ Agendamento #${appt.identifier} cancelado com sucesso!`;

        await sendWhatsappMessage(enterprise.phoneNumber, enterpriseMessage);

    } catch (err) {
        console.error("[ZAPI][Webhook] Erro ao enviar mensagens:", err);
    }

    return Response.json({ ok: true, appointmentId: appt.id, newStatus: decision });
}
