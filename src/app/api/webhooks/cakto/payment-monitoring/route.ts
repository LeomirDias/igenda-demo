import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { usersSubscriptionTable, usersTable } from "@/db/schema";

const CAKTO_WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET_PAYMENTS!;

export async function POST(req: NextRequest) {
    const body = await req.json();

    const secret = body?.secret;
    if (!secret || secret !== CAKTO_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Segredo inválido" }, { status: 401 });
    }

    const event = body?.event;
    const data = body?.data;
    const customer = data?.customer;
    const product = data?.product;

    if (!customer?.docNumber) {
        return NextResponse.json({ error: "CPF do cliente ausente" }, { status: 400 });
    }

    if (!product?.id) {
        return NextResponse.json({ error: "Produto ausente" }, { status: 400 });
    }

    if (event === "purchase_approved") {
        await db
            .update(usersSubscriptionTable)
            .set({
                //Plano
                planId: data.product.id,
                plan: data.product.name,
                //Assinatura
                subscriptionStatus: "active",
                //Pagamento
                paymentMethod: data.paymentMethod,
                paidAt: data.paidAt ? new Date(data.paidAt) : null,
                //Cancelamento
                canceledAt: null,
            })
            .where(eq(usersSubscriptionTable.docNumber, data.customer.docNumber));

        await db
            .update(usersTable)
            .set({
                //Assinatura
                subscriptionStatus: "active",
            })
            .where(eq(usersTable.docNumber, data.customer.docNumber));
    }
    if (event === "purchase_refused") {
        await db
            .update(usersSubscriptionTable)
            .set({
                //Plano
                planId: data.product.id,
                plan: data.product.name,
                //Assinatura
                subscriptionStatus: "purchase_refused",
                //Pagamento
                paymentMethod: null,
                paidAt: null,
                //Cancelamento
                canceledAt: null,
            })
            .where(eq(usersSubscriptionTable.docNumber, data.customer.docNumber));

        await db
            .update(usersTable)
            .set({
                //Assinatura
                subscriptionStatus: "purchase_refused",
            })
            .where(eq(usersTable.docNumber, data.customer.docNumber));
    }

    return NextResponse.json({ received: true });
}
