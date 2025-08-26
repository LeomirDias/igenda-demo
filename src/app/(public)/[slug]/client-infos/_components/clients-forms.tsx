import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ClientsForms = () => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Termos de Uso</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        Data de vigência: 01 de Agosto de 2025
      </DialogDescription>
      <div className="text-muted-foreground max-h-[60vh] space-y-4 overflow-y-auto px-4 py-2 text-sm">
        <p>
          Bem-vindo ao <b>iGenda</b>! Ao acessar ou utilizar nosso serviço, você
          concorda com os seguintes Termos de Uso. Leia atentamente antes de
          utilizar o serviço.
        </p>
        <ol className="list-inside list-decimal space-y-2">
          <li>
            <b>Definições</b>
            <br />
            “Serviço” refere-se ao software disponibilizado pelo <b> Grupo Synqia </b>
            e utilizado pelo “Usuário” ou “Empresa” ao qual o “Cliente” realiza um agendamento de prestação de serviços.
            <br />
            “Usuário” ou “Empresa” refere-se à pessoa física ou jurídica que, assina, acessa
            e utiliza os Serviço disponibilizado.
            <br />
            “Cliente” ou “Você” refere-se à pessoa física que utiliza a funcionalidade de agendamento online
            do Serviço para agendar uma prestação de serviços com a Empresa
            <br />
            “Nós”, “Nosso” refere-se ao <b>Grupo Synqia</b>, responsável
            pela oferta do Serviço.
          </li>
          <li>
            <b>Aceitação dos Termos</b>
            <br />
            Ao criar uma conta, acessar ou usar o Serviço, você declara que leu,
            entendeu e concorda em ficar vinculado a estes Termos. Se não
            concordar, não utilize o Serviço.
          </li>
          <li>
            <b>Cadastro de Cliente</b>
            <br />
            Para utilizar o Serviço, é necessário cadastrar-se, fornecendo
            informações verdadeiras e atualizadas. O seu cadastro é vinculado ao dados da Empresa ao qual Você
            realizou o agendamento da prestação de serviços.
            <br />
            Você é responsável por manter a confidencialidade de suas
            credenciais de acesso.
            <br />Nós ou a Empresa não nos responsabilizaremos por atividades realizadas com
            sua conta caso suas credenciais sejam comprometidas.
          </li>
          <li>
            <b>Uso Permitido</b>
            <br />
            Você concorda em utilizar o Serviço somente para fins legais e
            conforme previsto nestes Termos. É proibido:
            <ul className="ml-4 list-inside list-disc">
              <li>Usar o Serviço para atividades ilegais ou prejudiciais;</li>
              <li>Violar direitos de terceiros;</li>
              <li>Tentar acessar sistemas sem autorização.</li>
            </ul>
          </li>
          <li>
            <b>Cancelamento e Encerramento</b>
            <br />
            Você pode solicitar a exclusão do seu cadastro no Serviço a qualquer momento entrando em contato com a Empresa ao qual
            você agendou a prestação de serviços.
            <br />A Nós e/ou a Empresa reservam-se o direito de encerrar ou suspender cadastros
            que violem estes Termos, sem aviso prévio.
          </li>
          <li>
            <b>Propriedade Intelectual</b>
            <br />
            Todo o conteúdo e tecnologia utilizados no Serviço são de
            propriedade do <b> Grupo Synqia</b> ou de seus licenciadores e são protegidos por
            leis de direitos autorais, marcas e outras legislações aplicáveis.
          </li>
          <li>
            <b>Limitação de Responsabilidade</b>
            <br />O Serviço é fornecido “como está”, sem garantias de
            funcionamento ininterrupto ou livre de erros. Nós não seremos
            responsáveis por danos diretos, indiretos, incidentais ou
            consequenciais resultantes do uso ou da incapacidade de uso do
            Serviço.
          </li>
          <li>
            <b>Modificações nos Termos</b>
            <br />Nós podemos atualizar estes Termos a qualquer momento. Você
            será notificado sobre alterações relevantes e o uso contínuo do
            Serviço após tal notificação constituirá aceitação dos novos Termos.
          </li>
          <li>
            <b>Legislação Aplicável</b>
            <br />
            Estes Termos serão regidos pelas leis da República Federativa do
            Brasil. Fica eleito o foro da comarca de <b>Itumbiara</b>, estado de{" "}
            <b>Goiás</b>, para dirimir quaisquer questões oriundas deste
            contrato.
          </li>
          <li>
            <b>Contato</b>
            <br />
            Se você tiver dúvidas sobre estes Termos, entre em contato conosco:
            <ul className="ml-4 list-inside list-disc">
              <li>
                📧 <b>synqiacompany@gmail.com</b>
              </li>
            </ul>
          </li>
        </ol>
      </div>
    </DialogContent>
  );
};

export default ClientsForms;
