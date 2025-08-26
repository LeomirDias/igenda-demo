import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import RenewSubscriptionEmail from "@/components/emails/renewed-subscriptions";
import subscriptionCanceled from "@/components/emails/subscription-canceled";
import subscriptionRenewalPending from "@/components/emails/subscription-renewal-pending";
import { db } from "@/db";
import { usersSubscriptionTable, usersTable } from "@/db/schema";
import { sendWhatsappMessage } from "@/lib/zapi-service";

const resend = new Resend(process.env.RESEND_API_KEY as string);
const LASTLINK_WEBHOOK_SECRET_SUBSCRIPTIONS_UPSELL = process.env.LASTLINK_WEBHOOK_SECRET_SUBSCRIPTIONS_UPSELL!;

export async function POST(req: NextRequest) {
    // pegar token do header
    const headerSecret = req.headers.get("x-lastlink-token");

    if (!headerSecret || headerSecret !== LASTLINK_WEBHOOK_SECRET_SUBSCRIPTIONS_UPSELL) {
        return NextResponse.json({ error: "Segredo inválido" }, { status: 401 });
    }

    // só processa o body depois que validar o secret
    const body = await req.json();

    const alertPhone = "64992214800";

    const event = body?.Event;
    const data = body?.Data;
    const buyer = data?.Buyer;
    const purchase = data?.Purchase;
    const subscription = data?.Subscriptions?.[0];


    if (!buyer?.Id) {
        return NextResponse.json({ error: "Email do cliente ausente" }, { status: 400 });
    }

    if (!buyer?.Email) {
        return NextResponse.json({ error: "Email do cliente ausente" }, { status: 400 });
    }

    if (!buyer?.PhoneNumber) {
        return NextResponse.json({ error: "Telefone do cliente ausente" }, { status: 400 });
    }


    // Renovação pendente
    if (event === "Subscription_Renewal_Pending") {
        await db
            .update(usersSubscriptionTable)
            .set({
                //Assinatura
                subscriptionStatus: "Subscription_Renewal_Pending",
            })
            .where(eq(usersSubscriptionTable.id, buyer.Id));

        await db
            .update(usersTable)
            .set({
                //Assinatura
                subscriptionStatus: "Subscription_Renewal_Pending",
            })
            .where(eq(usersTable.id, buyer.Id));


        // Email
        await resend.emails.send({
            from: `${process.env.NAME_FOR_ACCOUNT_MANAGEMENT_SUBMISSIONE} <${process.env.EMAIL_FOR_ACCOUNT_MANAGEMENT_SUBMISSION}>`,
            to: buyer.Email,
            subject: "Renove sua assinatura iGenda!",
            react: subscriptionRenewalPending({
                customerName: buyer.Name || "",
            }),
        });

        // WhatsApp
        await sendWhatsappMessage(buyer.PhoneNumber,
            `Olá, ${buyer.Name || ""}! 👋

Sua assinatura iGenda está pendente! 😰

Não perca acesso às funcionalidades exclusivas da iGenda, renove sua assinatura.

Caso precise de ajuda, entre em contato com o nosso suporte em 64 9283-4346!📱

Atenciosamente, equipe iGenda!💚 `
        );

        await sendWhatsappMessage(alertPhone,
            `Olá, Leomir! 👋

Existe uma assinatura pendente. 😰

Cliente: ${buyer.Name || ""}
CPF: ${buyer.Id}
Telefone: ${buyer.PhoneNumber}`
        );


    }

    // Cancelamento
    if (event === "Subscription_Canceled") {
        await db
            .update(usersSubscriptionTable)
            .set({
                //Assinatura
                subscriptionStatus: "Subscription_Canceled",
                //Cancelamento
                paidAt: subscription?.CanceledDate ? new Date(subscription.CanceledDate) : new Date(),
            })
            .where(eq(usersSubscriptionTable.id, buyer.Id));

        await db
            .update(usersTable)
            .set({
                //Assinatura
                subscriptionStatus: "Subscription_Canceled",
            })
            .where(eq(usersTable.id, buyer.Id));


        // Email
        await resend.emails.send({
            from: `${process.env.NAME_FOR_ACCOUNT_MANAGEMENT_SUBMISSIONE} <${process.env.EMAIL_FOR_ACCOUNT_MANAGEMENT_SUBMISSION}>`,
            to: buyer.Email,
            subject: "Assinatura iGenda Cancelada!",
            react: subscriptionCanceled({
                customerName: buyer.Name || "",
            }),
        });

        // WhatsApp
        await sendWhatsappMessage(buyer.PhoneNumber,
            `Olá, ${buyer.Name || ""}! 👋

Agradecemos por fazer parte da iGenda e lamentamos sua saída. 😕

Seu feedback é de extrema importância para a evolução dos serviços da iGenda. Se possível entre em contato e nos explique o que levou ao cancelamento da sua assinatura..

Entre em contato conosco pelo contato: 64 9283-4346!📱

Atenciosamente, equipe iGenda!💚 `
        );

        await sendWhatsappMessage(alertPhone,
            `Olá, Leomir! 👋

Uma assinatura foi cancelada. ❌

Cliente: ${buyer.Name || ""}
CPF: ${buyer.Id}
Telefone: ${buyer.PhoneNumber}`
        );


    }

    // Renovação
    if (event === "Recurrent_Payment") {
        await db
            .update(usersSubscriptionTable)
            .set({
                //Assinatura
                subscriptionStatus: "active",
                paymentMethod: purchase?.Payment?.PaymentMethod,
                paidAt: purchase?.PaymentDate ? new Date(purchase.PaymentDate) : new Date(),
            })
            .where(eq(usersSubscriptionTable.id, buyer.Id));

        await db
            .update(usersTable)
            .set({
                //Assinatura
                subscriptionStatus: "active",
            })
            .where(eq(usersTable.id, buyer.Id));


        // Email
        await resend.emails.send({
            from: `${process.env.NAME_FOR_ACCOUNT_MANAGEMENT_SUBMISSIONE} <${process.env.EMAIL_FOR_ACCOUNT_MANAGEMENT_SUBMISSION}>`,
            to: buyer.Email,
            subject: "Assinatura iGenda Renovada!",
            react: RenewSubscriptionEmail({
                customerName: buyer.Name || "",
            }),
        });

        // WhatsApp
        await sendWhatsappMessage(buyer.PhoneNumber,
            `Olá, ${buyer.Name || ""}! 👋

Agradecemos por continuar com a iGenda!🥳 

Sua assinatura foi renovada com sucesso.

Caso precise de ajuda, entre em contato com o nosso suporte em 64 9283-4346!📱

Atenciosamente, equipe iGenda!💚 `
        );

        await sendWhatsappMessage(alertPhone,
            `Olá, Leomir! 👋

Uma assinatura foi renovada. 🥳

Cliente: ${buyer.Name || ""}
CPF: ${buyer.Id}
Telefone: ${buyer.PhoneNumber}`
        );


    }

    return NextResponse.json({ received: true });
}