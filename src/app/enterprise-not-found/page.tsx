import type { Metadata } from "next"

import SupportHeader from "./_components/support-header"
import WhatsappCard from "./_components/whatsapp-card"


export const metadata: Metadata = {
    title: "iGenda | Empresa não encontrada",
}

export default function SupportPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <SupportHeader />
            <div className="flex w-full items-center justify-center">
                <WhatsappCard />
            </div>
        </div>
    )
}
