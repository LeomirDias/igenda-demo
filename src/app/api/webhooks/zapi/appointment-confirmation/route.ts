import { and, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";


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
                            ? `✅ Seu agendamento #${appt.identifier} foi confirmado com sucesso!`
                            : `❌ Seu agendamento #${appt.identifier} foi cancelado conforme solicitado.`,
                }),
            }
        );
    } catch (err) {
        console.error("Erro ao enviar mensagem de retorno:", err);
    }

    return Response.json({ ok: true, appointmentId: appt.id, newStatus: decision });
}
