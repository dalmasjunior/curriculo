export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#0033A0] mb-4">
            Gerador de Currículos ATS
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Crie currículos profissionais compatíveis com sistemas ATS de forma gratuita e fácil
          </p>
        </div>

        {/* Presentation Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Sobre o Projeto
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Bem-vindo ao nosso gerador de currículos gratuito! Nosso objetivo é ajudar você a criar currículos profissionais que sejam facilmente lidos e processados pelos sistemas ATS (Applicant Tracking Systems) usados pelas empresas.
            </p>
            <p>
              Com nosso serviço, você pode criar currículos otimizados que aumentam suas chances de passar pela triagem inicial e chegar até os recrutadores. Tudo isso de forma completamente gratuita e sem complicações.
            </p>
            <p className="font-medium text-[#0033A0]">
              Comece agora mesmo escolhendo uma das opções abaixo:
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <a
            href="/curriculo"
            className="group relative bg-[#0033A0] text-white rounded-xl px-8 py-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-[#002a8a] transform hover:-translate-y-1 block"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Novo Currículo</h3>
              <p className="text-white/90 text-sm">
                Crie um novo currículo do zero
              </p>
            </div>
          </a>

          <a
            href="/editor"
            className="group relative bg-white border-2 border-[#0033A0] text-[#0033A0] rounded-xl px-8 py-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-[#0033A0] hover:text-white transform hover:-translate-y-1 block"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#0033A0]/10 rounded-full flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Novo Modelo</h3>
              <p className="text-sm opacity-90 group-hover:opacity-100">
                Crie um novo modelo de currículo
              </p>
            </div>
          </a>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Serviço 100% gratuito • Sem cadastro necessário • Compatível com ATS</p>
        </div>
      </main>
    </div>
  );
}
