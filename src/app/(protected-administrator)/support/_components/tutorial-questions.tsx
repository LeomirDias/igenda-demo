import { TutorialQuestion } from "./tutorial-question";

const TUTORIAL_DATA = [
    {
        question: "Como meus clientes vão agendar em meu estabelecimento?",
        answer: "Seus clientes podem agendar através do link personalizado da sua empresa, que pode ser compartilhado em redes sociais, WhatsApp ou site. Eles realizam login ou cadastro, escolhem o serviço, profissional e horário disponível e agendam, recebem confirmação automática e você é informado sobre o novo agendamento.",
    },
    {
        question: "Por que meus profissionais não aparecem ao tentar criar um agendamento?",
        answer: "Na iGenda, para que seu profissional esteja disponível ao criar um agendamento, é necessário vincula-lo aos serviços que ele pode oferecer. Entrando no painel de serviços e clicando em 'Profissionais associados', basta selecionar todos os profissionais que podem ofertar aquele serviço e salvar, assim, ao escolher o serviço o profissional será listado para agendamento. Caso ainda tenha dúvida assista o vídeo tutorial abaixo.",
    },
];

export function TutorialQuestions() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
                Dúvidas frequentes
            </h3>
            <div className="space-y-3">
                {TUTORIAL_DATA.map((item, index) => (
                    <TutorialQuestion
                        key={index}
                        question={item.question}
                        answer={item.answer}
                    />
                ))}
            </div>
        </div>
    );
}
