import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Users, 
  CheckCircle, 
  Clock, 
  Eye, 
  Smartphone, 
  Search, 
  Filter, 
  Bot, 
  Copy, 
  Check, 
  Calendar,
  Zap,
  PhoneCall,
  ExternalLink,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  BarChart3,
  UserCheck,
  UserX,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { Patient, ChatMessage, TimelineEvent } from '../types';
import WhatsAppMetaPreviewModal from './WhatsAppMetaPreviewModal';

interface OutreachExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  activePatient?: Patient;
  onSendBulkMessage: (
    patientIds: string[], 
    messageText: string, 
    channel: 'whatsapp' | 'chat'
  ) => void;
}

export default function OutreachExamModal({
  isOpen,
  onClose,
  patients,
  activePatient,
  onSendBulkMessage
}: OutreachExamModalProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'config' | 'live'>('import');

  // Multi-input patient selection
  const [inputMode, setInputMode] = useState<'db' | 'ocr' | 'text'>('db');
  const [selectedCategory, setSelectedCategory] = useState<'vencidos' | 'multifocal' | 'novos' | 'todos'>('vencidos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected Patient IDs from DB
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>(() => {
    return activePatient ? [activePatient.id] : patients.map(p => p.id);
  });

  // OCR or Typed List state
  const [rawTextList, setRawTextList] = useState('');
  const [ocrImageFile, setOcrImageFile] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrExtractedPatients, setOcrExtractedPatients] = useState<Array<{
    name: string;
    phone: string;
    lastExamDate?: string;
    doctor?: string;
    status?: string;
    notes?: string;
  }>>([]);

  // Campaign Configuration State (Iris Questions)
  const [targetDate, setTargetDate] = useState('2026-07-26');
  const [availableTimeSlots, setAvailableTimeSlots] = useState('08:00 - 11:30 | 14:00 - 17:30');
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Augusto Faro');
  const [campaignPromo, setCampaignPromo] = useState('Check-up completo de refração com avaliação preventiva de pressão ocular');
  const [maxSlotsPerHour, setMaxSlotsPerHour] = useState('2');

  // Message Generator
  const [selectedTemplate, setSelectedTemplate] = useState<'anual' | 'telas' | 'desconto' | 'personalizado'>('anual');
  const [customPrompt, setCustomPrompt] = useState('');
  const [messageText, setMessageText] = useState(
    'Olá {{nome}}! Tudo bem? Aqui é do Centro Oftalmológico ÍrisClin. Notamos que já faz 1 ano desde a sua última consulta de vista com o {{profissional}}. Preparamos um horário especial para o seu exame preventivo em {{data_agendamento}}. Podemos agendar para você esta semana?'
  );

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [sendChannel, setSendChannel] = useState<'whatsapp' | 'chat'>('whatsapp');
  const [isMetaPreviewOpen, setIsMetaPreviewOpen] = useState(false);
  
  // Campaign Live Tracking Metrics
  const [campaignStats, setCampaignStats] = useState({
    total: 0,
    sent: 0,
    replied: 0,
    scheduled: 0,
    declined: 0,
    pending: 0
  });

  const [dispatchStatusList, setDispatchStatusList] = useState<Array<{
    patientId: string;
    name: string;
    phone: string;
    status: 'Aguardando' | 'Enviando' | 'Enviado' | 'Em Conversa' | 'Agendado' | 'Recusado';
    scheduledTime?: string;
    lastReply?: string;
  }>>([]);

  const [sendingProgress, setSendingProgress] = useState<{ current: number; total: number } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter db patients
  const filteredDbPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.phone && p.phone.includes(searchTerm));
    if (!matchesSearch) return false;

    if (selectedCategory === 'vencidos') return p.status === 'Sem Pendências' || p.status === 'Orçamento';
    if (selectedCategory === 'multifocal') return p.opticalData?.od?.add || p.previousGlasses?.toLowerCase().includes('multifocal');
    if (selectedCategory === 'novos') return p.status === 'Orçamento';
    return true;
  });

  const toggleSelectPatient = (id: string) => {
    setSelectedPatientIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPatientIds.length === filteredDbPatients.length) {
      setSelectedPatientIds([]);
    } else {
      setSelectedPatientIds(filteredDbPatients.map(p => p.id));
    }
  };

  // OCR File Upload Handler
  const handleOcrFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setOcrImageFile(base64);
      setIsProcessingOcr(true);

      try {
        const res = await fetch('/api/copilot/ocr-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });
        const data = await res.json();
        if (data.patients && Array.isArray(data.patients)) {
          setOcrExtractedPatients(data.patients);
        }
      } catch (err) {
        console.error('OCR Error:', err);
      } finally {
        setIsProcessingOcr(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Parse Raw Text List
  const handleProcessRawTextList = async () => {
    if (!rawTextList.trim()) return;
    setIsProcessingOcr(true);

    try {
      const res = await fetch('/api/copilot/ocr-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textList: rawTextList })
      });
      const data = await res.json();
      if (data.patients && Array.isArray(data.patients)) {
        setOcrExtractedPatients(data.patients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  // Change predefined template
  const handleSelectTemplate = (type: 'anual' | 'telas' | 'desconto' | 'personalizado') => {
    setSelectedTemplate(type);
    if (type === 'anual') {
      setMessageText('Olá {{nome}}! Tudo bem? Aqui é do Centro Oftalmológico ÍrisClin com o {{profissional}}. Já faz 1 ano desde o seu último exame de vista preventivo. Preparamos a agenda para {{data_agendamento}}. Podemos agendar seu check-up de refração?');
    } else if (type === 'telas') {
      setMessageText('Olá {{nome}}! Como tem passado? O uso constante de telas de celular e computador pode causar vista cansada e alteração do grau. Na ÍrisClin preparamos um check-up especial com o {{profissional}} para o dia {{data_agendamento}}. Qual horário prefere?');
    } else if (type === 'desconto') {
      setMessageText('Atenção {{nome}}! Mês da Saúde Ocular na ÍrisClin: Agende seu exame de vista com o {{profissional}} para {{data_agendamento}} e traga um acompanhante com 20% de desconto! Responda esta mensagem para garantir seu horário.');
    }
  };

  // Generate customized message via Iris AI
  const handleGenerateAiMessage = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              id: 'req-1',
              sender: 'admin',
              senderName: selectedDoctor,
              content: `Gere um texto curto, extremamente humano e persuasivo de convite do WhatsApp para agendamento do exame de vista com o ${selectedDoctor} na data ${targetDate}. Usar as variáveis {{nome}}, {{profissional}} e {{data_agendamento}}. Instrução adicional: ${customPrompt || campaignPromo}`
            }
          ],
          patientContext: {
            name: activePatient?.name || 'Paciente',
            status: 'Exame Pendente'
          }
        })
      });

      const data = await response.json();
      if (data.response) {
        let formatted = data.response
          .replace(new RegExp(activePatient?.name || 'Paciente', 'gi'), '{{nome}}')
          .replace(new RegExp(selectedDoctor, 'gi'), '{{profissional}}');
        setMessageText(formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Start Campaign Dispatches
  const handleStartCampaignExecution = async () => {
    // Gather target patients
    let targets: Array<{ id: string; name: string; phone: string }> = [];

    if (inputMode === 'db') {
      targets = patients
        .filter(p => selectedPatientIds.includes(p.id))
        .map(p => ({ id: p.id, name: p.name, phone: p.phone || '(73) 9 8104-7390' }));
    } else {
      targets = ocrExtractedPatients.map((p, idx) => ({
        id: `ocr-${idx}-${Date.now()}`,
        name: p.name,
        phone: p.phone || '(73) 9 8104-7390'
      }));
    }

    if (targets.length === 0) return;

    // Switch to Live Tracking tab
    setActiveTab('live');
    setDispatchStatusList(targets.map(t => ({
      patientId: t.id,
      name: t.name,
      phone: t.phone,
      status: 'Aguardando'
    })));

    setCampaignStats({
      total: targets.length,
      sent: 0,
      replied: 0,
      scheduled: 0,
      declined: 0,
      pending: targets.length
    });

    setSendingProgress({ current: 0, total: targets.length });

    // Execute dispatches sequentially with simulated negotiation feedback
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const firstName = target.name.split(' ')[0];

      let formattedMsg = messageText
        .replace(/\{\{nome\}\}/g, firstName)
        .replace(/\{\{profissional\}\}/g, selectedDoctor)
        .replace(/\{\{data_agendamento\}\}/g, targetDate);

      // Open WhatsApp Web for first or simulated
      if (sendChannel === 'whatsapp' && target.phone) {
        const cleanPhone = target.phone.replace(/\D/g, '');
        const encodedText = encodeURIComponent(formattedMsg);
        window.open(`https://wa.me/55${cleanPhone}?text=${encodedText}`, '_blank');
      }

      // Record in main app state if DB patient
      if (inputMode === 'db') {
        onSendBulkMessage([target.id], formattedMsg, sendChannel);
      }

      // Update Live Dispatch Status
      setDispatchStatusList(prev => prev.map(item => {
        if (item.patientId === target.id) {
          return { ...item, status: 'Enviado' };
        }
        return item;
      }));

      setSendingProgress({ current: i + 1, total: targets.length });
      setCampaignStats(prev => ({
        ...prev,
        sent: prev.sent + 1,
        pending: prev.total - (prev.sent + 1)
      }));

      await new Promise(r => setTimeout(r, 600));

      // Simulate Iris AI auto-replies and instant schedule confirmations
      if (i % 2 === 0) {
        setTimeout(() => {
          setDispatchStatusList(prev => prev.map(item => {
            if (item.patientId === target.id) {
              return { 
                ...item, 
                status: 'Agendado', 
                scheduledTime: '09:30', 
                lastReply: `Confirmado com ${selectedDoctor} para às 09:30!` 
              };
            }
            return item;
          }));

          setCampaignStats(prev => ({
            ...prev,
            replied: prev.replied + 1,
            scheduled: prev.scheduled + 1
          }));
        }, 1200 + i * 400);
      }
    }

    setTimeout(() => {
      setSendingProgress(null);
    }, 1000);
  };

  const handleCopyPreview = () => {
    const preview = messageText
      .replace(/\{\{nome\}\}/g, activePatient?.name.split(' ')[0] || 'Maria')
      .replace(/\{\{profissional\}\}/g, selectedDoctor)
      .replace(/\{\{data_agendamento\}\}/g, targetDate);
    navigator.clipboard.writeText(preview);
    setCopiedIndex(true);
    setTimeout(() => setCopiedIndex(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-80 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* HEADER */}
        <header className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-sky-900 via-sky-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shrink-0 border border-emerald-300/40">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                  <span>Iris AI • Disparos &amp; Agendamento</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                    OCR 2026
                  </span>
                </h2>
                <p className="text-[11px] text-sky-200 font-medium">
                  Importação por fotos/planilhas, negociação e agendamento autônomo
                </p>
              </div>
            </div>

            {/* Mobile Close X Button */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
              title="Fechar Disparos"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 min-h-[40px]"
              title="Voltar ao Sistema Principal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Sistema</span>
            </button>
          </div>
        </header>

        {/* STEPPER TABS NAVIGATION */}
        <div className="bg-slate-100/80 px-4 sm:px-6 py-2 border-b border-slate-200 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar text-xs font-bold shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 ${
                activeTab === 'import' ? 'bg-sky-600 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900 bg-white/60 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>1. Lista &amp; OCR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 ${
                activeTab === 'config' ? 'bg-sky-600 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900 bg-white/60 border border-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>2. Parâmetros</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 ${
                activeTab === 'live' ? 'bg-emerald-600 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900 bg-white/60 border border-slate-200'
              }`}
            >
              <Activity className="w-4 h-4 animate-pulse" />
              <span>3. Painel ao Vivo</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Atendimento Humanizado com Auditoria LGPD</span>
          </div>
        </div>

        {/* MAIN BODY CONTENT BASED ON ACTIVE TAB */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/60">

          {/* TAB 1: SELEÇÃO & OCR IMPORTAÇÃO DE PACIENTES */}
          {activeTab === 'import' && (
            <div className="space-y-6 animate-fade-in">
              {/* INPUT MODE TOGGLE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setInputMode('db')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    inputMode === 'db' ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300/60' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Banco de Dados da Clínica</h4>
                    <p className="text-[10.5px] text-slate-500">Pacientes cadastrados na ÍrisClin</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setInputMode('ocr')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    inputMode === 'ocr' ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300/60' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">OCR & Foto de Agenda / PDF</h4>
                    <p className="text-[10.5px] text-slate-500">Foto de papel, planilha impressa ou print</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    inputMode === 'text' ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300/60' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Digitação de Lista</h4>
                    <p className="text-[10.5px] text-slate-500">Colar vários nomes e telefones</p>
                  </div>
                </button>
              </div>

              {/* INPUT MODE CONTENT */}
              {inputMode === 'db' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Search className="w-4 h-4 text-sky-600" />
                      Filtrar Pacientes no Sistema
                    </h3>
                    <span className="text-xs font-extrabold text-sky-900 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                      {selectedPatientIds.length} selecionados de {filteredDbPatients.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('vencidos')}
                      className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                        selectedCategory === 'vencidos' ? 'bg-sky-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Exame Vencido (&gt;12m)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('multifocal')}
                      className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                        selectedCategory === 'multifocal' ? 'bg-sky-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      👓 Pacientes Multifocal
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('novos')}
                      className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                        selectedCategory === 'novos' ? 'bg-sky-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      ✨ Orçamentos Novos
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('todos')}
                      className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                        selectedCategory === 'todos' ? 'bg-sky-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      👥 Todos Cadastrados
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input 
                        type="text"
                        placeholder="Buscar paciente por nome, CPF ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="px-3 py-2 text-xs font-extrabold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl cursor-pointer"
                    >
                      {selectedPatientIds.length === filteredDbPatients.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredDbPatients.map(p => {
                      const isSelected = selectedPatientIds.includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => toggleSelectPatient(p.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-300' : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate">{p.name}</h4>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {p.phone || '(73) 9 8104-7390'} • <span className="font-semibold text-sky-700">{p.status}</span>
                              </p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {inputMode === 'ocr' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Visão Computacional & OCR • Análise de Imagem ou Agenda Impressa
                    </h3>
                  </div>

                  <div className="p-6 border-2 border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/50 rounded-2xl text-center space-y-3 transition-all">
                    <Upload className="w-8 h-8 text-sky-600 mx-auto animate-bounce" />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">Carregar Foto da Agenda, Print ou Planilha Impressa</h4>
                      <p className="text-[11px] text-slate-500">Suporta arquivos JPG, PNG, WEBP ou documentos PDF contendo listas de pacientes</p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                      <span>Selecionar Imagem / PDF</span>
                      <input type="file" accept="image/*,.pdf" onChange={handleOcrFileUpload} className="hidden" />
                    </label>
                  </div>

                  {isProcessingOcr && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900 text-xs font-bold">
                      <Sparkles className="w-5 h-5 text-amber-600 animate-spin" />
                      <span>Iris AI lendo imagem e identificando nomes, telefones e observações médicas...</span>
                    </div>
                  )}

                  {ocrExtractedPatients.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {ocrExtractedPatients.length} Pacientes Identificados pelo OCR da Iris AI:
                      </h4>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto">
                        {ocrExtractedPatients.map((p, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <span className="font-extrabold text-slate-900">{p.name}</span>
                              <span className="text-slate-500 ml-2 font-mono">{p.phone}</span>
                              <div className="text-[10.5px] text-slate-600 italic">{p.notes || 'Exame de vista preventivo'}</div>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              Pronto para Envio
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {inputMode === 'text' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      Digitação ou Colagem de Vários Nomes
                    </h3>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Cole aqui a lista de nomes e telefones (exemplo):\nMaria da Silva - 73 98104-7390\nJoão Pedro - 73 99982-1140\nAna Lúcia - 73 98831-2090"
                    value={rawTextList}
                    onChange={(e) => setRawTextList(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-sky-500 font-mono"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleProcessRawTextList}
                      disabled={isProcessingOcr || !rawTextList.trim()}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Processar Lista via Iris AI</span>
                    </button>
                  </div>
                </div>
              )}

              {/* NEXT STEP BUTTON */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('config')}
                  className="px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-800 hover:from-sky-700 hover:to-sky-900 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Avançar para Configuração da Agenda</span>
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONFIGURAÇÃO DA AGENDA & MENSAGEM */}
          {activeTab === 'config' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* LEFT: 5 PERGUNTAS DA IRIS DE CONFIGURAÇÃO (6 COLS) */}
                <div className="md:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    Parâmetros de Agendamento da Clínica
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">
                        1. Para qual data deseja realizar os agendamentos?
                      </label>
                      <input 
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">
                        2. Qais horários estarão disponíveis para a campanha?
                      </label>
                      <input 
                        type="text"
                        value={availableTimeSlots}
                        onChange={(e) => setAvailableTimeSlots(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">
                        3. Qual profissional realizará os exames?
                      </label>
                      <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-bold text-slate-800"
                      >
                        <option value="Dr. Augusto Faro">Dr. Augusto Faro (Oftalmologista Chefe)</option>
                        <option value="Dra. Julia Martins">Dra. Julia Martins (Especialista em Córnea e Refração)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">
                        4. Existe alguma campanha ou promoção específica?
                      </label>
                      <input 
                        type="text"
                        value={campaignPromo}
                        onChange={(e) => setCampaignPromo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">
                        5. Limite máximo de agendamentos por horário?
                      </label>
                      <select
                        value={maxSlotsPerHour}
                        onChange={(e) => setMaxSlotsPerHour(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-800"
                      >
                        <option value="1">1 paciente por horário (Atendimento Exclusivo)</option>
                        <option value="2">2 pacientes por horário (Padrão ÍrisClin)</option>
                        <option value="3">3 pacientes por horário (Encaixes de Triagem)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* RIGHT: MENSAGEM INTELIGENTE & MODELOS (6 COLS) */}
                <div className="md:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Gerador de Mensagem Humanizada
                    </h3>

                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setSendChannel('whatsapp')}
                        className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          sendChannel === 'whatsapp' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendChannel('chat')}
                        className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          sendChannel === 'chat' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat Iris</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate('anual')}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTemplate === 'anual' ? 'bg-sky-50 border-sky-400 font-bold text-sky-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-bold">Retorno Anual</div>
                      <div className="text-[9.5px] text-slate-500 font-normal">Check-up preventivo</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTemplate('telas')}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTemplate === 'telas' ? 'bg-sky-50 border-sky-400 font-bold text-sky-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-bold">Fadiga de Telas</div>
                      <div className="text-[9.5px] text-slate-500 font-normal">Filtro azul & Grau</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTemplate('desconto')}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTemplate === 'desconto' ? 'bg-sky-50 border-sky-400 font-bold text-sky-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-bold">Acompanhante</div>
                      <div className="text-[9.5px] text-slate-500 font-normal">20% desconto</div>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span>Personalizar via Prompt da Iris AI</span>
                      <button
                        type="button"
                        onClick={handleGenerateAiMessage}
                        disabled={isGeneratingAi}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {isGeneratingAi ? <Sparkles className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                        <span>{isGeneratingAi ? 'Gerando...' : 'Gerar com Iris AI'}</span>
                      </button>
                    </div>
                    <input 
                      type="text"
                      placeholder="Ex: Enfatizar exames gratuitos de campo visual para idosos..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <textarea
                    rows={5}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl font-sans focus:outline-none focus:border-sky-500 leading-relaxed font-medium text-slate-800"
                  />

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs italic text-slate-800">
                    <span className="font-bold text-emerald-800 block text-[10px] uppercase">
                      Pré-visualização para o cliente:
                    </span>
                    "{messageText.replace(/\{\{nome\}\}/g, 'Maria').replace(/\{\{profissional\}\}/g, selectedDoctor).replace(/\{\{data_agendamento\}\}/g, targetDate)}"
                  </div>
                </div>

              </div>

              {/* DISPATCH EXECUTION BUTTONS */}
              <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('import')}
                  className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-700" />
                  <span>Voltar para Passo 1 (Lista & OCR)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMetaPreviewOpen(true)}
                    className="px-5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>📱 Preview WhatsApp Meta API</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartCampaignExecution}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-emerald-200" />
                    <span>Iniciar Disparos e Negociação</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAINEL AO VIVO DA CAMPANHA DE AGENDAMENTO */}
          {activeTab === 'live' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* DASHBOARD SUMMARY STATS */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <div className="text-[10.5px] font-extrabold uppercase text-slate-400">Total Pacientes</div>
                  <div className="text-xl font-black text-slate-900 mt-1">{campaignStats.total}</div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <div className="text-[10.5px] font-extrabold uppercase text-sky-600">Enviados</div>
                  <div className="text-xl font-black text-sky-700 mt-1">{campaignStats.sent}</div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <div className="text-[10.5px] font-extrabold uppercase text-amber-600">Em Conversa</div>
                  <div className="text-xl font-black text-amber-600 mt-1">{campaignStats.replied}</div>
                </div>

                <div className="p-4 bg-white border border-emerald-200 bg-emerald-50/40 rounded-2xl shadow-2xs">
                  <div className="text-[10.5px] font-extrabold uppercase text-emerald-700">Agendados Sucesso</div>
                  <div className="text-xl font-black text-emerald-700 mt-1">{campaignStats.scheduled}</div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <div className="text-[10.5px] font-extrabold uppercase text-slate-400">Aguardando Envio</div>
                  <div className="text-xl font-black text-slate-600 mt-1">{campaignStats.pending}</div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              {sendingProgress && (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs font-bold text-sky-950">
                    <span>Executando envios e negociando com pacientes...</span>
                    <span>{sendingProgress.current} de {sendingProgress.total}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* LIVE DISPATCH LIST TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Acompanhamento Individual de Conversas da Iris AI</span>
                  <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-mono">
                    <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    Atendimento Autônomo Ativo
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                  {dispatchStatusList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Nenhuma campanha iniciada no momento. Ajuste os parâmetros na aba anterior e clique em "Iniciar Disparos".
                    </div>
                  ) : (
                    dispatchStatusList.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-slate-50 transition-all">
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {item.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-800 truncate">{item.name}</h4>
                            <p className="text-[10.5px] text-slate-500 font-mono">{item.phone}</p>
                            {item.lastReply && (
                              <p className="text-[10px] text-emerald-700 font-medium italic mt-0.5">
                                "{item.lastReply}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {item.status === 'Agendado' && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10.5px] rounded-lg border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Agendado {item.scheduledTime}
                            </span>
                          )}

                          {item.status === 'Enviado' && (
                            <span className="px-2.5 py-1 bg-sky-100 text-sky-800 font-bold text-[10.5px] rounded-lg border border-sky-200 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 animate-spin text-sky-600" />
                              Aguardando Resposta
                            </span>
                          )}

                          {item.status === 'Aguardando' && (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[10.5px] rounded-lg">
                              Na Fila
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const cleanPhone = item.phone.replace(/\D/g, '');
                              window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="Abrir WhatsApp Web"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* CLOSE / CONCLUDE & BACK BUTTONS */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('config')}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-700" />
                  <span>Voltar para Passo 2 (Parâmetros)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Concluir e Fechar Painel
                </button>
              </div>

            </div>
          )}

        </div>

        <WhatsAppMetaPreviewModal
          isOpen={isMetaPreviewOpen}
          onClose={() => setIsMetaPreviewOpen(false)}
          patients={patients}
          templateText={messageText}
          selectedDoctor={selectedDoctor}
          targetDate={targetDate}
          onConfirmDispatch={(approvedTemplate) => {
            setMessageText(approvedTemplate);
            handleStartCampaignExecution();
          }}
        />

      </div>
    </div>
  );
}
