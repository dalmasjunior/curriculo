export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-[#0033A0] mb-8">Política de Privacidade</h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Esta Política de Privacidade descreve como o Gerador de Currículos ATS ("nós", "nosso" ou "serviço") 
              coleta, usa e protege suas informações pessoais quando você utiliza nosso serviço gratuito para criar 
              currículos compatíveis com sistemas ATS (Applicant Tracking Systems).
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ao usar nosso serviço, você concorda com a coleta e uso de informações de acordo com esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Informações que Coletamos</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1. Informações do LinkedIn</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Quando você opta por importar seus dados do LinkedIn, coletamos as seguintes informações com sua 
              autorização explícita:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Foto de perfil</li>
              <li>Experiências profissionais (empresa, cargo, período, descrição)</li>
              <li>Formação acadêmica (instituição, curso, período)</li>
              <li>Habilidades e competências</li>
              <li>Localização</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Essas informações são coletadas diretamente da API do LinkedIn, com seu consentimento explícito 
              através do processo de autenticação OAuth.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2. Informações Fornecidas Manualmente</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Você também pode fornecer informações manualmente ao criar ou editar seu currículo:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Dados pessoais (nome, telefone, endereço)</li>
              <li>Informações profissionais</li>
              <li>Formação acadêmica</li>
              <li>Habilidades e competências</li>
              <li>Outras informações que você escolher incluir no currículo</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3. Informações Técnicas</h3>
            <p className="text-gray-700 leading-relaxed">
              Coletamos automaticamente algumas informações técnicas quando você usa nosso serviço, incluindo 
              endereço IP, tipo de navegador, páginas visitadas e data/hora de acesso. Essas informações são 
              usadas para melhorar nosso serviço e garantir sua segurança.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Como Usamos Suas Informações</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos as informações coletadas para os seguintes propósitos:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Criação de currículos:</strong> Para preencher e gerar seu currículo no formato selecionado</li>
              <li><strong>Melhoria do serviço:</strong> Para entender como os usuários utilizam nosso serviço e melhorar a experiência</li>
              <li><strong>Comunicação:</strong> Para responder a suas solicitações e fornecer suporte técnico quando necessário</li>
              <li><strong>Segurança:</strong> Para proteger nosso serviço contra fraudes e abusos</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              <strong>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros</strong> para 
              fins comerciais. Seu currículo e dados são privados e não são compartilhados sem sua autorização explícita.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Armazenamento de Dados</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Armazenamento Local:</strong> Seus dados de currículo são processados e armazenados localmente 
              em seu navegador (localStorage/sessionStorage) quando você cria ou edita um currículo. Nós não 
              armazenamos seus dados em nossos servidores de forma permanente.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Tokens de Acesso:</strong> Os tokens de acesso do LinkedIn são armazenados temporariamente 
              em cookies seguros (httpOnly) apenas durante a sessão de importação de dados. Esses tokens expiram 
              automaticamente e não são armazenados permanentemente.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Dados do LinkedIn:</strong> As informações importadas do LinkedIn são processadas em tempo real 
              e não são armazenadas em nossos servidores. Os dados são usados apenas para preencher o formulário 
              de currículo em seu navegador.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Compartilhamento de Informações</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Compartilhamos suas informações apenas nas seguintes situações:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Com o LinkedIn:</strong> Quando você autoriza a importação de dados, compartilhamos 
              informações de autenticação com o LinkedIn conforme necessário para o processo OAuth</li>
              <li><strong>Prestadores de Serviços:</strong> Podemos usar serviços de terceiros (como hospedagem) 
              que têm acesso limitado às informações necessárias para operar o serviço</li>
              <li><strong>Requisitos Legais:</strong> Se exigido por lei ou em resposta a processos legais válidos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Seus Direitos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Você tem os seguintes direitos em relação às suas informações pessoais:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Acesso:</strong> Você pode acessar e revisar os dados do seu currículo a qualquer momento</li>
              <li><strong>Correção:</strong> Você pode editar e corrigir suas informações diretamente no formulário</li>
              <li><strong>Exclusão:</strong> Você pode excluir seus dados a qualquer momento limpando o armazenamento 
              local do navegador ou não salvando o currículo</li>
              <li><strong>Revogação de Consentimento:</strong> Você pode revogar o acesso ao LinkedIn a qualquer momento 
              através das configurações de privacidade do LinkedIn</li>
              <li><strong>Exportação:</strong> Você pode exportar seu currículo em formato PDF ou outro formato disponível</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Segurança</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações 
              contra acesso não autorizado, alteração, divulgação ou destruição:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Uso de HTTPS para todas as comunicações</li>
              <li>Tokens de acesso armazenados de forma segura (cookies httpOnly)</li>
              <li>Validação de estado (state) para prevenir ataques CSRF</li>
              <li>Processamento de dados do lado do servidor quando necessário</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              No entanto, nenhum método de transmissão pela Internet ou armazenamento eletrônico é 100% seguro. 
              Embora nos esforcemos para usar meios comercialmente aceitáveis para proteger suas informações, 
              não podemos garantir segurança absoluta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies e Tecnologias Similares</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Manter sua sessão durante o processo de autenticação OAuth</li>
              <li>Armazenar temporariamente tokens de acesso do LinkedIn</li>
              <li>Melhorar a experiência do usuário</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Você pode controlar o uso de cookies através das configurações do seu navegador. No entanto, 
              desabilitar cookies pode afetar a funcionalidade do serviço.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Serviço de Terceiros</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nosso serviço utiliza a API do LinkedIn para importação de dados. Ao usar essa funcionalidade, 
              você também está sujeito à Política de Privacidade do LinkedIn. Recomendamos que você leia 
              a política de privacidade do LinkedIn para entender como eles coletam e usam suas informações.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Link para a Política de Privacidade do LinkedIn:{' '}
              <a 
                href="https://www.linkedin.com/legal/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#0033A0] hover:underline"
              >
                https://www.linkedin.com/legal/privacy-policy
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Menores de Idade</h2>
            <p className="text-gray-700 leading-relaxed">
              Nosso serviço não é direcionado a menores de 18 anos. Não coletamos intencionalmente informações 
              pessoais de menores de 18 anos. Se você é pai/mãe ou responsável e acredita que seu filho nos 
              forneceu informações pessoais, entre em contato conosco para que possamos remover essas informações.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Alterações nesta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer 
              alterações publicando a nova Política de Privacidade nesta página e atualizando a data de "Última 
              atualização" no topo desta política. Recomendamos que você revise esta política periodicamente 
              para se manter informado sobre como protegemos suas informações.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contato</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos suas informações 
              pessoais, entre em contato conosco através dos seguintes canais:
            </p>
            <ul className="list-none text-gray-700 space-y-2">
              <li>
                <strong>Email:</strong> privacidade@seudominio.com
              </li>
              <li>
                <strong>Website:</strong> https://seudominio.com/contato
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Nota:</strong> Atualize os dados de contato acima com suas informações reais antes de 
              publicar esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Consentimento</h2>
            <p className="text-gray-700 leading-relaxed">
              Ao usar nosso serviço, você consente com nossa Política de Privacidade e concorda com seus termos. 
              Se você não concordar com esta política, por favor, não use nosso serviço.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Esta Política de Privacidade é efetiva a partir de {new Date().toLocaleDateString('pt-BR')} e 
              permanece em vigor, exceto no que diz respeito a quaisquer alterações em suas disposições no futuro, 
              que entrarão em vigor imediatamente após serem publicadas nesta página.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

