"use client";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs";

import ClientLoginForm from "./_components/client-login-form";
import ClientSignUpForm from "./_components/client-sign-up-form";
import OpenClientsPrivacyPoliciesButton from "./_components/clients-open-privacy-policies-button";
import OpenClientsTermsButton from "./_components/clients-open-terms-button";


const AuthenticationPage = () => {
    const [tab, setTab] = useState("login");
    const year = new Date().getFullYear();

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 relative">
            <div className="flex flex-col flex-1 w-full items-center justify-center">
                <Tabs value={tab} onValueChange={setTab} className="w-full max-w-[400px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Já sou cliente</TabsTrigger>
                        <TabsTrigger value="register">Sou um novo cliente</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <ClientLoginForm />
                    </TabsContent>
                    <TabsContent value="register">
                        <ClientSignUpForm />
                    </TabsContent>
                </Tabs>

                <div className="text-muted-foreground mt-2 text-center text-xs">
                    <span className="inline">
                        <OpenClientsTermsButton className="m-0 inline p-0 align-baseline text-xs" />
                    </span>{" "}
                    e {" "}
                    <span className="inline">
                        <OpenClientsPrivacyPoliciesButton className="m-0 inline p-0 align-baseline text-xs" />
                    </span>
                </div>
            </div>

            <footer className="text-muted-foreground absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs w-full max-w-[400px] md:max-w-full">
                <span className="inline">
                    © {year} iGenda. Todos os direitos reservados.
                </span>
            </footer>
        </div>

    )
};

export default AuthenticationPage;