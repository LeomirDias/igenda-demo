import { and, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { appointmentsTable, clientsTable } from "@/db/schema";


const WEBHOOK_SECRET = (process.env.ZAPI_WEBHOOK_SECRET);
const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE!;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN!;

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

    let decision: "scheduled" | "canceled" | null = null;
    if (label.includes("CONFIRMAR")) decision = "scheduled";
    else if (label.includes("CANCELAR") || label.includes("REJEITAR")) decision = "canceled";

    if (!decision) {
        return Response.json({ ok: true, ignored: true, reason: "no decision found" });
    }

    // Correlaciona apenas pelo CLIENTE via número do remetente
    let appt = null as Awaited<ReturnType<typeof db.query.appointmentsTable.findFirst>> | null;

    const rawPhone: string | undefined = payload?.phone ?? payload?.from ?? payload?.participantPhone ?? payload?.participant;
    const digits = typeof rawPhone === "string" ? rawPhone.replace(/\D/g, "") : undefined;

    if (digits) {
        const normalized = digits.startsWith("55") ? digits : `55${digits}`;
        const local = normalized.slice(2);
        const client = await db.query.clientsTable.findFirst({
            where: eq(clientsTable.phoneNumber, normalized),
        }) || await db.query.clientsTable.findFirst({
            where: eq(clientsTable.phoneNumber, local),
        });

        console.log("[ZAPI][Webhook] Matched client:", { clientId: client?.id, phone: normalized });

        if (client) {
            appt = await db.query.appointmentsTable.findFirst({
                where: and(
                    eq(appointmentsTable.clientId, client.id),
                    eq(appointmentsTable.status, "not-confirmed"),
                ),
                orderBy: desc(appointmentsTable.date),
            });
        }
    }

    if (!appt) {
        return Response.json({ ok: false, error: "no pending appointment found" });
    }

    // atualiza o status
    await db
        .update(appointmentsTable)
        .set({ status: decision })
        .where(eq(appointmentsTable.id, appt.id));

    // envia mensagem de retorno para o cliente (opcional)
    try {
        await fetch(
            `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phone: payload.phone, // número que enviou a mensagem
                    message:
                        decision === "scheduled"
                            ? "✅ Seu agendamento foi confirmado com sucesso!"
                            : "❌ Seu agendamento foi cancelado conforme solicitado.",
                }),
            }
        );
    } catch (err) {
        console.error("Erro ao enviar mensagem de retorno:", err);
    }

    return Response.json({ ok: true, appointmentId: appt.id, newStatus: decision });
}
