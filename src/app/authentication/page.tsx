import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import LoginForm from "./_components/login-form ";
import OpenPrivacyPoliciesButton from "./_components/open-privacy-policies-button";
import OpenTermsButton from "./_components/open-terms-button";


const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="flex justify-center">
          <Image
            src="/LogoCompletaiGenda.png"
            alt="iGenda Logo"
            width={400}
            height={80}
            className="h-42 w-auto"
            priority
          />
        </div>

        <div className="w-full mt-6">
          <LoginForm />
        </div>
      </div>

      <div className="mt-2 text-center text-xs">
        <span className="inline text-white">
          <OpenTermsButton className="m-0 inline p-0 align-baseline text-xs" />{" "}e{" "}
          <OpenPrivacyPoliciesButton className="m-0 inline p-0 align-baseline text-xs" />
        </span>
      </div>
    </div>
  );
};

export default AuthenticationPage;
