
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#347d61] to-[#88b94d] flex">
      {/* Left Side - Image */}
      <div
        className="flex-1 hidden xl:flex items-center justify-center bg-no-repeat bg-center bg-contain min-h-screen"
        style={{
          backgroundImage: "url('/CapaAuthentication.png')",
        }}
        aria-label="Logo iGenda"
      />

      {/* Right Side - Login Options */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center text-white">
            <div className="w-15 h-auto bg-transparent rounded flex items-center justify-center">
              <Image
                src="/LogoBasicaiGenda.png"
                alt="Logo iGenda"
                width={56}
                height={56}
                priority
              />
            </div>
            <span className="text-3xl text-white font-bold">iGenda</span>
          </div>
        </div>

        {/* Login Buttons */}
        <div className="w-full flex flex-col gap-8 items-center">
          <Link href="/authentication" className="w-full">
            <Button
              className="w-full h-12 bg-primary hover:bg-emerald-600 text-white font-medium text-base shadow-md hover:shadow-2xl border-transparent"
              size="lg"
            >
              Já sou cliente iGenda
            </Button>
          </Link>

          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-slate-300" />
            <span className="px-4 text-slate-300 text-sm">ou</span>
            <div className="flex-1 h-px bg-slate-300" />
          </div>

          <Link href="/authentication/subscription-plans" className="w-full">
            <Button
              className="w-full h-12 bg-primary hover:bg-emerald-600 text-white font-medium text-base shadow-md hover:shadow-2xl border-transparent"
              size="lg"
            >
              Quero fazer parte!
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
