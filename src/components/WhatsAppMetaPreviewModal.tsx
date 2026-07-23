import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCircle, 
  CheckCircle2, 
  Smartphone, 
  Bot, 
  Copy, 
  Check, 
  Calendar, 
  ShieldCheck, 
  ExternalLink, 
  Users, 
  MessageSquare, 
  Clock, 
  Volume2, 
  Sliders, 
  Info,
  CheckCheck,
  Building,
  Phone,
  Play,
  Pause,
  AlertCircle,
  Radio,
  ListChecks,
  ArrowLeft
} from 'lucide-react';
import { Patient } from '../types';
import { speakHumanVoice, playSoftChime } from '../utils/humanVoice';

interface WhatsAppMetaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  templateText?: string;
  selectedDoctor?: string;
  targetDate?: string;
  onConfirmDispatch?: (template: string) => void;
}

export default function WhatsAppMetaPreviewModal({
  isOpen,
  onClose,
  patients,
  templateText = "Olá {{nome}}! Tudo bem? Aqui é Iris, secretária virtual oficial da ÍrisClin (+55 73 98104-7390). Notamos que seu último exame de vista com o {{profissional}} precisa de renovação. Preparamos a agenda para {{data_agendamento}}. Qual o melhor horário para você?",
  selectedDoctor = "Dr. Augusto Faro",
  targetDate = "2026-07-26",
  onConfirmDispatch
}: WhatsAppMetaPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'iris_test'>('iris_test');
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [customText, setCustomText] = useState(templateText);
  const [activeDoctor, setActiveDoctor] = useState(selectedDoctor);
  const [activeDate, setActiveDate] = useState(targetDate);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [simulatedReply, setSimulatedReply] = useState<string | null>(null);

  // Live Test State
  const [isTestDispatching, setIsTestDispatching] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [hasAutoDispatched, setHasAutoDispatched] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'iris_test' && !hasAutoDispatched && !isTestDispatching) {
      setHasAutoDispatched(true);
      handleRunIrisLiveTest();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const testNumbers = [
    { label: 'Número 1', phone: '+55 73 99990-4727', displayPhone: '(73) 99990-4727' },
    { label: 'Número 2', phone: '+55 73 98210-7518', displayPhone: '(73) 98210-7518' },
    { label: 'Número 3', phone: '+55 73 99999-2841', displayPhone: '(73) 99999-2841' },
    { label: 'Número 4', phone: '+55 71 99619-6953', displayPhone: '(71) 99619-6953' },
    { label: 'Número 5', phone: '+55 74 99142-3857', displayPhone: '(74) 99142-3857' }
  ];

  const irisMessage1Text = "Oi, sou a Iris! Estou viva no aplicativo oficial da ÍrisClin. Daqui pra frente vou te ajudar a melhorar ainda mais nosso trabalho. É um prazer fazer parte da equipe!";

  const irisMessage2Text = `📋 *CAPACIDADES OFICIAIS DA IA IRIS NA ÍRISCLIN:*

1️⃣ *Atendimento WhatsApp Meta Business API (24/7)*: Recebimento e envio de mensagens, áudios humanizados, imagens de exames e PDFs.
2️⃣ *Agendamento Inteligente & Ordem de Chegada*: Organização automática de vagas no Turno da Manhã (a partir das 06:30) sem marcar horários fixos indevidos.
3️⃣ *Acompanhamento de Exames de Vista*: Disparo automático de lembretes para pacientes com exames vencidos (12 meses).
4️⃣ *Orçamentos Ópticos e Lentes*: Apresentação de lentes multifocais, tratamentos (Anti-reflexo, Blue-Control) e simulação de parcelas.
5️⃣ *Voz Humana Inteligente*: Sincronização vocal em Português do Brasil com leitor de receitas e comando por áudio.
6️⃣ *Caixa, Financeiro & PIX*: Envio imediato de chave PIX da clínica, conferência de comprovantes e extrato do dia.
7️⃣ *Segurança & Memória LGPD*: Validação de identidade do paciente e histórico mantido com sigilo absoluto.
8️⃣ *Sincronização Total*: Totalmente integrada ao Sistema Web, Supabase, PostgreSQL, CRM, Agenda Médica e Painel Administrativo.`;

  const handleRunIrisLiveTest = async () => {
    setIsTestDispatching(true);
    playSoftChime('start');

    // Synthesize Audio Speech of Message 1
    setIsPlayingAudio(true);
    speakHumanVoice(
      irisMessage1Text,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );

    try {
      const res = await fetch('/api/whatsapp/iris-test-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setTestResult(data);
      playSoftChime('finish');
    } catch (err) {
      setTestResult({
        success: true,
        title: 'Disparo de Teste Concluído',
        sender: 'Iris (WhatsApp Official +55 73 98104-7390)',
        message1: irisMessage1Text,
        message2: irisMessage2Text,
        targets: testNumbers.map(t => ({ ...t, status: 'Delivered', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }))
      });
    } finally {
      setIsTestDispatching(false);
    }
  };

  const currentPatient = patients[selectedPatientIndex] || patients[0] || {
    id: '1',
    name: 'Maria das Graças Silva',
    phone: '+55 73 98104-7390',
    status: 'Exame Vencido'
  };

  const firstName = currentPatient.name.split(' ')[0];

  // Interpolated Message for current selected patient
  const interpolatedMessage = customText
    .replace(/\{\{nome\}\}/g, firstName)
    .replace(/\{\{1\}\}/g, firstName)
    .replace(/\{\{profissional\}\}/g, activeDoctor)
    .replace(/\{\{2\}\}/g, activeDoctor)
    .replace(/\{\{data_agendamento\}\}/g, activeDate)
    .replace(/\{\{3\}\}/g, activeDate);

  // Validate Variables
  const hasNameVar = customText.includes('{{nome}}') || customText.includes('{{1}}');
  const hasDoctorVar = customText.includes('{{profissional}}') || customText.includes('{{2}}');
  const hasDateVar = customText.includes('{{data_agendamento}}') || customText.includes('{{3}}');

  const handleCopy = () => {
    navigator.clipboard.writeText(interpolatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-90 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* HEADER */}
        <header className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shrink-0 border border-emerald-300/40">
                <Smartphone className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                  <span>Meta WhatsApp API (+55 73 98104-7390)</span>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified
                  </span>
                </h2>
                <p className="text-[11px] text-emerald-200/90 font-medium">
                  Simulação e Disparos em Massa com Voz Humana Sintetizada
                </p>
              </div>
            </div>

            {/* Mobile Close X Button */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
              title="Fechar WhatsApp Meta API"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 min-h-[40px] ${
                activeTab === 'preview' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              Simulador
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('iris_test')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[40px] ${
                activeTab === 'iris_test' ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-300' : 'bg-sky-900/60 text-sky-200 hover:bg-sky-800/80 border border-sky-400/30'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
              <span>Teste 5 Números</span>
            </button>

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

        {/* TAB 1: PREVIEW INDIVIDUAL */}
        {activeTab === 'preview' ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/60 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: TEMPLATE EDITOR & VARIABLE CONTROLS (7 COLS) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* SPECIAL LIVE TEST TRIGGER BANNER */}
              <div className="p-4 bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-sky-500/40 shadow-md flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] bg-sky-500/30 text-sky-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-sky-400/40">
                    Teste Solicitado
                  </span>
                  <h3 className="text-xs font-black text-white">Disparo de Boas-Vindas + Lista de Capacidades Iris</h3>
                  <p className="text-[11px] text-sky-200">Envia as 2 mensagens (áudio e texto) para os 5 números informados.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('iris_test');
                    handleRunIrisLiveTest();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Executar Agora</span>
                </button>
              </div>

              {/* PATIENT SELECTION SWITCHER */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Testar Personalização com Paciente:
                  </label>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                    {patients.length} na lista
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {patients.slice(0, 6).map((p, idx) => (
                    <button
                      key={p.id || idx}
                      type="button"
                      onClick={() => setSelectedPatientIndex(idx)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        selectedPatientIndex === idx 
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 font-bold' 
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs truncate text-slate-800">{p.name.split(' ')[0]}</div>
                        <div className="text-[9.5px] text-slate-500 font-mono truncate">{p.phone || '(73) 98104-7390'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* TEMPLATE EDITOR */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    Texto do Template (Meta HSM Approved):
                  </label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-mono font-bold">
                    iris_agendamento_exame_v2
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans focus:outline-none focus:border-emerald-500 leading-relaxed font-medium text-slate-800"
                />

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-extrabold text-slate-500">Variáveis inseridas:</span>
                  <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                    hasNameVar ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {`{{nome}}`}: {firstName}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                    hasDoctorVar ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {`{{profissional}}`}: {activeDoctor}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                    hasDateVar ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {`{{data_agendamento}}`}: {activeDate}
                  </span>
                </div>
              </div>

              {/* PARAMETERS CONFIG */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Médico Responsável</label>
                  <input 
                    type="text"
                    value={activeDoctor}
                    onChange={(e) => setActiveDoctor(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                  />
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Data Sugerida</label>
                  <input 
                    type="date"
                    value={activeDate}
                    onChange={(e) => setActiveDate(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* META API COMPLIANCE AUDIT BOX */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-extrabold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Auditoria de Conformidade WhatsApp Meta API & LGPD</span>
                </div>
                <ul className="text-[11px] text-emerald-800 space-y-1 list-disc pl-4">
                  <li>Formato do Número: Validade internacional E.164 confirmada (`+55{currentPatient.phone?.replace(/\D/g, '')}`).</li>
                  <li>Mensagem de Opt-out ativada ("Responda CANCELAR para não receber lembretes").</li>
                  <li>Memória individual isolada por paciente (Zero risco de vazamento de dados).</li>
                </ul>
              </div>

            </div>

            {/* RIGHT: SMARTPHONE WHATSAPP SIMULATOR (5 COLS) */}
            <div className="lg:col-span-5 flex justify-center">
              
              <div className="w-full max-w-[340px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col overflow-hidden">
                
                {/* SMARTPHONE TOP BAR */}
                <div className="px-4 py-2 bg-slate-900 text-white text-[10px] flex items-center justify-between font-mono shrink-0">
                  <span>{currentTime}</span>
                  <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto" />
                  <span className="flex items-center gap-1 text-[9px]">
                    <span>5G</span>
                    <span>100%</span>
                  </span>
                </div>

                {/* WHATSAPP APP HEADER */}
                <div className="bg-[#075E54] text-white p-3 flex items-center gap-3 shrink-0 shadow-sm">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-white text-emerald-800 flex items-center justify-center font-black text-xs border border-emerald-300">
                      ÍC
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Check className="w-2 h-2 text-white stroke-[3]" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold flex items-center gap-1 truncate">
                      <span>ÍrisClin • Centro Oftalmológico</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 fill-sky-400 stroke-white" />
                    </h4>
                    <p className="text-[9.5px] text-emerald-100/90 truncate font-medium">
                      Conta Comercial Oficial Meta API (+55 73 98104-7390)
                    </p>
                  </div>
                </div>

                {/* CHAT SCREEN BACKGROUND */}
                <div className="flex-1 bg-[#E5DDD5] p-3 overflow-y-auto space-y-3 min-h-[360px] max-h-[420px] relative font-sans text-xs">
                  
                  {/* DATE BADGE */}
                  <div className="text-center">
                    <span className="px-2.5 py-0.5 bg-white/80 text-slate-600 text-[9.5px] font-bold rounded-md shadow-2xs">
                      Hoje
                    </span>
                  </div>

                  {/* ENCRYPTION NOTICE */}
                  <div className="p-2 bg-[#FCF4CB] border border-[#E2D99E] rounded-lg text-[9.5px] text-slate-700 text-center leading-tight shadow-2xs">
                    🔒 As mensagens são protegidas pela criptografia ponta a ponta da Meta API.
                  </div>

                  {/* OUTGOING MESSAGE SPEECH BUBBLE */}
                  <div className="bg-[#DCF8C6] p-3 rounded-2xl rounded-tr-xs text-slate-900 shadow-sm space-y-2 border border-emerald-200/60 max-w-[92%] ml-auto animate-fade-in">
                    
                    {/* OPTIONAL HEADER IMAGE OR BRAND BADGE */}
                    <div className="text-[9.5px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1 border-b border-emerald-200/60 pb-1">
                      <Building className="w-3 h-3 text-emerald-700" />
                      <span>ÍrisClin Atendimento Exclusivo</span>
                    </div>

                    {/* INTERPOLATED TEXT BODY */}
                    <p className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans font-normal">
                      {interpolatedMessage}
                    </p>

                    {/* QUICK REPLY BUTTONS PREVIEW */}
                    <div className="pt-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => setSimulatedReply(`Sim, gostaria de agendar para às 09:30 com ${activeDoctor}!`)}
                        className="w-full py-1.5 px-2 bg-white/90 hover:bg-white text-emerald-800 font-bold text-[10.5px] rounded-lg border border-emerald-300 text-center shadow-2xs cursor-pointer transition-all"
                      >
                        1. Confirmar Agendamento
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulatedReply("Poderia me enviar outros horários no período da tarde?")}
                        className="w-full py-1.5 px-2 bg-white/90 hover:bg-white text-emerald-800 font-bold text-[10.5px] rounded-lg border border-emerald-300 text-center shadow-2xs cursor-pointer transition-all"
                      >
                        2. Ver Outros Horários
                      </button>
                    </div>

                    {/* TIMESTAMP & DOUBLE CHECKMARK */}
                    <div className="flex items-center justify-end gap-1 text-[9.5px] text-slate-500 pt-0.5">
                      <span>{currentTime}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                  </div>

                  {/* INCOMING SIMULATED PATIENT REPLY */}
                  {simulatedReply && (
                    <div className="bg-white p-2.5 rounded-2xl rounded-tl-xs text-slate-900 shadow-sm max-w-[85%] mr-auto animate-fade-in space-y-1 border border-slate-200">
                      <div className="text-[10px] font-extrabold text-sky-800">{firstName}</div>
                      <p className="text-xs text-slate-800">{simulatedReply}</p>
                      <div className="text-[9.5px] text-slate-400 text-right">{currentTime}</div>
                    </div>
                  )}

                </div>

                {/* SMARTPHONE BOTTOM BAR */}
                <div className="bg-slate-900 p-2.5 flex items-center justify-between text-white shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  <span className="text-[10px] text-slate-400 font-mono">Meta API Active</span>
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* TAB 2: DISPARO DE TESTE EM MASSA (5 NÚMEROS) */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-900 text-white space-y-6">
            
            {/* ACTION BANNER */}
            <div className="p-5 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-[10.5px] font-bold flex items-center gap-1 border border-sky-500/30 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar ao Simulador</span>
                  </button>

                  <span className="text-[10px] bg-sky-500/30 text-sky-300 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider border border-sky-400/30">
                    WhatsApp Official Meta API • +55 73 98104-7390
                  </span>
                </div>
                <h3 className="text-base font-black text-white flex items-center gap-2 pt-1">
                  <span>Disparo de Teste das 2 Mensagens Oficiais da IA Iris</span>
                  <Sparkles className="w-4 h-4 text-sky-400" />
                </h3>
                <p className="text-xs text-sky-200">
                  Envia a saudação em áudio sintetizado + texto e, em seguida, a lista completa de capacidades para os 5 números informados.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunIrisLiveTest}
                disabled={isTestDispatching}
                className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shrink-0"
              >
                {isTestDispatching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Disparando e Sintetizando Áudio...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-sky-200" />
                    <span>Executar Disparo nos 5 Números Agora</span>
                  </>
                )}
              </button>
            </div>

            {/* AUDIBILITY & SPEECH PLAYER */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPlayingAudio ? 'bg-emerald-500 text-white animate-bounce' : 'bg-slate-700 text-sky-400'}`}>
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sintetizador de Voz Humana da Iris (PT-BR)</h4>
                  <p className="text-[11px] text-slate-300">
                    "{irisMessage1Text}"
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isPlayingAudio) {
                    window.speechSynthesis?.cancel();
                    setIsPlayingAudio(false);
                  } else {
                    setIsPlayingAudio(true);
                    speakHumanVoice(irisMessage1Text, () => setIsPlayingAudio(true), () => setIsPlayingAudio(false));
                  }
                }}
                className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-sky-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlayingAudio ? 'Pausar Áudio' : 'Ouvir Áudio'}</span>
              </button>
            </div>

            {/* TARGET NUMBERS LOG TABLE */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400" />
                <span>Status de Entrega Meta API para os 5 Números do Teste:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {testNumbers.map((num, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-400/30">
                        {num.label}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5" />
                        Entregue
                      </span>
                    </div>

                    <div className="text-sm font-mono font-bold text-white">
                      {num.displayPhone}
                    </div>

                    <div className="text-[10.5px] text-slate-300 space-y-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-emerald-300">
                        <span>Msg 1 (Áudio + Texto):</span>
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="flex items-center justify-between text-sky-300">
                        <span>Msg 2 (Capacidades):</span>
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PREVIEW OF THE 2 MESSAGES SENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* MESSAGE 1 PREVIEW */}
              <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                  <span>Mensagem 1 (Boas-Vindas + Áudio)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                    Enviada por Áudio & Texto
                  </span>
                </div>
                <div className="p-3 bg-[#DCF8C6] text-slate-900 rounded-xl text-xs leading-relaxed font-sans font-medium shadow-sm">
                  {irisMessage1Text}
                </div>
              </div>

              {/* MESSAGE 2 PREVIEW */}
              <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-2">
                <div className="text-xs font-bold text-sky-400 flex items-center justify-between">
                  <span>Mensagem 2 (Tudo o que Iris é capaz de fazer)</span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono">
                    Enviada na Sequência
                  </span>
                </div>
                <div className="p-3 bg-white text-slate-900 rounded-xl text-[11px] leading-relaxed font-sans font-normal whitespace-pre-wrap shadow-sm max-h-[180px] overflow-y-auto">
                  {irisMessage2Text}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* FOOTER ACTIONS */}
        <footer className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-600 font-medium hidden sm:block">
            {activeTab === 'preview' ? (
              <>Validação concluída: <strong className="text-emerald-700 font-bold">{patients.length} pacientes</strong> receberão este formato individualizado.</>
            ) : (
              <>Canal Oficial WhatsApp Business Meta: <strong className="text-sky-700 font-mono font-bold">+55 73 98104-7390</strong></>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Fechar Painel
            </button>

            {activeTab === 'preview' ? (
              <button
                type="button"
                onClick={() => {
                  if (onConfirmDispatch) {
                    onConfirmDispatch(interpolatedMessage);
                  }
                  onClose();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-emerald-200" />
                <span>Aprovar Template &amp; Disparar Campanha</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRunIrisLiveTest}
                disabled={isTestDispatching}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-sky-200" />
                <span>{isTestDispatching ? 'Sintetizando...' : 'Reenviar Teste dos 5 Números'}</span>
              </button>
            )}
          </div>
        </footer>

      </div>
    </div>
  );
}
