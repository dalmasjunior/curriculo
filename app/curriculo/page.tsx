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
  const [isModalOpen, setIsModalOpen] = useState(false); // Iniciar fechado, será aberto se necessário
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [modelTemplate, setModelTemplate] = useState<any>(null);
  const [markdownTemplate, setMarkdownTemplate] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [showPreview, setShowPreview] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showStarRequest, setShowStarRequest] = useState(false);
  const [isDownloadingFromPreview, setIsDownloadingFromPreview] = useState(false);

  // Função para determinar o tipo de input baseado no nome do campo
  const getInputType = (fieldName: string, fieldValue: any): 'input' | 'textarea' => {
    // Campos que sempre devem ser textarea
    const textareaFields = ['summary', 'description', 'education', 'content', 'bio', 'about'];
    
    // Verifica se o nome do campo contém palavras-chave de textarea
    const lowerName = fieldName.toLowerCase();
    if (textareaFields.some(field => lowerName.includes(field))) {
      return 'textarea';
    }
    
    // Se o valor é uma string e contém quebras de linha ou é muito longo, usar textarea
    if (typeof fieldValue === 'string' && (fieldValue.includes('\n') || fieldValue.length > 100)) {
      return 'textarea';
    }
    
    // Por padrão, usar input simples
    return 'input';
  };

  // Função para processar o template e retornar campos ordenados
  const processTemplate = (template: any) => {
    const fields: Array<{
      key: string;
      type: 'string' | 'object' | 'array';
      inputType?: 'input' | 'textarea';
      value: any;
      path: string[];
    }> = [];

    const processObject = (obj: any, path: string[] = []) => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key];
        
        if (typeof value === 'string') {
          // Campo string simples
          fields.push({
            key,
            type: 'string',
            inputType: getInputType(key, value),
            value,
            path: currentPath,
          });
        } else if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            // Array (como experience)
            fields.push({
              key,
              type: 'array',
              value,
              path: currentPath,
            });
          } else {
            // Objeto (como contact, skills)
            fields.push({
              key,
              type: 'object',
              value,
              path: currentPath,
            });
            // Processar recursivamente os campos do objeto
            processObject(value, currentPath);
          }
        }
      }
    };

    processObject(template);
    return fields;
  };

  const initializeFormData = (template: any) => {
    const data: any = {};
    
    // Processar template para obter todos os campos
    const fields = processTemplate(template);
    
    // Inicializar campos básicos
    fields.forEach(field => {
      if (field.type === 'string') {
        // Campos simples na raiz
        if (field.path.length === 1) {
          data[field.key] = '';
        }
      } else if (field.type === 'object' && field.path.length === 1) {
        // Objetos na raiz (contact, skills, e objetos customizados)
        if (field.key === 'contact') {
          data.contact = {
            email: '',
            phone: '',
            linkedin: '',
            github: '',
          };
        } else if (field.key === 'skills') {
          data.skills = {};
          if (field.value && typeof field.value === 'object') {
            Object.keys(field.value).forEach((key) => {
              data.skills[key] = '';
            });
          }
        } else {
          // Objetos customizados genéricos
          data[field.key] = {};
          if (field.value && typeof field.value === 'object') {
            Object.keys(field.value).forEach((key) => {
              data[field.key][key] = '';
            });
          }
        }
      } else if (field.type === 'array' && field.path.length === 1) {
        // Arrays na raiz (experience)
        if (field.key === 'experience' && Array.isArray(field.value)) {
          data.experience = field.value.map(() => ({
            company: '',
            role: '',
            location: '',
            period: '',
            description: '',
          }));
        }
      }
    });
    
    // Garantir que todos os campos string da raiz sejam inicializados (fallback)
    Object.keys(template).forEach((key) => {
      if (typeof template[key] === 'string' && !data.hasOwnProperty(key)) {
        data[key] = '';
      }
    });
    
    setFormData(data);
  };

  useEffect(() => {
    // Sempre abrir modal de seleção ao entrar na página
    setIsModalOpen(true);

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
    
    // Carregar template do modelo (JSON e Markdown)
    const jsonPromise = fetch(`/models/${model.file}`).then(res => {
      if (!res.ok) throw new Error(`Erro ao carregar ${model.file}`);
      return res.json();
    });
    
    const mdFile = model.file.replace('.json', '.md');
    const mdPromise = fetch(`/models/${mdFile}`).then(res => {
      if (!res.ok) {
        console.warn(`Arquivo markdown ${mdFile} não encontrado, usando template padrão`);
        // Retornar template padrão se não encontrar o arquivo
        return `# {{name}}
{{headline}}
{{location}}
Email: {{email}}
Phone: {{phone}}
LinkedIn: {{linkedin}}
GitHub: {{github}}

---

## Summary
{{summary}}

---

## Core Skills
{{skills_languages}}
{{skills_frameworks}}
{{skills_cloud}}
{{skills_observability}}

---

## Experience

### {{exp1_company}} — {{exp1_role}}
{{exp1_location}} — {{exp1_period}}
{{exp1_description}}

---

### {{exp2_company}} — {{exp2_role}}
{{exp2_location}} — {{exp2_period}}
{{exp2_description}}

---

## Education
{{education}}`;
      }
      return res.text();
    });
    
    Promise.all([jsonPromise, mdPromise])
      .then(([template, mdTemplate]) => {
        console.log('Template carregado:', template);
        console.log('Markdown template carregado:', mdTemplate.substring(0, 100));
        setModelTemplate(template);
        setMarkdownTemplate(mdTemplate);
        initializeFormData(template);
      })
      .catch((err) => {
        console.error('Erro ao carregar modelo:', err);
        alert(`Erro ao carregar modelo: ${err.message}. Verifique se os arquivos existem.`);
      });
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

  const handleChangeModel = () => {
    // Limpar dados do formulário e modelo atual
    setFormData({});
    setModelTemplate(null);
    setMarkdownTemplate('');
    setSelectedModel(null);
    setShowPreview(false);
    setMarkdownContent('');
    // Abrir modal de seleção
    setIsModalOpen(true);
  };

  const generateMarkdown = () => {
    if (!markdownTemplate) {
      console.error('Markdown template não carregado');
      return 'Template não carregado. Por favor, recarregue a página.';
    }

    let markdown = markdownTemplate;
    console.log('Template original:', markdownTemplate.substring(0, 200));

    // Substituir campos básicos (remover seções vazias)
    markdown = markdown.replace(/\{\{name\}\}/g, formData.name || '');
    markdown = markdown.replace(/\{\{headline\}\}/g, formData.headline || '');
    markdown = markdown.replace(/\{\{location\}\}/g, formData.location || '');
    
    // Summary - remover seção se vazio (incluindo separador --- que vem depois)
    if (formData.summary && formData.summary.trim()) {
      markdown = markdown.replace(/\{\{summary\}\}/g, formData.summary);
    } else {
      // Remove a seção e o separador --- que vem imediatamente depois
      markdown = markdown.replace(/## Summary[\s\S]*?\n---\n/g, '');
      markdown = markdown.replace(/## Summary[\s\S]*?(?=##|$)/, '');
    }
    
    // Education - remover seção se vazio (incluindo separador --- que vem depois)
    if (formData.education && formData.education.trim()) {
      markdown = markdown.replace(/\{\{education\}\}/g, formData.education);
    } else {
      // Remove a seção e o separador --- que vem imediatamente depois
      markdown = markdown.replace(/## Education[\s\S]*?\n---\n/g, '');
      markdown = markdown.replace(/## Education[\s\S]*?(?=##|$)/, '');
    }

    // Substituir contato (remover linhas vazias)
    if (formData.contact?.email) {
      markdown = markdown.replace(/\{\{email\}\}/g, formData.contact.email);
    } else {
      markdown = markdown.replace(/Email: \{\{email\}\}\n?/g, '');
    }
    
    if (formData.contact?.phone) {
      markdown = markdown.replace(/\{\{phone\}\}/g, formData.contact.phone);
    } else {
      markdown = markdown.replace(/Phone: \{\{phone\}\}\n?/g, '');
    }
    
    if (formData.contact?.linkedin) {
      markdown = markdown.replace(/\{\{linkedin\}\}/g, formData.contact.linkedin);
    } else {
      markdown = markdown.replace(/LinkedIn: \{\{linkedin\}\}\n?/g, '');
    }
    
    if (formData.contact?.github) {
      markdown = markdown.replace(/\{\{github\}\}/g, formData.contact.github);
    } else {
      markdown = markdown.replace(/GitHub: \{\{github\}\}\n?/g, '');
    }
    
    // Remover linhas vazias de contato no início
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    // Substituir skills dinamicamente
    if (formData.skills && Object.keys(formData.skills).length > 0) {
      const filledSkills = Object.entries(formData.skills).filter(([_, value]) => value && value.toString().trim());
      
      if (filledSkills.length > 0) {
        // Encontrar a seção de skills no markdown
        const skillsSectionRegex = /## Core Skills[\s\S]*?(?=---|##|$)/;
        const skillsMatch = markdown.match(skillsSectionRegex);
        
        if (skillsMatch) {
          // Criar lista dinâmica de skills preenchidas como parágrafo único
          // Usar HTML <br> para quebras de linha dentro do parágrafo
          const skillsList = filledSkills
            .map(([key, value]) => {
              const skillName = key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
              return `<strong>${skillName}:</strong> ${value}`;
            })
            .join('<br>');
          
          // Substituir toda a seção de skills com parágrafo HTML (evitar interpretação como H2 pelo marked)
          const newSkillsSection = `## Core Skills\n\n<p>${skillsList}</p>\n\n`;
          markdown = markdown.replace(skillsSectionRegex, newSkillsSection);
        }
      } else {
        // Remover seção de skills se não houver nenhuma preenchida (incluindo separador --- que vem depois)
        markdown = markdown.replace(/## Core Skills[\s\S]*?\n---\n/g, '');
        markdown = markdown.replace(/## Core Skills[\s\S]*?(?=##|$)/, '');
      }
    } else {
      // Remover seção de skills se não houver nenhuma (incluindo separador --- que vem depois)
      markdown = markdown.replace(/## Core Skills[\s\S]*?\n---\n/g, '');
      markdown = markdown.replace(/## Core Skills[\s\S]*?(?=##|$)/, '');
    }
    
    // Remover placeholders de skills não substituídos (fallback)
    markdown = markdown.replace(/\{\{skills_\w+\}\}/g, '');

    // Substituir experiência (array dinâmico)
    // Encontrar o padrão de template de experiência no markdown original
    const expPattern = /### \{\{exp\d+_company\}\} — \{\{exp\d+_role\}\}[\s\S]*?(?=---|###|##|$)/;
    const expMatch = markdownTemplate.match(expPattern);
    
    if (expMatch && formData.experience && formData.experience.length > 0) {
      // Criar template baseado no primeiro exemplo encontrado
      let expTemplate = expMatch[0];
      
      // Substituir todas as experiências do template por experiências reais
      const experiences = formData.experience
        .filter((exp: any) => exp.company || exp.role)
        .map((exp: any) => {
          let expText = expTemplate
            .replace(/\{\{exp\d+_company\}\}/g, exp.company || '')
            .replace(/\{\{exp\d+_role\}\}/g, exp.role || '')
            .replace(/\{\{exp\d+_location\}\}/g, exp.location || '')
            .replace(/\{\{exp\d+_period\}\}/g, exp.period || '')
            .replace(/\{\{exp\d+_description\}\}/g, exp.description || '');
          return expText;
        })
        .join('\n\n---\n\n');

      // Substituir todas as ocorrências de experiência no markdown
      markdown = markdown.replace(/### \{\{exp\d+_company\}\} — \{\{exp\d+_role\}\}[\s\S]*?(?=---|###|##|$)/g, '');
      
      // Inserir experiências reais após "## Experience"
      const experienceIndex = markdown.indexOf('## Experience');
      if (experienceIndex !== -1) {
        const afterTitle = markdown.indexOf('\n', experienceIndex) + 1;
        markdown = markdown.slice(0, afterTitle) + '\n\n' + experiences + '\n\n' + markdown.slice(afterTitle);
      }
    } else {
      // Remover placeholders se não houver experiência
      markdown = markdown.replace(/### \{\{exp\d+_company\}\} — \{\{exp\d+_role\}\}[\s\S]*?(?=---|###|##|$)/g, '');
    }

    // Remover seção de Experience se não houver experiências (incluindo separador --- que vem depois)
    if (!formData.experience || formData.experience.length === 0 || !formData.experience.some((exp: any) => exp.company || exp.role)) {
      markdown = markdown.replace(/## Experience[\s\S]*?\n---\n/g, '');
      markdown = markdown.replace(/## Experience[\s\S]*?(?=##|$)/, '');
    }
    
    // Limpar linhas vazias excessivas (3 ou mais linhas vazias viram 2)
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    
    // Remover linhas vazias no início e fim
    markdown = markdown.trim();

    return markdown;
  };

  const handlePreview = () => {
    console.log('FormData:', formData);
    console.log('MarkdownTemplate:', markdownTemplate);
    const markdown = generateMarkdown();
    console.log('Markdown gerado:', markdown.substring(0, 200));
    setMarkdownContent(markdown);
    setShowPreview(true);
  };

  const handleDownloadPDF = async (markdownToUse?: string, showStarAfter = false) => {
    try {
      const markdown = markdownToUse || generateMarkdown();

      // Chamar API para gerar PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao gerar PDF');
      }

      // Obter nome do arquivo do header Content-Disposition ou usar padrão
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'curriculo.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Criar blob e fazer download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Mostrar pedido de estrela após download bem-sucedido
      if (showStarAfter) {
        setTimeout(() => {
          setShowStarRequest(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await handleDownloadPDF();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadFromPreview = async () => {
    setIsDownloadingFromPreview(true);
    try {
      await handleDownloadPDF(markdownContent, true);
    } finally {
      setIsDownloadingFromPreview(false);
    }
  };

  const renderMarkdown = (markdown: string) => {
    if (!markdown || markdown.trim() === '') {
      return '<p class="text-gray-500">Nenhum conteúdo para exibir. Preencha os campos do formulário.</p>';
    }
    
    // Converter markdown básico para HTML
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-[#0033A0]">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 text-[#0033A0]">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Horizontal rule
      .replace(/^---$/gim, '<hr class="my-6 border-gray-300" />')
      // Links (básico)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#0033A0] hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br />');

    // Agrupar linhas consecutivas em parágrafos
    const lines = html.split('<br />');
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentParagraph.length > 0) {
          paragraphs.push(`<p class="mb-4">${currentParagraph.join('<br />')}</p>`);
          currentParagraph = [];
        }
      } else if (trimmed.startsWith('<h') || trimmed.startsWith('<hr')) {
        if (currentParagraph.length > 0) {
          paragraphs.push(`<p class="mb-4">${currentParagraph.join('<br />')}</p>`);
          currentParagraph = [];
        }
        paragraphs.push(trimmed);
      } else {
        currentParagraph.push(trimmed);
      }
    });

    if (currentParagraph.length > 0) {
      paragraphs.push(`<p class="mb-4">${currentParagraph.join('<br />')}</p>`);
    }

    return paragraphs.join('');
  };

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


      {/* Modal de Solicitação de Estrela */}
      {showStarRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Gostou do resultado?
              </h3>
              <p className="text-gray-600 mb-6">
                Se você gostou do currículo gerado, considere dar uma estrela ⭐ no GitHub para apoiar o projeto!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowStarRequest(false)}
                  className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Talvez depois
                </button>
                <a
                  href="https://github.com/dalmasjunior/curriculo"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowStarRequest(false)}
                  className="px-6 py-2 bg-[#0033A0] text-white font-medium transition-colors rounded-lg hover:bg-[#002a8a] inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  Dar uma estrela
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="bg-[#0033A0] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Visualização do Currículo</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Preview */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              {markdownContent ? (
                <div 
                  className="bg-white rounded-lg p-8 shadow-sm prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(markdownContent) }}
                />
              ) : (
                <div className="bg-white rounded-lg p-8 shadow-sm">
                  <p className="text-gray-500 text-center py-12">
                    Carregando preview...
                  </p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fechar
              </button>
              <button
                onClick={handleDownloadFromPreview}
                disabled={isDownloadingFromPreview}
                className="px-6 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002a8a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloadingFromPreview ? 'Gerando PDF...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal (quando modelo for selecionado) */}
      <div className="container mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <div className="max-w-4xl mx-auto mb-4">
          <button
            onClick={() => router.push('/')}
            className="text-[#0033A0] hover:text-[#002a8a] flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para página inicial
          </button>
        </div>

        {selectedModel && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-[#0033A0] mb-2">
                    Modelo: {selectedModel.name}
                  </h1>
                  <p className="text-gray-600 mb-4">{selectedModel.description}</p>
                  
                  {/* Informações do Criador */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">Criado por:</span>
                      {selectedModel.creator_url && selectedModel.creator_url.trim() !== '' ? (
                        <a
                          href={selectedModel.creator_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0033A0] hover:underline font-medium flex items-center gap-1"
                        >
                          {selectedModel.created_by}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="font-medium">{selectedModel.created_by}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(selectedModel.created_at + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleChangeModel}
                  className="ml-4 px-4 py-2 bg-white border border-[#0033A0] text-[#0033A0] rounded-lg hover:bg-[#0033A0] hover:text-white transition-colors font-medium flex items-center gap-2"
                  title="Trocar modelo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Trocar Modelo
                </button>
              </div>
            </div>
            {/* Formulário do currículo */}
            {modelTemplate && (() => {
              const fields = processTemplate(modelTemplate);
              const rootFields = fields.filter(f => f.path.length === 1);
              
              return (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
                  <form className="space-y-8">
                    {rootFields.map((field) => {
                      // Renderizar campos string simples na raiz
                      if (field.type === 'string') {
                        const inputType = field.inputType || 'input';
                        const fieldValue = formData[field.key] ?? '';
                        
                        return (
                          <section key={field.key}>
                            <h2 className="text-2xl font-bold text-[#0033A0] mb-6 capitalize">
                              {field.key.replace(/_/g, ' ')}
                            </h2>
                            {inputType === 'textarea' ? (
                              <textarea
                                value={fieldValue}
                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                rows={field.key === 'summary' ? 5 : 4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                                placeholder={field.key === 'education' ? 'Ex: Bacharelado em Ciência da Computação - Universidade XYZ (2015-2019)' : ''}
                              />
                            ) : (
                              <input
                                type="text"
                                value={fieldValue}
                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                                required={['name', 'headline', 'location'].includes(field.key)}
                              />
                            )}
                          </section>
                        );
                      }
                      
                      // Renderizar objeto contact
                      if (field.type === 'object' && field.key === 'contact') {
                        return (
                          <section key={field.key}>
                            <h2 className="text-2xl font-bold text-[#0033A0] mb-6">Contato</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                              {['email', 'phone', 'linkedin', 'github'].map((contactKey) => (
                                <div key={contactKey}>
                                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {contactKey === 'email' ? 'Email *' : contactKey === 'phone' ? 'Telefone' : contactKey}
                                  </label>
                                  <input
                                    type={contactKey === 'email' ? 'email' : contactKey === 'phone' ? 'tel' : 'url'}
                                    value={formData.contact?.[contactKey] || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      contact: { ...formData.contact, [contactKey]: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                                    required={contactKey === 'email'}
                                  />
                                </div>
                              ))}
                            </div>
                          </section>
                        );
                      }
                      
                      // Renderizar objetos customizados genéricos (não contact, não skills)
                      if (field.type === 'object' && field.key !== 'contact' && field.key !== 'skills') {
                        const customObject = formData[field.key] || {};
                        return (
                          <section key={field.key}>
                            <h2 className="text-2xl font-bold text-[#0033A0] mb-6 capitalize">
                              {field.key.replace(/_/g, ' ')}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                              {Object.keys(customObject).map((subKey) => (
                                <div key={subKey}>
                                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {subKey.replace(/_/g, ' ')}
                                  </label>
                                  <input
                                    type="text"
                                    value={customObject[subKey] || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      [field.key]: {
                                        ...customObject,
                                        [subKey]: e.target.value
                                      }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          </section>
                        );
                      }
                      
                      // Renderizar objeto skills
                      if (field.type === 'object' && field.key === 'skills') {
                        return (
                          <section key={field.key}>
                            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-2xl font-bold text-[#0033A0]">Habilidades</h2>
                              <button
                                type="button"
                                onClick={() => {
                                  const skillKey = prompt('Nome da categoria de habilidade (ex: languages, frameworks):');
                                  if (skillKey && skillKey.trim()) {
                                    setFormData({
                                      ...formData,
                                      skills: {
                                        ...formData.skills,
                                        [skillKey.trim()]: ''
                                      }
                                    });
                                  }
                                }}
                                className="px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002a8a] transition-colors text-sm font-medium"
                              >
                                + Adicionar Categoria
                              </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                              {formData.skills && Object.keys(formData.skills).map((skillKey) => (
                                <div key={skillKey} className="relative">
                                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {skillKey.replace(/_/g, ' ')}
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.skills[skillKey] || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      skills: {
                                        ...formData.skills,
                                        [skillKey]: e.target.value
                                      }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none pr-10"
                                    placeholder="Ex: JavaScript, Python, Java"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newSkills = { ...formData.skills };
                                      delete newSkills[skillKey];
                                      setFormData({ ...formData, skills: newSkills });
                                    }}
                                    className="absolute right-2 top-9 text-red-500 hover:text-red-700"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </section>
                        );
                      }
                      
                      // Renderizar array experience
                      if (field.type === 'array' && field.key === 'experience') {
                        return (
                          <section key={field.key}>
                            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-2xl font-bold text-[#0033A0]">Experiência Profissional</h2>
                              <button
                                type="button"
                                onClick={() => {
                                  const newExp = {
                                    company: '',
                                    role: '',
                                    location: '',
                                    period: '',
                                    description: '',
                                  };
                                  setFormData({
                                    ...formData,
                                    experience: [...(formData.experience || []), newExp]
                                  });
                                }}
                                className="px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002a8a] transition-colors text-sm font-medium"
                              >
                                + Adicionar Experiência
                              </button>
                            </div>
                            <div className="space-y-6">
                              {(formData.experience || []).map((exp: any, index: number) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
                                  {formData.experience.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newExp = formData.experience.filter((_: any, i: number) => i !== index);
                                        setFormData({ ...formData, experience: newExp });
                                      }}
                                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Empresa *
                                      </label>
                                      <input
                                        type="text"
                                        value={exp.company || ''}
                                        onChange={(e) => {
                                          const newExp = [...formData.experience];
                                          newExp[index].company = e.target.value;
                                          setFormData({ ...formData, experience: newExp });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cargo *
                                      </label>
                                      <input
                                        type="text"
                                        value={exp.role || ''}
                                        onChange={(e) => {
                                          const newExp = [...formData.experience];
                                          newExp[index].role = e.target.value;
                                          setFormData({ ...formData, experience: newExp });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Localização
                                      </label>
                                      <input
                                        type="text"
                                        value={exp.location || ''}
                                        onChange={(e) => {
                                          const newExp = [...formData.experience];
                                          newExp[index].location = e.target.value;
                                          setFormData({ ...formData, experience: newExp });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Período *
                                      </label>
                                      <input
                                        type="text"
                                        value={exp.period || ''}
                                        onChange={(e) => {
                                          const newExp = [...formData.experience];
                                          newExp[index].period = e.target.value;
                                          setFormData({ ...formData, experience: newExp });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                                        placeholder="Ex: Jan 2020 - Dez 2022"
                                        required
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descrição
                                      </label>
                                      <textarea
                                        value={exp.description || ''}
                                        onChange={(e) => {
                                          const newExp = [...formData.experience];
                                          newExp[index].description = e.target.value;
                                          setFormData({ ...formData, experience: newExp });
                                        }}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        );
                      }
                      
                      return null;
                    })}

                  {/* Botão de Salvar/Exportar */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handlePreview}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Visualizar
                    </button>
                    <button
                      type="button"
                      onClick={handleGeneratePDF}
                      disabled={isGeneratingPDF}
                      className="px-6 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002a8a] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isGeneratingPDF ? 'Gerando PDF...' : 'Gerar Currículo'}
                    </button>
                  </div>
                </form>
              </div>
            );
            })()}
            
            {!modelTemplate && selectedModel && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
                <p className="text-gray-500 text-center py-12">
                  Carregando modelo...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

