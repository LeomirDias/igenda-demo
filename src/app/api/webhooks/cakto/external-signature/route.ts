import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import NewSubscriptionEmail from "@/components/emails/new-subscriptions";
import RenewSubscriptionEmail from "@/components/emails/renewed-subscriptions";
import { db } from "@/db";
import { usersSubscriptionTable } from "@/db/schema";
import { sendWhatsappMessage } from "@/lib/zapi-service";

const CAKTO_WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET_EXTERNAL_SIGNATURES!;
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
    const body = await req.json();

    const secret = body?.secret;
    if (!secret || secret !== CAKTO_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Segredo inválido" }, { status: 401 });
    }

    const alertPhone = "64992214800"

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

    if (event === "subscription_created") {
        // Verifica se já existe um registro com o mesmo doc_number
        const existingSubscription = await db.query.usersSubscriptionTable.findFirst({
            where: eq(usersSubscriptionTable.docNumber, customer.docNumber),
        });

        const subscriptionData = {
            //Cliente
            id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            docNumber: customer.docNumber,
            phone: customer.phone,
            email: customer.email,
            //Plano
            planId: product.id,
            plan: product.name,
            //Assinatura
            subscriptionStatus: "active",
            subscriptionId: data.id,
            //Pagamento
            paymentMethod: data.paymentMethod,
            paidAt: data.paidAt ? new Date(data.paidAt) : null,
            //Cancelamento
            canceledAt: null,
            //Outros de Cliente
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        if (existingSubscription) {
            // Atualiza o registro existente
            await db.update(usersSubscriptionTable)
                .set(subscriptionData)
                .where(eq(usersSubscriptionTable.docNumber, customer.docNumber));

            // Mensagem para usuários existentes
            await resend.emails.send({
                from: `${process.env.NAME_FOR_ACCOUNT_MANAGEMENT_SUBMISSIONE} <${process.env.EMAIL_FOR_ACCOUNT_MANAGEMENT_SUBMISSION}>`,
                to: customer.email,
                subject: "Acesse novamente sua iGenda!",
                react: RenewSubscriptionEmail({
                    customerName: customer.name || "",
                }),
            });

            // Mensagem WhatsApp para usuários existentes
            await sendWhatsappMessage(customer.phone,
                `Olá, ${customer.name || ""}! 👋

Que bom ter você de volta na iGenda! 🎉

Sua assinatura foi ativada com sucesso! 

Obrigado por continuar conosco!💚 `
            );

            // Mensagem WhatsApp para usuários existentes
            await sendWhatsappMessage(alertPhone,
                `Olá, Leomir! 👋

Mais uma venda realizada. 🤑

Um cliente reativou sua assinatura iGenda! 🎉
 `
            );

        } else {
            // Insere um novo registro
            await db.insert(usersSubscriptionTable).values(subscriptionData);

            // Mensagem para novos usuários
            await resend.emails.send({
                from: `${process.env.NAME_FOR_ACCOUNT_MANAGEMENT_SUBMISSIONE} <${process.env.EMAIL_FOR_ACCOUNT_MANAGEMENT_SUBMISSION}>`,
                to: customer.email,
                subject: "Complete seu cadastro na iGenda!",
                react: NewSubscriptionEmail({
                    customerName: customer.name || "",
                }),
            });

            // Mensagem WhatsApp para novos usuários
            await sendWhatsappMessage(customer.phone,
                `Olá, ${customer.name || ""}! 👋

Agradecemos por escolher a iGenda. 🎉

Sua assinatura foi ativada com sucesso! 

Clique neste link para cadastrar sua conta: https://igendaapp.com.br/authentication/sign-up

Seja bem vinda a iGenda. 💚

Clique neste link para entrar no grupo exclusivo de assinantes: https://chat.whatsapp.com/Ilg5BA5SR7wBlwd9t8KA1a?mode=ems_copy_c

Neste grupo você tem suporte total da nossa equipe além do chat privado e a oportunidade de criar uma rede de network com outros assinantes iGenda.

Atenciosamente, equipe iGenda! 💚 `
            );

            // Mensagem WhatsApp para usuários existentes
            await sendWhatsappMessage(alertPhone,
                `Olá, Leomir! 👋

Mais uma venda realizada. 🤑

Um novo cliente adquiriu a iGenda! 🎉
 `
            );
        }
    }

    return NextResponse.json({ received: true });
}
