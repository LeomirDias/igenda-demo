import { CloudAlert } from "lucide-react"

export default function SupportHeader() {
    return (
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <CloudAlert className="h-8 w-8 text-primary" />
                </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Empresa não encontrada em nosso sistema.</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                A empresa que você está procurando não foi encontrada. <br />
                1 - Verifique se o link está correto. <br />
                2 - Caso seja necessário, entre em contato com o suporte iGenda no WhatsApp.
            </p>
        </div>
    )
}
