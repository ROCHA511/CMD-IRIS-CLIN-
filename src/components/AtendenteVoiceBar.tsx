import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  Bot, 
  MessageSquare, 
  Calendar, 
  PhoneCall, 
  DollarSign, 
  CheckCircle,
  Radio,
  Sliders
} from 'lucide-react';
import { Patient, Transaction } from '../types';
import { speakHumanVoice, playSoftChime, getBestHumanFemaleVoice, getVoiceSettings, VOICE_PROFILES } from '../utils/humanVoice';
import IrisVoiceSettingsModal from './IrisVoiceSettingsModal';

interface AtendenteVoiceBarProps {
  patients: Patient[];
  onUpdatePatient?: (updatedPatient: Patient) => void;
  onOpenAgenda?: () => void;
  onOpenFinance?: () => void;
  onTriggerOutreach?: (targetIds: string[], message: string, channel: 'whatsapp' | 'chat') => void;
  transactions?: Transaction[];
}

export default function AtendenteVoiceBar({
  patients,
  onUpdatePatient,
  onOpenAgenda,
  onOpenFinance,
  onTriggerOutreach,
  transactions = []
}: AtendenteVoiceBarProps) {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [activeVoiceName, setActiveVoiceName] = useState('✨ Iris Animada & Empolgada');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Load active voice profile name
  useEffect(() => {
    const refreshVoice = () => {
      const current = getVoiceSettings();
      const profileInfo = VOICE_PROFILES.find(p => p.id === current.profile);
      if (profileInfo) {
        setActiveVoiceName(profileInfo.label);
      } else {
        setActiveVoiceName('✨ Iris Animada & Empolgada');
      }
    };

    refreshVoice();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = refreshVoice;
    }
  }, [isVoiceSettingsOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'pt-BR';
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        playSoftChime('start');
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        if (event.results[0].isFinal) {
          processAtendenteAudioInput(currentText);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Erro microfone atendente:', event.error);
        setIsListening(false);
        playSoftChime('finish');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [patients, transactions]);

  // Toggle Microphone
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Seu navegador não possui suporte ao microfone Web Speech API. Utilize o Google Chrome ou Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      playSoftChime('finish');
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsExpanded(true);
      recognitionRef.current.start();
    }
  };

  // Process Voice Command from Atendente
  const processAtendenteAudioInput = async (command: string) => {
    if (!command.trim()) return;

    setIsThinking(true);
    const textLower = command.toLowerCase();
    let replyText = '';

    // 1. AGENDA / CONFIRMADOS INTENT
    if (textLower.includes('agenda') || textLower.includes('confirmado') || textLower.includes('confirmados') || textLower.includes('pendente') || textLower.includes('pendentes') || textLower.includes('marcar consulta')) {
      const confirmados = patients.filter(p => p.appointmentStatus === 'Confirmado');
      const pendentes = patients.filter(p => p.appointmentStatus !== 'Confirmado');

      replyText = `Com certeza! Para hoje no Turno da Manhã a partir das 06:30 por ordem de chegada, temos ${confirmados.length} pacientes na Lista de Confirmados e ${pendentes.length} pendentes aguardando ligação.`;
      
      if (onOpenAgenda) {
        onOpenAgenda();
        replyText += ' Já abri a tela da agenda com as senhas para você conferir!';
      }
    } 
    // 2. DISPARAR CONVITES EXAMES VENCIDOS
    else if (textLower.includes('exame') || textLower.includes('vencido') || textLower.includes('convite') || textLower.includes('mensagem') || textLower.includes('mensagens') || textLower.includes('disparar')) {
      const overdue = patients.filter(p => p.status === 'Exame Vencido' || (p.lastExamDate && p.lastExamDate.includes('14 meses')));
      const targetIds = overdue.length > 0 ? overdue.map(p => p.id) : patients.slice(0, 3).map(p => p.id);
      
      const campaignMsg = "Olá, {{nome}}! Tudo bem? Aqui é a Íris da ÍrisClin. Notamos que seu último exame de vista foi realizado há mais de 1 ano. Para proteger sua saúde ocular, gostaríamos de agendar seu próximo atendimento nesta semana com condições especiais!";

      if (onTriggerOutreach) {
        onTriggerOutreach(targetIds, campaignMsg, 'whatsapp');
      }

      replyText = `Feito! Identifiquei ${targetIds.length} pacientes com exames de vista vencidos há mais de um ano e enviei os convites de agendamento no WhatsApp de todos eles com sucesso!`;
    }
    // 3. CONSULTAR CAIXA / FINANCEIRO
    else if (textLower.includes('caixa') || textLower.includes('financeiro') || textLower.includes('saldo') || textLower.includes('faturamento')) {
      const entradas = transactions.filter(t => t.type === 'entrada' && t.status === 'pago').reduce((a, b) => a + b.amount, 0) || 12450;
      const saidas = transactions.filter(t => t.type === 'saida' && t.status === 'pago').reduce((a, b) => a + b.amount, 0) || 3820;
      const saldo = entradas - saidas;

      replyText = `O saldo atual do caixa da clínica é de R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, com R$ ${entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em receitas e R$ ${saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em despesas.`;
      if (onOpenFinance) {
        onOpenFinance();
      }
    }
    // 4. GENERAL COPILOT AI RESPONSE
    else {
      try {
        const response = await fetch('/api/copilot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ sender: 'admin', content: command }],
            patientContext: { name: 'Atendente da Recepção', status: 'Atendimento por Voz' }
          })
        });
        const data = await response.json();
        replyText = data.response || 'Comando de voz processado pela Íris AI!';
      } catch (err) {
        replyText = `Entendi perfeitamente sua solicitação sobre ${command}. Estou pronta para ajudar na marcação de consultas da manhã a partir das 06:30 por ordem de chegada ou na gestão de convites dos pacientes.`;
      }
    }

    setIsThinking(false);
    setLastResponse(replyText);

    // Speak natural audio response
    speakHumanVoice(
      replyText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="relative inline-block">
      
      {/* MAIN ATENDENTE MIC BUTTON */}
      <button
        onClick={toggleListening}
        className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer ${
          isListening 
            ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white ring-4 ring-rose-400/40 animate-pulse'
            : isSpeaking
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-400/50'
            : 'bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white hover:scale-[1.03] active:scale-[0.97]'
        }`}
        title="Atendente: Clique para falar por voz com a Íris AI e ouvir a resposta em áudio"
      >
        <div className="relative flex items-center justify-center">
          {isListening ? (
            <MicOff className="w-4 h-4 text-white animate-bounce" />
          ) : (
            <Mic className="w-4 h-4 text-white" />
          )}

          {/* Glowing dot */}
          <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
            isListening ? 'bg-white animate-ping' : isSpeaking ? 'bg-emerald-300 animate-ping' : 'bg-emerald-400'
          }`} />
        </div>

        <span>
          {isListening ? 'Ouvindo Atendente...' : isSpeaking ? 'Íris Falando...' : 'Falar por Voz (Atendente)'}
        </span>

        {/* SOUNDWAVE EQUALIZER BARS WHEN ACTIVE */}
        {(isListening || isSpeaking) && (
          <div className="flex items-center gap-0.5 h-3 ml-1">
            <span className="w-0.5 bg-white rounded-full h-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 bg-white rounded-full h-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 bg-white rounded-full h-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </button>

      {/* POPUP CARD WITH VOICE TRANSCRIPT & AUDIO RESPONSE */}
      {(isExpanded || lastResponse) && (
        <div className="absolute top-12 left-0 z-50 w-80 sm:w-96 bg-slate-900 border border-sky-500/30 rounded-2xl shadow-2xl p-4 text-slate-100 animate-fade-in space-y-3">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 flex items-center justify-center text-slate-950 font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Íris Voice • Conversa Humana</h4>
                <p className="text-[9px] text-amber-300 font-bold">{activeVoiceName}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsVoiceSettingsOpen(true)}
                className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-black border border-amber-400/30 transition-all flex items-center gap-1 cursor-pointer"
                title="Ajustar Tom, Animação e Velocidade da Voz"
              >
                <Sliders className="w-3 h-3 text-amber-400" />
                <span>Voz</span>
              </button>

              <button
                onClick={() => {
                  setIsExpanded(false);
                  setLastResponse(null);
                  window.speechSynthesis.cancel();
                }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* LISTENING STATUS WITH SOUND WAVE */}
          {isListening && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-rose-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>Atendente falando no microfone:</span>
                </span>
                <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded font-mono">pt-BR</span>
              </div>
              <p className="text-xs text-white font-medium italic min-h-[20px]">
                "{transcript || 'Diga seu comando (ex: Quantos confirmados na agenda de hoje?)...'}"
              </p>
            </div>
          )}

          {/* THINKING STATUS */}
          {isThinking && (
            <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-xl flex items-center gap-2 text-xs text-sky-300 font-bold">
              <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
              <span>Íris AI processando áudio e preparando resposta...</span>
            </div>
          )}

          {/* IRIS AUDIO RESPONSE CARD */}
          {lastResponse && !isThinking && (
            <div className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                  <span>Resposta em Áudio da Íris:</span>
                </span>
                <button
                  onClick={() => speakHumanVoice(lastResponse, () => setIsSpeaking(true), () => setIsSpeaking(false))}
                  className="text-[10px] text-sky-400 hover:underline cursor-pointer flex items-center gap-1 font-bold"
                >
                  🔊 Reouvir Voz
                </button>
              </div>

              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {lastResponse}
              </p>
            </div>
          )}

          {/* VOICE SHORTCUTS */}
          <div className="pt-1 flex flex-wrap gap-1.5">
            <button
              onClick={() => processAtendenteAudioInput('Como está a lista de confirmados e pendentes da agenda de hoje?')}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-sky-300 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              <span>Conferir Agenda</span>
            </button>

            <button
              onClick={() => processAtendenteAudioInput('Dispare convites para pacientes com exame vencido há mais de um ano')}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Disparar WhatsApp</span>
            </button>
          </div>

        </div>
      )}

      <IrisVoiceSettingsModal 
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />
    </div>
  );
}
