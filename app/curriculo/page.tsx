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

  const initializeFormData = (template: any) => {
    const data: any = {};
    
    // Campos básicos (com valores de teste)
    if (template.name) data.name = 'João Silva';
    if (template.headline) data.headline = 'Desenvolvedor Full Stack';
    if (template.location) data.location = 'São Paulo, SP, Brasil';
    if (template.summary) data.summary = 'Desenvolvedor com mais de 5 anos de experiência em desenvolvimento web, especializado em React, Node.js e arquiteturas cloud. Apaixonado por criar soluções escaláveis e eficientes.';
    if (template.education) data.education = 'Bacharelado em Ciência da Computação - Universidade de São Paulo (2015-2019)';
    
    // Contact (com valores de teste)
    if (template.contact) {
      data.contact = {
        email: 'joao.silva@email.com',
        phone: '+55 11 98765-4321',
        linkedin: 'https://linkedin.com/in/joaosilva',
        github: 'https://github.com/joaosilva',
      };
    }
    
    // Skills (opcional - com valores de teste)
    if (template.skills) {
      data.skills = {};
      Object.keys(template.skills).forEach((key) => {
        if (key === 'languages') data.skills[key] = 'JavaScript, TypeScript, Python, Java';
        else if (key === 'frameworks') data.skills[key] = 'React, Next.js, Node.js, Express';
        else if (key === 'cloud') data.skills[key] = 'AWS, Docker, Kubernetes';
        else if (key === 'observability') data.skills[key] = 'Prometheus, Grafana, ELK Stack';
        else data.skills[key] = 'Skill exemplo';
      });
    }
    
    // Experience (array - com valores de teste)
    if (template.experience && Array.isArray(template.experience)) {
      data.experience = template.experience.map((_: any, index: number) => ({
        company: `Empresa ${index + 1}`,
        role: `Desenvolvedor ${index === 0 ? 'Sênior' : 'Pleno'}`,
        location: 'São Paulo, SP',
        period: `${2020 + index}/01 - ${2022 + index}/12`,
        description: `Responsável pelo desenvolvimento e manutenção de aplicações web utilizando React e Node.js. Trabalhei em projetos de grande escala, colaborando com equipes multidisciplinares.`,
      }));
    }
    
    // Campos opcionais adicionais
    Object.keys(template).forEach((key) => {
      if (!['name', 'headline', 'location', 'contact', 'summary', 'skills', 'experience', 'education'].includes(key)) {
        if (typeof template[key] === 'string') {
          data[key] = 'Valor de exemplo para campo opcional';
        }
      }
    });
    
    setFormData(data);
  };

  useEffect(() => {
    // Verificar se há modelo selecionado no sessionStorage
    const savedModel = sessionStorage.getItem('selectedModel');
    if (savedModel) {
      try {
        const model = JSON.parse(savedModel);
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
      } catch (e) {
        console.error('Erro ao restaurar modelo:', e);
      }
    } else {
      // Se não há modelo selecionado, abrir modal
      setIsModalOpen(true);
    }

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
    // Salvar modelo no sessionStorage para persistir após reload
    sessionStorage.setItem('selectedModel', JSON.stringify(model));
    
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

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const markdown = generateMarkdown();

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
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsGeneratingPDF(false);
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
                onClick={() => {
                  // Função para download será implementada depois
                  console.log('Download do currículo');
                }}
                className="px-6 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002a8a] transition-colors font-medium"
              >
                Download
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
              <h1 className="text-3xl font-bold text-[#0033A0] mb-2">
                Modelo: {selectedModel.name}
              </h1>
              <p className="text-gray-600">{selectedModel.description}</p>
            </div>
            {/* Formulário do currículo */}
            {modelTemplate && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
                <form className="space-y-8">
                  {/* Campos Básicos */}
                  <section>
                    <h2 className="text-2xl font-bold text-[#0033A0] mb-6">Informações Básicas</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Headline / Título Profissional *
                        </label>
                        <input
                          type="text"
                          value={formData.headline || ''}
                          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Localização *
                        </label>
                        <input
                          type="text"
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                          required
                        />
                      </div>
                    </div>
                  </section>

                  {/* Contato */}
                  {modelTemplate.contact && (
                    <section>
                      <h2 className="text-2xl font-bold text-[#0033A0] mb-6">Contato</h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.contact?.email || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              contact: { ...formData.contact, email: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            value={formData.contact?.phone || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              contact: { ...formData.contact, phone: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            LinkedIn
                          </label>
                          <input
                            type="url"
                            value={formData.contact?.linkedin || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              contact: { ...formData.contact, linkedin: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GitHub
                          </label>
                          <input
                            type="url"
                            value={formData.contact?.github || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              contact: { ...formData.contact, github: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                          />
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Resumo */}
                  {modelTemplate.summary && (
                    <section>
                      <h2 className="text-2xl font-bold text-[#0033A0] mb-6">Resumo Profissional</h2>
                      <textarea
                        value={formData.summary || ''}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                        placeholder="Descreva brevemente sua experiência e objetivos profissionais..."
                      />
                    </section>
                  )}

                  {/* Experiência Profissional (Array) */}
                  {modelTemplate.experience && Array.isArray(modelTemplate.experience) && (
                    <section>
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
                  )}

                  {/* Educação */}
                  {modelTemplate.education && (
                    <section>
                      <h2 className="text-2xl font-bold text-[#0033A0] mb-6">Formação Acadêmica</h2>
                      <textarea
                        value={formData.education || ''}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                        placeholder="Ex: Bacharelado em Ciência da Computação - Universidade XYZ (2015-2019)"
                      />
                    </section>
                  )}

                  {/* Skills (Opcional - Dinâmico) */}
                  {modelTemplate.skills && (
                    <section>
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
                  )}

                  {/* Campos Opcionais Adicionais */}
                  {modelTemplate && Object.keys(modelTemplate).filter(key => 
                    !['name', 'headline', 'location', 'contact', 'summary', 'skills', 'experience', 'education'].includes(key) &&
                    typeof modelTemplate[key] === 'string'
                  ).map((key) => {
                    const isVisible = formData.hasOwnProperty(key);
                    return (
                      <section key={key}>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-bold text-[#0033A0] capitalize">
                            {key.replace(/_/g, ' ')}
                          </h2>
                          {!isVisible ? (
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, [key]: '' })}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                            >
                              + Adicionar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const newData = { ...formData };
                                delete newData[key];
                                setFormData(newData);
                              }}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                        {isVisible && (
                          <textarea
                            value={formData[key] || ''}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] outline-none"
                          />
                        )}
                      </section>
                    );
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
            )}
            
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

