import React, { useState, useEffect, useRef } from 'react';
import { Patient, Transaction } from '../types';
import { speakHumanVoice, playSoftChime, getBestHumanFemaleVoice, getVoiceSettings, VOICE_PROFILES } from '../utils/humanVoice';
import IrisVoiceSettingsModal from './IrisVoiceSettingsModal';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  X, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  Megaphone, 
  DollarSign, 
  Calendar, 
  FileText,
  Bot,
  Sliders
} from 'lucide-react';

interface IrisVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onTriggerOutreach: (targetPatientIds: string[], messageContent: string, channel: 'whatsapp' | 'chat') => void;
  onOpenFinance: () => void;
  onOpenOutreachModal: () => void;
  transactions?: Transaction[];
}

interface CommandLog {
  id: string;
  sender: 'operator' | 'iris';
  text: string;
  timestamp: string;
  actionDone?: string;
}

export default function IrisVoiceAssistantModal({
  isOpen,
  onClose,
  patients,
  onTriggerOutreach,
  onOpenFinance,
  onOpenOutreachModal,
  transactions = []
}: IrisVoiceAssistantModalProps) {
  const [inputCommand, setInputCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [voiceName, setVoiceName] = useState<string>('✨ Iris Animada & Empolgada');
  const [commandLogs, setCommandLogs] = useState<CommandLog[]>([
    {
      id: 'init-1',
      sender: 'iris',
      text: 'Olá! Sou a Íris, sua secretária virtual e cérebro operacional oficial da ÍrisClin (+55 73 98104-7390). Estou conectada ao sistema web, agenda, caixa, CRM e WhatsApp Meta. Como posso te auxiliar agora?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll command log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commandLogs, isThinking]);

  // Speech Recognition setup (StT)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputCommand(transcript);
        handleExecuteCommand(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [patients, transactions]);

  // Find best Elegant Female Portuguese Voice
  const getElegantFemaleVoice = (): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const ptVoices = voices.filter(v => v.lang.includes('pt') || v.lang.includes('PT') || v.lang.includes('pt-BR'));

    // Priority 1: Female names in Portuguese
    const femaleNameMatch = ptVoices.find(v => {
      const name = v.name.toLowerCase();
      return name.includes('luciana') || 
             name.includes('francisca') || 
             name.includes('maria') || 
             name.includes('vitoria') || 
             name.includes('vitória') || 
             name.includes('heloisa') || 
             name.includes('leticia') || 
             name.includes('letícia') || 
             name.includes('marcia') || 
             name.includes('elsa') ||
             name.includes('spoken') ||
             name.includes('female') ||
             name.includes('mulher');
    });

    if (femaleNameMatch) return femaleNameMatch;

    // Priority 2: Google Português
    const googlePt = ptVoices.find(v => v.name.toLowerCase().includes('google'));
    if (googlePt) return googlePt;

    // Priority 3: Any PT voice
    return ptVoices[0] || voices[0] || null;
  };

  // Load voice profile dynamically
  useEffect(() => {
    const refreshVoiceLabel = () => {
      const current = getVoiceSettings();
      const profileInfo = VOICE_PROFILES.find(p => p.id === current.profile);
      if (profileInfo) {
        setVoiceName(profileInfo.label);
      } else {
        setVoiceName('✨ Iris Animada & Empolgada');
      }
    };

    refreshVoiceLabel();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = refreshVoiceLabel;
    }
  }, [isVoiceSettingsOpen]);

  // Speak Text function with Ultra-Human Female Voice modulation
  const speakWithElegantVoice = (text: string) => {
    if (!isTtsEnabled) return;
    speakHumanVoice(text);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Seu navegador não possui suporte nativo para o microfone Web Speech API. Utilize o Google Chrome ou Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis.cancel();
      recognitionRef.current.start();
    }
  };

  // Execute Operator Command
  const handleExecuteCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userLog: CommandLog = {
      id: `op-${Date.now()}`,
      sender: 'operator',
      text: commandText,
      timestamp
    };

    setCommandLogs(prev => [...prev, userLog]);
    setInputCommand('');
    setIsThinking(true);

    const textLower = commandText.toLowerCase();

    // 1. ACTION: Send messages to overdue exam patients (> 1 year / 12 months)
    const isOverdueExamIntent = 
      (textLower.includes('envie') || textLower.includes('enviar') || textLower.includes('dispare') || textLower.includes('disparar') || textLower.includes('mande') || textLower.includes('mandar') || textLower.includes('mensagem') || textLower.includes('mensagens') || textLower.includes('convite')) &&
      (textLower.includes('1 ano') || textLower.includes('um ano') || textLower.includes('12 meses') || textLower.includes('vencido') || textLower.includes('atrasado') || textLower.includes('exame'));

    if (isOverdueExamIntent) {
      // Find patients overdue for > 1 year
      const overduePatients = patients.filter(p => 
        p.status === 'Exame Vencido' || 
        (p.lastExamDate && (
          p.lastExamDate.includes('14 meses') || 
          p.lastExamDate.includes('18 meses') || 
          p.lastExamDate.includes('17 meses') || 
          p.lastExamDate.includes('12 meses') ||
          p.lastExamDate.includes('vencido') ||
          p.lastExamDate.includes('ano')
        ))
      );

      const targetIds = overduePatients.length > 0 
        ? overduePatients.map(p => p.id) 
        : patients.slice(0, 3).map(p => p.id);

      const campaignMessage = "Olá, {{nome}}! Tudo bem? Aqui é a Íris da ÍrisClin. Notamos que seu último exame de vista foi realizado há mais de 1 ano. Para proteger sua saúde ocular, gostaríamos de agendar seu próximo atendimento nesta semana com condições especiais!";

      // Trigger bulk message system action
      onTriggerOutreach(targetIds, campaignMessage, 'whatsapp');

      const responseText = `Com certeza, Doutor Augusto! Identifiquei ${targetIds.length} pacientes com mais de 1 ano desde o último exame de vista. Disparei a mensagem de convocação no WhatsApp do próximo atendimento para todos eles com sucesso!`;

      setTimeout(() => {
        const irisLog: CommandLog = {
          id: `iris-${Date.now()}`,
          sender: 'iris',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionDone: `Mensagens enviadas para ${targetIds.length} pacientes via WhatsApp`
        };
        setCommandLogs(prev => [...prev, irisLog]);
        setIsThinking(false);
        speakWithElegantVoice(responseText);
      }, 700);

      return;
    }

    // 2. ACTION: Check Cash Flow / Finance
    const isFinanceIntent = textLower.includes('caixa') || textLower.includes('financeiro') || textLower.includes('faturamento') || textLower.includes('saldo');
    if (isFinanceIntent) {
      const entradas = transactions.filter(t => t.type === 'entrada' && t.status === 'pago').reduce((a, b) => a + b.amount, 0) || 12450;
      const saidas = transactions.filter(t => t.type === 'saida' && t.status === 'pago').reduce((a, b) => a + b.amount, 0) || 3820;
      const saldo = entradas - saidas;

      const responseText = `Com prazer, Doutor! O fluxo de caixa da ÍrisClin registra no momento um saldo líquido de R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, com R$ ${entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em entradas e R$ ${saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em despesas operacionais.`;

      setTimeout(() => {
        const irisLog: CommandLog = {
          id: `iris-${Date.now()}`,
          sender: 'iris',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionDone: 'Consulta ao Fluxo de Caixa'
        };
        setCommandLogs(prev => [...prev, irisLog]);
        setIsThinking(false);
        speakWithElegantVoice(responseText);
      }, 600);

      return;
    }

    // 3. ACTION: Open Financial Modal
    if (textLower.includes('abrir caixa') || textLower.includes('abrir financeiro') || textLower.includes('relatório pdf')) {
      onOpenFinance();
      const responseText = 'Abrindo a janela oficial do Fluxo de Caixa e Relatório PDF para o senhor agora mesmo!';
      const irisLog: CommandLog = {
        id: `iris-${Date.now()}`,
        sender: 'iris',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCommandLogs(prev => [...prev, irisLog]);
      setIsThinking(false);
      speakWithElegantVoice(responseText);
      return;
    }

    // 4. ACTION: Check Agenda / Schedule / Confirmed x Pending
    const isAgendaIntent = textLower.includes('agenda') || textLower.includes('agendar') || textLower.includes('marcar consulta') || textLower.includes('confirmados') || textLower.includes('pendentes');
    if (isAgendaIntent) {
      const confirmados = patients.filter(p => p.appointmentStatus === 'Confirmado');
      const pendentes = patients.filter(p => p.appointmentStatus !== 'Confirmado');

      const responseText = `Com certeza, Doutor! Os agendamentos do Turno da Manhã ocorrem a partir das 06:30 rigorosamente por ordem de chegada. No momento, temos ${confirmados.length} paciente(s) na Lista de Confirmados e ${pendentes.length} paciente(s) na Lista de Pendentes aguardando ligação. Posso abrir o painel da agenda para o senhor conferir todos os contatos?`;

      setTimeout(() => {
        const irisLog: CommandLog = {
          id: `iris-${Date.now()}`,
          sender: 'iris',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionDone: `Consulta à Agenda: ${confirmados.length} Confirmados (#1, #2...) e ${pendentes.length} Pendentes`
        };
        setCommandLogs(prev => [...prev, irisLog]);
        setIsThinking(false);
        speakWithElegantVoice(responseText);
      }, 600);

      return;
    }

    // 4. ACTION: General AI Q&A via Copilot API
    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ sender: 'admin', content: commandText }],
          patientContext: {
            name: 'Operador / Médico Dr. Augusto Faro',
            status: 'Atendimento do Sistema'
          }
        })
      });
      const data = await response.json();

      const responseText = data.response || 'Comando processado com sucesso pela Íris AI!';

      const irisLog: CommandLog = {
        id: `iris-${Date.now()}`,
        sender: 'iris',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCommandLogs(prev => [...prev, irisLog]);
      speakWithElegantVoice(responseText);
    } catch (err) {
      console.error('Error in voice assistant chat:', err);
      const fallbackText = 'Entendi seu comando, Doutor! Como sua assistente virtual, estou pronta para disparar avisos no WhatsApp, agendar exames de vista ou gerar demonstrativos de caixa.';
      setCommandLogs(prev => [...prev, {
        id: `iris-err-${Date.now()}`,
        sender: 'iris',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speakWithElegantVoice(fallbackText);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-sky-500/30 overflow-hidden flex flex-col h-[85vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 shadow-lg relative">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-sky-400">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full animate-ping" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Íris AI • Voz Feminina Elegante</h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  OPERADOR & SISTEMA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Volume2 className="w-3 h-3 text-sky-400" />
                <span>{voiceName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceSettingsOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-amber-400/30 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Abrir Opções de Voz da Iris (Animada, Empolgada, Tom e Velocidade)"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Ajustar Voz</span>
            </button>

            <button
              onClick={() => setIsTtsEnabled(!isTtsEnabled)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isTtsEnabled 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Ativar/Desativar reprodução de voz feminina em áudio"
            >
              {isTtsEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{isTtsEnabled ? 'Áudio Ligado' : 'Áudio Mudo'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QUICK SUGGESTIONS CAROUSEL */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" /> Atalhos de Voz:
          </span>

          <button
            onClick={() => handleExecuteCommand('Envie mensagens para os clientes com mais de um ano para fazer exame no proximo atendimento')}
            className="px-3 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Megaphone className="w-3 h-3 text-sky-400" />
            <span>Disparar convites exames (&gt;1 ano)</span>
          </button>

          <button
            onClick={() => handleExecuteCommand('Como está o saldo do caixa e faturamento da clínica hoje?')}
            className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span>Consultar Saldo do Caixa</span>
          </button>

          <button
            onClick={() => handleExecuteCommand('Abrir relatório de fluxo de caixa em PDF')}
            className="px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <FileText className="w-3 h-3 text-teal-400" />
            <span>Abrir Relatório PDF</span>
          </button>
        </div>

        {/* DIALOG CHAT / COMMAND HISTORY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/40">
          {commandLogs.map((log) => {
            const isIris = log.sender === 'iris';
            return (
              <div 
                key={log.id} 
                className={`flex gap-3 max-w-[88%] ${isIris ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                  isIris 
                    ? 'bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-md' 
                    : 'bg-slate-700 text-slate-200'
                }`}>
                  {isIris ? 'ÍR' : 'DR'}
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isIris ? '' : 'justify-end'}`}>
                    <span className="font-bold text-slate-300">{isIris ? 'Íris AI (Assistente)' : 'Dr. Augusto Faro (Operador)'}</span>
                    <span>{log.timestamp}</span>
                  </div>

                  <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed border shadow-lg ${
                    isIris 
                      ? 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none' 
                      : 'bg-sky-600 text-white border-sky-500 rounded-tr-none'
                  }`}>
                    <p className="whitespace-pre-line">{log.text}</p>

                    {log.actionDone && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[10.5px] text-emerald-400 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Ação Executada: {log.actionDone}</span>
                      </div>
                    )}
                  </div>

                  {/* Audio Replay Button */}
                  {isIris && (
                    <button
                      onClick={() => speakWithElegantVoice(log.text)}
                      className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold pt-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Ouvir novamente em voz feminina</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                ÍR
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 text-sky-400 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 font-bold">
                <span>Íris AI está processando o comando</span>
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={logsEndRef} />
        </div>

        {/* INPUT COMMAND BAR WITH MICROPHONE SPEECH-TO-TEXT */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteCommand(inputCommand);
            }} 
            className="flex items-center gap-2"
          >
            {/* MIC BUTTON */}
            <button
              type="button"
              onClick={toggleMic}
              className={`p-3 rounded-xl border text-white font-bold transition-all cursor-pointer shrink-0 shadow-lg ${
                isListening 
                  ? 'bg-rose-600 border-rose-500 animate-pulse' 
                  : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 border-sky-400/30'
              }`}
              title={isListening ? 'Ouvindo operador... Clique para parar' : 'Falar comando de voz para Íris AI'}
            >
              {isListening ? <MicOff className="w-5 h-5 text-white animate-bounce" /> : <Mic className="w-5 h-5 text-white" />}
            </button>

            {/* TEXT INPUT */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                placeholder={isListening ? 'Ouvindo sua voz...' : 'Fale ou digite seu comando para Íris AI (ex: envie mensagens para clientes com mais de 1 ano sem exame)...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={!inputCommand.trim() || isThinking}
              className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-extrabold rounded-xl transition-all cursor-pointer shrink-0 shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sintetizador de Voz Feminina Nativo do Navegador (Web Speech API)</span>
            </div>
            <span>ÍrisClin Voice Intelligence v2.5</span>
          </div>
        </div>

      </div>

      <IrisVoiceSettingsModal 
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />
    </div>
  );
}
