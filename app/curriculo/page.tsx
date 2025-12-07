'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Model {
  name: string;
  description: string;
  file: string;
  created_at: string;
  created_by: string;
  creator_url?: string;
}

interface ModelsList {
  models: Model[];
}

export default function CurriculoPage() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar lista de modelos
    fetch('/models/list.json')
      .then((res) => res.json())
      .then((data: ModelsList) => {
        setModels(data.models);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar modelos:', err);
        setLoading(false);
      });
  }, []);

  const handleSelectModel = (model: Model) => {
    setSelectedModel(model);
    setIsModalOpen(false);
    // Aqui você pode carregar o modelo selecionado
    console.log('Modelo selecionado:', model);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmExit = () => {
    router.push('/');
  };

  const handleCancelExit = () => {
    setShowConfirmModal(false);
  };

  const handleImportLinkedIn = () => {
    // Redirecionar para a API de autenticação do LinkedIn
    window.location.href = '/api/auth/linkedin';
  };

  // Verificar se há dados do LinkedIn na URL após callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const linkedinImport = urlParams.get('linkedin_import');
    const dataParam = urlParams.get('data');
    const error = urlParams.get('error');

    if (error) {
      console.error('Erro ao importar do LinkedIn:', error);
      // Limpar URL
      window.history.replaceState({}, '', '/curriculo');
      return;
    }

    if (linkedinImport === 'success' && dataParam) {
      try {
        const linkedInData = JSON.parse(decodeURIComponent(dataParam));
        console.log('Dados do LinkedIn:', linkedInData);
        // Aqui você pode processar e preencher o formulário com os dados
        // Por enquanto apenas logamos
        // Limpar URL
        window.history.replaceState({}, '', '/curriculo');
      } catch (e) {
        console.error('Erro ao processar dados do LinkedIn:', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Deseja realmente sair?
            </h3>
            <p className="text-gray-600 mb-6">
              Você será redirecionado para a página inicial. Deseja continuar?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelExit}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-6 py-2 bg-[#0033A0] text-white font-medium transition-colors rounded-lg hover:bg-[#002a8a]"
              >
                Sim, sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Modelo */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="bg-[#0033A0] text-white px-6 py-4">
              <h2 className="text-2xl font-bold">Selecione um Modelo de Currículo</h2>
              <p className="text-white/90 text-sm mt-1">
                Escolha o modelo que melhor se adapta ao seu perfil
              </p>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0033A0]"></div>
                </div>
              ) : models.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Nenhum modelo disponível no momento.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {models.map((model, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#0033A0] hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => handleSelectModel(model)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0033A0] transition-colors">
                          {model.name}
                        </h3>
                        <div className="w-8 h-8 rounded-full bg-[#0033A0]/10 flex items-center justify-center group-hover:bg-[#0033A0] transition-colors">
                          <svg
                            className="w-5 h-5 text-[#0033A0] group-hover:text-white transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {model.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                        <span>{new Date(model.created_at + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        {model.creator_url && model.creator_url.trim() !== '' ? (
                          <a
                            href={model.creator_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#0033A0] hover:underline font-medium flex items-center gap-1"
                          >
                            {model.created_by}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span>{model.created_by}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Conteúdo Principal (quando modelo for selecionado) */}
      <div className="container mx-auto px-4 py-8">
        {selectedModel && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#0033A0] mb-2">
                    Modelo: {selectedModel.name}
                  </h1>
                  <p className="text-gray-600">{selectedModel.description}</p>
                </div>
                <button
                  onClick={handleImportLinkedIn}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002a8a] transition-colors font-medium text-sm whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                  </svg>
                  Importar do LinkedIn
                </button>
              </div>
            </div>
            {/* Aqui será o formulário/editor do currículo */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
              <p className="text-gray-500 text-center py-12">
                Editor de currículo será implementado aqui
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

