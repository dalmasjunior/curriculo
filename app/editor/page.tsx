'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showHelper, setShowHelper] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    modelName: '',
    description: '',
    creatorName: '',
    creatorLinkedIn: '',
    jsonContent: '',
    markdownContent: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Validar JSON em tempo real
    if (name === 'jsonContent') {
      validateJson(value);
    }
  };

  // Função para validar JSON
  const validateJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setJsonError(null);
      return;
    }
    
    try {
      JSON.parse(jsonString);
      setJsonError(null);
    } catch (err) {
      if (err instanceof Error) {
        setJsonError(err.message);
      } else {
        setJsonError('Erro ao validar JSON');
      }
    }
  };

  // Função para formatar JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(formData.jsonContent);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormData(prev => ({
        ...prev,
        jsonContent: formatted,
      }));
      setJsonError(null);
    } catch (err) {
      setError('Não é possível formatar JSON inválido. Corrija os erros primeiro.');
    }
  };

  const loadExample = async () => {
    try {
      // Carregar JSON de exemplo
      const jsonResponse = await fetch('/models/default.json');
      const jsonData = await jsonResponse.text();
      
      // Carregar Markdown de exemplo
      const mdResponse = await fetch('/models/default.md');
      const mdData = await mdResponse.text();

      setFormData(prev => ({
        ...prev,
        jsonContent: jsonData,
        markdownContent: mdData,
      }));
    } catch (err) {
      setError('Erro ao carregar exemplo. Por favor, preencha manualmente.');
    }
  };

  // Função para gerar dados de exemplo baseados no JSON
  const generateExampleData = (jsonTemplate: string) => {
    try {
      const template = JSON.parse(jsonTemplate);
      const exampleData: any = {};

      // Processar campos simples
      Object.keys(template).forEach((key) => {
        if (typeof template[key] === 'string') {
          const placeholder = template[key];
          if (placeholder.includes('{{')) {
            // Gerar exemplo baseado no nome do campo
            if (key === 'name') exampleData[key] = 'João Silva';
            else if (key === 'headline') exampleData[key] = 'Desenvolvedor Full Stack';
            else if (key === 'location') exampleData[key] = 'São Paulo, SP';
            else if (key === 'summary') exampleData[key] = 'Desenvolvedor com experiência em tecnologias modernas e apaixonado por criar soluções inovadoras.';
            else if (key === 'education') exampleData[key] = 'Bacharelado em Ciência da Computação - Universidade XYZ (2015-2019)';
            else {
              // Para campos customizados, gerar exemplo baseado no nome
              const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
              exampleData[key] = `Exemplo de ${fieldName}`;
            }
          }
        } else if (typeof template[key] === 'object' && template[key] !== null) {
          if (Array.isArray(template[key])) {
            // Array (experience)
            exampleData[key] = template[key].map((item: any, index: number) => {
              const expData: any = {};
              Object.keys(item).forEach((expKey) => {
                if (expKey === 'company') expData[expKey] = `Empresa ${index + 1}`;
                else if (expKey === 'role') expData[expKey] = `Cargo ${index + 1}`;
                else if (expKey === 'location') expData[expKey] = 'São Paulo, SP';
                else if (expKey === 'period') expData[expKey] = `Jan ${2020 + index} - Dez ${2022 + index}`;
                else if (expKey === 'description') expData[expKey] = `Descrição da experiência ${index + 1}`;
                else expData[expKey] = `Exemplo ${expKey}`;
              });
              return expData;
            });
          } else {
            // Objeto (contact, skills)
            exampleData[key] = {};
            Object.keys(template[key]).forEach((subKey) => {
              if (key === 'contact') {
                if (subKey === 'email') exampleData[key][subKey] = 'joao.silva@email.com';
                else if (subKey === 'phone') exampleData[key][subKey] = '+55 11 99999-9999';
                else if (subKey === 'linkedin') exampleData[key][subKey] = 'https://linkedin.com/in/joaosilva';
                else if (subKey === 'github') exampleData[key][subKey] = 'https://github.com/joaosilva';
                else exampleData[key][subKey] = `Exemplo ${subKey}`;
              } else if (key === 'skills') {
                const skillName = subKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                exampleData[key][subKey] = `JavaScript, Python, Java, React, Node.js`;
              } else {
                const subFieldName = subKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                exampleData[key][subKey] = `Exemplo de ${subFieldName}`;
              }
            });
          }
        }
      });

      return exampleData;
    } catch (err) {
      console.error('Erro ao gerar dados de exemplo:', err);
      return {};
    }
  };

  // Função para substituir placeholders no markdown
  const generatePreviewMarkdown = () => {
    if (!formData.jsonContent || !formData.markdownContent) {
      return 'Preencha o JSON e o Markdown para visualizar o preview.';
    }

    try {
      const exampleData = generateExampleData(formData.jsonContent);
      let markdown = formData.markdownContent;

      // Substituir campos básicos
      Object.keys(exampleData).forEach((key) => {
        if (typeof exampleData[key] === 'string') {
          markdown = markdown.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), exampleData[key]);
        } else if (typeof exampleData[key] === 'object' && exampleData[key] !== null) {
          if (Array.isArray(exampleData[key])) {
            // Array (experience)
            const expPattern = /### \{\{exp\d+_company\}\} — \{\{exp\d+_role\}\}[\s\S]*?(?=---|###|##|$)/;
            const expMatch = markdown.match(expPattern);
            
            if (expMatch && exampleData[key].length > 0) {
              let expTemplate = expMatch[0];
              const experiences = exampleData[key].map((exp: any, index: number) => {
                let expText = expTemplate
                  .replace(/\{\{exp\d+_company\}\}/g, exp.company || '')
                  .replace(/\{\{exp\d+_role\}\}/g, exp.role || '')
                  .replace(/\{\{exp\d+_location\}\}/g, exp.location || '')
                  .replace(/\{\{exp\d+_period\}\}/g, exp.period || '')
                  .replace(/\{\{exp\d+_description\}\}/g, exp.description || '');
                return expText;
              }).join('\n\n---\n\n');

              // Substituir todas as ocorrências de experiência no markdown
              markdown = markdown.replace(/### \{\{exp\d+_company\}\} — \{\{exp\d+_role\}\}[\s\S]*?(?=---|###|##|$)/g, '');
              
              const experienceIndex = markdown.indexOf('## Experience');
              if (experienceIndex !== -1) {
                const afterTitle = markdown.indexOf('\n', experienceIndex) + 1;
                markdown = markdown.slice(0, afterTitle) + '\n\n' + experiences + '\n\n' + markdown.slice(afterTitle);
              }
            }
          } else {
            // Objeto (contact, skills)
            Object.keys(exampleData[key]).forEach((subKey) => {
              if (key === 'contact') {
                markdown = markdown.replace(new RegExp(`\\{\\{${subKey}\\}\\}`, 'g'), exampleData[key][subKey] || '');
              } else if (key === 'skills') {
                markdown = markdown.replace(
                  new RegExp(`\\{\\{skills_${subKey}\\}\\}`, 'g'),
                  exampleData[key][subKey] || ''
                );
              }
            });
          }
        }
      });

      // Substituir placeholders restantes (campos customizados que não foram capturados)
      // Procurar por padrões como {{campo}} e substituir se existir em exampleData
      const remainingPlaceholders = markdown.match(/\{\{([^}]+)\}\}/g);
      if (remainingPlaceholders) {
        remainingPlaceholders.forEach((placeholder) => {
          const key = placeholder.replace(/\{\{|\}\}/g, '');
          // Tentar encontrar o valor em exampleData (pode estar em qualquer nível)
          const findValue = (obj: any, searchKey: string): string | null => {
            for (const k in obj) {
              if (k === searchKey && typeof obj[k] === 'string') {
                return obj[k];
              }
              if (typeof obj[k] === 'object' && obj[k] !== null) {
                const found = findValue(obj[k], searchKey);
                if (found) return found;
              }
            }
            return null;
          };
          
          const value = findValue(exampleData, key);
          if (value) {
            markdown = markdown.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
          }
        });
      }

      // Remover placeholders não substituídos (deixar vazio)
      markdown = markdown.replace(/\{\{[^}]+\}\}/g, '');

      // Limpar linhas vazias excessivas
      markdown = markdown.replace(/\n{3,}/g, '\n\n');
      markdown = markdown.trim();

      return markdown;
    } catch (err) {
      console.error('Erro ao gerar preview:', err);
      return 'Erro ao gerar preview. Verifique se o JSON e Markdown estão corretos.';
    }
  };

  // Função para renderizar markdown em HTML
  const renderMarkdown = (markdown: string) => {
    if (!markdown || markdown.trim() === '') {
      return '<p class="text-gray-500">Nenhum conteúdo para exibir.</p>';
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

  const handlePreview = () => {
    const markdown = generatePreviewMarkdown();
    setPreviewContent(markdown);
    setShowPreview(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    setPrUrl(null);

    try {
      // Validações básicas
      if (!formData.modelName.trim()) {
        throw new Error('Nome do modelo é obrigatório');
      }
      if (!formData.description.trim()) {
        throw new Error('Descrição é obrigatória');
      }
      if (!formData.creatorName.trim()) {
        throw new Error('Nome do criador é obrigatório');
      }
      if (!formData.jsonContent.trim()) {
        throw new Error('Conteúdo JSON é obrigatório');
      }
      if (!formData.markdownContent.trim()) {
        throw new Error('Conteúdo Markdown é obrigatório');
      }

      // Validar JSON
      try {
        JSON.parse(formData.jsonContent);
      } catch {
        throw new Error('JSON inválido. Por favor, verifique a sintaxe.');
      }

      // Chamar API para criar PR
      const response = await fetch('/api/create-model-pr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar modelo');
      }

      // Armazenar a URL da PR para exibir na mensagem de sucesso
      const url = result.prUrl;
      setPrUrl(url);
      setSuccess('Modelo enviado com sucesso!');
      
      // Limpar formulário após sucesso (apenas se não houver URL)
      if (url) {
        // Manter os dados por um tempo para o usuário ver o link
        setTimeout(() => {
          setFormData({
            modelName: '',
            description: '',
            creatorName: '',
            creatorLinkedIn: '',
            jsonContent: '',
            markdownContent: '',
          });
          setSuccess(null);
          setPrUrl(null);
        }, 15000);
      } else {
        setFormData({
          modelName: '',
          description: '',
          creatorName: '',
          creatorLinkedIn: '',
          jsonContent: '',
          markdownContent: '',
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar modelo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Overlay quando helper está aberto em mobile */}
      {showHelper && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowHelper(false)}
        />
      )}

      {/* Painel Lateral Helper */}
      <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
        showHelper ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ width: '400px', maxWidth: '90vw' }}>
        <div className="h-full flex flex-col">
          {/* Header do Helper */}
          <div className="bg-[#0033A0] text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Guia de Criação de Modelos</h2>
            <button
              onClick={() => setShowHelper(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Conteúdo do Helper */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section>
              <h3 className="text-lg font-bold text-[#0033A0] mb-3">📋 Estrutura JSON</h3>
              <p className="text-sm text-gray-700 mb-3">
                O JSON define a estrutura de dados do modelo. Use placeholders <code className="bg-gray-100 px-1 rounded">{"{{campo}}"}</code> para campos dinâmicos.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-3">
                <h4 className="font-semibold text-sm mb-2">Campos Simples:</h4>
                <pre className="text-xs overflow-x-auto">
{`{
  "name": "{{name}}",
  "headline": "{{headline}}",
  "location": "{{location}}"
}`}
                </pre>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-3">
                <h4 className="font-semibold text-sm mb-2">Objetos (Contact, Skills):</h4>
                <pre className="text-xs overflow-x-auto">
{`{
  "contact": {
    "email": "{{email}}",
    "phone": "{{phone}}"
  },
  "skills": {
    "languages": "{{skills_languages}}"
  }
}`}
                </pre>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Arrays (Experience):</h4>
                <pre className="text-xs overflow-x-auto">
{`{
  "experience": [
    {
      "company": "{{exp1_company}}",
      "role": "{{exp1_role}}"
    }
  ]
}`}
                </pre>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-[#0033A0] mb-3">📝 Template Markdown</h3>
              <p className="text-sm text-gray-700 mb-3">
                O Markdown define como o currículo será renderizado. Use os mesmos placeholders do JSON.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
{`# {{name}}
{{headline}}
{{location}}

Email: {{email}}
Phone: {{phone}}

## Summary
{{summary}}

## Experience
### {{exp1_company}} — {{exp1_role}}
{{exp1_period}}
{{exp1_description}}`}
                </pre>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-[#0033A0] mb-3">💡 Dicas</h3>
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>Use placeholders no formato <code className="bg-gray-100 px-1 rounded">{"{{campo}}"}</code></li>
                <li>Para arrays, use índices: <code className="bg-gray-100 px-1 rounded">{"{{exp1_company}}"}</code></li>
                <li>Para skills, use prefixo: <code className="bg-gray-100 px-1 rounded">{"{{skills_languages}}"}</code></li>
                <li>Campos customizados são suportados automaticamente</li>
                <li>Use o botão "Formatar JSON" para organizar o código</li>
                <li>Use "Visualizar" para ver como ficará o resultado</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-[#0033A0] mb-3">🔍 Validação</h3>
              <p className="text-sm text-gray-700">
                O editor valida o JSON em tempo real. Erros aparecem abaixo do campo. Certifique-se de que o JSON está válido antes de enviar.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Botão Toggle Helper */}
      <button
        onClick={() => setShowHelper(!showHelper)}
        className={`fixed top-4 z-50 bg-[#0033A0] text-white p-3 rounded-full shadow-lg hover:bg-[#002a8a] transition-all ${
          showHelper ? 'right-[420px] lg:right-[420px]' : 'right-4'
        }`}
        title={showHelper ? "Fechar Guia" : "Abrir Guia"}
      >
        {showHelper ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
      {/* Modal de Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="bg-[#0033A0] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Visualização do Modelo</h2>
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
              {previewContent ? (
                <div 
                  className="bg-white rounded-lg p-8 shadow-sm prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(previewContent) }}
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
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002a8a] transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <main className={`container mx-auto px-4 py-8 transition-all duration-300 ${showHelper ? 'lg:pr-[420px]' : ''} max-w-4xl`}>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-[#0033A0] hover:text-[#002a8a] mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>
          <h1 className="text-4xl font-bold text-[#0033A0] mb-2">
            Criar Novo Modelo
          </h1>
          <p className="text-gray-600">
            Crie um novo modelo de currículo que será adicionado ao repositório via Pull Request
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Modelo */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações do Modelo
            </h2>
            
            <div>
              <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Modelo *
              </label>
              <input
                type="text"
                id="modelName"
                name="modelName"
                value={formData.modelName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-transparent"
                placeholder="ex: modelo-executivo"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-transparent"
                placeholder="Descreva o modelo de currículo..."
              />
            </div>
          </div>

          {/* Informações do Criador */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações do Criador
            </h2>
            
            <div>
              <label htmlFor="creatorName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Criador *
              </label>
              <input
                type="text"
                id="creatorName"
                name="creatorName"
                value={formData.creatorName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="creatorLinkedIn" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn do Criador
              </label>
              <input
                type="url"
                id="creatorLinkedIn"
                name="creatorLinkedIn"
                value={formData.creatorLinkedIn}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-transparent"
                placeholder="https://linkedin.com/in/seu-perfil"
              />
            </div>
          </div>

          {/* Conteúdo JSON */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Estrutura JSON do Modelo *
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={formatJson}
                  disabled={!!jsonError || !formData.jsonContent.trim()}
                  className="text-sm text-[#0033A0] hover:text-[#002a8a] underline disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Formatar JSON"
                >
                  Formatar JSON
                </button>
                <button
                  type="button"
                  onClick={loadExample}
                  className="text-sm text-[#0033A0] hover:text-[#002a8a] underline"
                >
                  Carregar exemplo
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="jsonContent" className="block text-sm font-medium text-gray-700 mb-2">
                JSON com a estrutura dos campos
              </label>
              <div className="relative">
                <textarea
                  id="jsonContent"
                  name="jsonContent"
                  value={formData.jsonContent}
                  onChange={handleInputChange}
                  required
                  rows={15}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-transparent font-mono text-sm ${
                    jsonError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder='{"name": "{{name}}", "headline": "{{headline}}", ...}'
                />
                {!jsonError && formData.jsonContent.trim() && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Válido
                    </div>
                  </div>
                )}
              </div>
              {jsonError && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="font-semibold">Erro de JSON:</strong>
                      <p className="mt-1">{jsonError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo Markdown */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Template Markdown *
            </h2>
            
            <div>
              <label htmlFor="markdownContent" className="block text-sm font-medium text-gray-700 mb-2">
                Template Markdown para visualização
              </label>
              <textarea
                id="markdownContent"
                name="markdownContent"
                value={formData.markdownContent}
                onChange={handleInputChange}
                required
                rows={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-transparent font-mono text-sm"
                placeholder="# {{name}}\n{{headline}}\n..."
              />
            </div>
          </div>

          {/* Mensagens de Erro/Sucesso */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg space-y-3">
              <div>
                <p className="font-semibold mb-2">✓ Modelo enviado para aprovação!</p>
                <p className="text-sm">
                  Seu modelo foi enviado com sucesso e está aguardando aprovação.
                </p>
              </div>
              {prUrl && (
                <div>
                  <p className="text-sm mb-2">
                    Você pode acompanhar o andamento através do Pull Request:
                  </p>
                  <a
                    href={prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[#0033A0] hover:underline font-medium text-sm"
                  >
                    Ver Pull Request no GitHub →
                  </a>
                </div>
              )}
              <div className="pt-2 border-t border-green-200">
                <p className="text-sm mb-2">
                  Gostou do projeto? Considere dar uma estrela ⭐ no GitHub!
                </p>
                <a
                  href="https://github.com/dalmasjunior/curriculo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#0033A0] hover:underline font-medium text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  Dar uma estrela no GitHub
                </a>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={!formData.jsonContent || !formData.markdownContent}
              className="px-6 py-2 border border-[#0033A0] text-[#0033A0] rounded-lg hover:bg-[#0033A0] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Visualizar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002a8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

