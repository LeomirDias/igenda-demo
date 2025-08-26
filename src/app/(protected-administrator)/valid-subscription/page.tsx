import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import ValidSubscriptionLoading from "./_components/valid-subscription-loading";

export const metadata: Metadata = {
    title: "iGenda - Validação de assinatura",
};

const ValidSubscriptionPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/authentication");
    }
    if (session.user.subscriptionStatus === "active") {
        redirect("/dashboard");
    }

    return <ValidSubscriptionLoading />;
};

export default ValidSubscriptionPage;
