import Image from "next/image";

import ResetPasswordForm from "./_components/reset-password-form";

const AuthenticationPage = async () => {


  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="flex w-full max-w-md flex-col items-center sm:max-w-lg md:max-w-xl">
        <div className="mb-6 flex justify-center sm:mb-8">
          <Image
            src="/LogoCompletaiGenda.png"
            alt="iGenda Logo"
            width={400}
            height={80}
            className="h-42 w-auto"
            priority
          />
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default AuthenticationPage;
