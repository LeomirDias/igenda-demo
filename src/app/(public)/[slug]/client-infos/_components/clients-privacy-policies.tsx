import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ClientsPrivacyPolicies = () => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Política de Privacidade</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        Data de vigência: 01 de Agosto de 2025
      </DialogDescription>
      <div className="text-muted-foreground max-h-[60vh] space-y-4 overflow-y-auto px-4 py-2 text-sm">
        <p>
          No <b>Grupo Synqia</b>, a privacidade e segurança dos dados dos nossos
          usuários e seus clientes são prioridades. Esta Política de Privacidade explica como
          coletamos, usamos, armazenamos, protegemos e compartilhamos suas
          informações ao utilizar nossa plataforma SaaS <b>iGenda</b>.
        </p>
        <ol className="list-inside list-decimal space-y-2">
          <li>
            <b>Informações que Coletamos</b>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>
                <b>1.1. Informações fornecidas por você:</b>
                <ul className="ml-4 list-inside list-disc">
                  <li>Nome completo</li>
                  <li>Data de nascimento</li>
                  <li>Número de telefone</li>
                </ul>
              </li>
              <li>
                <b>1.2. Informações coletadas automaticamente:</b>
                <ul className="ml-4 list-inside list-disc">
                  <li>Endereço IP</li>
                  <li>Tipo de navegador e sistema operacional</li>
                  <li>Páginas acessadas e tempo de navegação</li>
                  <li>Cookies e tecnologias similares</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            <b>Finalidade do Uso dos Dados</b>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Criar e gerenciar seu cadastro em empresas que forneçem prestações de serviço a partir do nosso sistema;</li>
              <li>Fornecer suporte técnico e atendimento;</li>
              <li>Melhorar a experiência do usuário na plataforma;</li>
              <li>
                Enviar notificações e comunicações relacionadas ao serviço;
              </li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
          </li>
          <li>
            <b>Compartilhamento de Dados</b>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>
                Não vendemos, bem como não alugamos seus dados. Podemos compartilhar suas
                informações:
              </li>
              <li>
                Com a empresa a qual você realizou o agendamento de prestação de serviços;
              </li>
              <li>
                Com prestadores de serviços que auxiliam na operação da
                plataforma (ex: hospedagem);
              </li>
              <li>Quando exigido por lei ou ordem judicial;</li>
              <li>Com consentimento explícito do usuário.</li>
            </ul>
          </li>
          <li>
            <b>Armazenamento e Segurança</b>
            <br />
            Armazenamos seus dados em servidores seguros e tomamos medidas
            técnicas e organizacionais para proteger suas informações contra
            acesso não autorizado, perda ou uso indevido.
          </li>
          <li>
            <b>Direitos do Titular dos Dados (Conforme LGPD)</b>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Confirmar a existência de tratamento de dados;</li>
              <li>Acessar seus dados pessoais;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>
                Solicitar a exclusão de dados pessoais tratados com seu
                consentimento;
              </li>
              <li>Revogar o consentimento a qualquer momento;</li>
              <li>Portar seus dados a outro fornecedor de serviço.</li>
            </ul>
            <br />
            Para exercer esses direitos, entre em contato pelo e-mail:{" "}
            <b>synqiacompany@gmail.com</b>.
          </li>
          <li>
            <b>Cookies</b>
            <br />
            Utilizamos cookies para melhorar sua experiência de navegação. Você
            pode controlar ou desabilitar o uso de cookies nas configurações do
            seu navegador.
          </li>
          <li>
            <b>Retenção de Dados</b>
            <br />
            Reteremos seus dados enquanto sua conta estiver ativa ou conforme
            necessário para cumprir obrigações legais e contratuais. Após esse
            período, seus dados serão excluídos ou anonimizados.
          </li>
          <li>
            <b>Alterações na Política de Privacidade</b>
            <br />
            Podemos atualizar esta Política de Privacidade periodicamente.
            Notificaremos sobre alterações significativas por e-mail ou dentro
            da própria plataforma.
          </li>
          <li>
            <b>Contato</b>
            <br />
            Se tiver dúvidas, reclamações ou quiser exercer seus direitos, fale
            conosco:
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

export default ClientsPrivacyPolicies;
