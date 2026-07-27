import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Eye, 
  Scan, 
  FileText, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Layers, 
  User, 
  Plus, 
  FileUp,
  Brain,
  Search,
  Check,
  BellRing,
  Volume2,
  VolumeX,
  Play,
  CheckSquare,
  Clock,
  UserCheck,
  Stethoscope,
  Tv,
  ArrowRight,
  ShieldAlert,
  Database,
  BarChart2,
  ListOrdered,
  RefreshCw,
  LogOut,
  Radio,
  Building2,
  Sparkle
} from 'lucide-react';
import { Patient, PatientDocument, FilaAtendimentoItem, FilaLog } from '../types';

interface AiExamAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onAddExamToPatient?: (patientId: string, document: PatientDocument) => void;
  userRole?: 'MEDICO' | 'ADMIN' | 'RECEPCAO';
}

type ModalTab = 'medico' | 'recepcao' | 'exames' | 'sql';
type ExamType = 'oct' | 'campo_visual' | 'tonometria';

interface ExamPreset {
  id: string;
  type: ExamType;
  title: string;
  patientName: string;
  previewUrl: string;
  findings: {
    od: string;
    oe: string;
    metrics: { label: string; value: string; status: 'normal' | 'alerta' | 'critico' }[];
  };
  aiDiagnosis: string;
  riskLevel: 'Baixo (Normal)' | 'Moderado (Acompanhar)' | 'Elevado (Risco de Glaucoma / Patologia)';
  recommendation: string;
}

export default function AiExamAnalysisModal({
  isOpen,
  onClose,
  patients,
  onAddExamToPatient,
  userRole = 'MEDICO'
}: AiExamAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('medico');
  const [roleFilter, setRoleFilter] = useState<'MEDICO' | 'ADMIN' | 'RECEPCAO'>(userRole);

  // Real-time Queue State initialized from patients & cashier payment timestamps
  const [queue, setQueue] = useState<FilaAtendimentoItem[]>([]);
  const [logs, setLogs] = useState<FilaLog[]>([]);
  const [calledAlert, setCalledAlert] = useState<{
    patientName: string;
    consultorio: string;
    medicoNome: string;
    timestamp: string;
  } | null>(null);

  // Audio chime state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Current timer for active appointment
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number>(0);

  // Exam Analysis Tab States
  const [examType, setExamType] = useState<ExamType>('oct');
  const [selectedExamPatientId, setSelectedExamPatientId] = useState<string>(patients[0]?.id || '');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ExamPreset | null>(null);
  const [savedExamSuccess, setSavedExamSuccess] = useState<boolean>(false);

  // Setup initial queue when patients list changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Build realistic queue from patient list with simulated payment confirmation times
    const initialQueue: FilaAtendimentoItem[] = patients.map((p, idx) => {
      // Simulate payment confirmed timestamps (earlier index = earlier payment)
      const dateBase = new Date();
      dateBase.setMinutes(dateBase.getMinutes() - (patients.length - idx) * 12);
      const pagamentoTime = dateBase.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Determine default status
      let initialStatus: 'AGUARDANDO' | 'CHAMADO' | 'EM_ATENDIMENTO' | 'FINALIZADO' = 'AGUARDANDO';
      if (idx === 0) initialStatus = 'EM_ATENDIMENTO';
      else if (idx === 1) initialStatus = 'CHAMADO';
      else if (idx >= patients.length - 2) initialStatus = 'FINALIZADO';

      return {
        id: `fila_${p.id}`,
        paciente_id: p.id,
        paciente_nome: p.name,
        medico_id: 'med_augusto_81047',
        medico_nome: 'Dr. Augusto Faro',
        consultorio: 'Consultório 01',
        data_chegada: '08:' + String(10 + idx * 5).padStart(2, '0'),
        pagamento_confirmado_em: pagamentoTime,
        status: initialStatus,
        inicio_atendimento: idx === 0 ? '08:45' : undefined,
        chamado_em: idx === 1 ? '08:50' : undefined
      };
    });

    // ORDER BY pagamento_confirmado_em ASC (Rule 2)
    initialQueue.sort((a, b) => a.pagamento_confirmado_em.localeCompare(b.pagamento_confirmado_em));
    setQueue(initialQueue);

    // Initial log entries
    setLogs([
      {
        id: 'log_1',
        paciente_nome: initialQueue[0]?.paciente_nome || 'João da Silva',
        medico_nome: 'Dr. Augusto Faro',
        consultorio: 'Consultório 01',
        evento: 'EM_ATENDIMENTO',
        horario: '08:45'
      },
      {
        id: 'log_2',
        paciente_nome: initialQueue[1]?.paciente_nome || 'Maria Souza',
        medico_nome: 'Dr. Augusto Faro',
        consultorio: 'Consultório 01',
        evento: 'PACIENTE_CHAMADO',
        horario: '08:50'
      }
    ]);
  }, [isOpen, patients]);

  // Active appointment live timer interval
  useEffect(() => {
    let interval: any = null;
    const currentActive = queue.find(q => q.status === 'EM_ATENDIMENTO');
    if (currentActive) {
      interval = setInterval(() => {
        setActiveTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setActiveTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [queue]);

  // Realtime Broadcast Channel synchronization simulation between tabs
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('iris_queue_realtime_channel');

    channel.onmessage = (event) => {
      if (event.data?.type === 'QUEUE_UPDATED') {
        setQueue(event.data.queue);
      }
      if (event.data?.type === 'PATIENT_CALLED') {
        setCalledAlert(event.data.alert);
        if (soundEnabled) playChimeSound();
      }
    };

    return () => {
      channel.close();
    };
  }, [soundEnabled]);

  // Broadcast function to sync tabs
  const broadcastUpdate = (newQueue: FilaAtendimentoItem[], alertData?: any) => {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('iris_queue_realtime_channel');
      channel.postMessage({
        type: 'QUEUE_UPDATED',
        queue: newQueue
      });
      if (alertData) {
        channel.postMessage({
          type: 'PATIENT_CALLED',
          alert: alertData
        });
      }
      channel.close();
    }
  };

  // Sound synthesis chime
  const playChimeSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (err) {
      console.log('Audio chime error:', err);
    }
  };

  // RULE 4: CHAMAR PRÓXIMO PACIENTE
  const handleChamarProximo = () => {
    // Find first patient with status AGUARDANDO ordered by pagamento_confirmado_em
    const nextPatientIndex = queue.findIndex(q => q.status === 'AGUARDANDO');

    if (nextPatientIndex === -1) {
      alert('Não há mais pacientes aguardando na fila de pagamento confirmado.');
      return;
    }

    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const targetPatient = queue[nextPatientIndex];

    const updatedQueue = queue.map((item, idx) => {
      // If there was an active patient, we finish them or set to called
      if (item.status === 'CHAMADO') {
        return { ...item, status: 'EM_ATENDIMENTO' as const, inicio_atendimento: nowTime };
      }
      if (idx === nextPatientIndex) {
        return {
          ...item,
          status: 'CHAMADO' as const,
          chamado_em: nowTime,
          medico_id: 'med_augusto_81047',
          medico_nome: 'Dr. Augusto Faro',
          consultorio: 'Consultório 01'
        };
      }
      return item;
    });

    setQueue(updatedQueue);
    setActiveTimerSeconds(0);

    const alertData = {
      patientName: targetPatient.paciente_nome,
      consultorio: 'Consultório 01',
      medicoNome: 'Dr. Augusto Faro',
      timestamp: nowTime
    };

    setCalledAlert(alertData);
    if (soundEnabled) playChimeSound();

    // Log event
    const newLog: FilaLog = {
      id: `log_${Date.now()}`,
      paciente_nome: targetPatient.paciente_nome,
      medico_nome: 'Dr. Augusto Faro',
      consultorio: 'Consultório 01',
      evento: 'PACIENTE_CHAMADO',
      horario: nowTime
    };
    setLogs(prev => [newLog, ...prev]);

    // Emit Realtime Broadcast
    broadcastUpdate(updatedQueue, alertData);
  };

  // RULE 7 & 8: FINALIZAR ATENDIMENTO & CHAMAR AUTOMÁTICO
  const handleFinalizarAtendimento = (itemToFinish?: FilaAtendimentoItem) => {
    const activeItem = itemToFinish || queue.find(q => q.status === 'EM_ATENDIMENTO' || q.status === 'CHAMADO');
    if (!activeItem) return;

    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let updatedQueue = queue.map(q => {
      if (q.id === activeItem.id) {
        return {
          ...q,
          status: 'FINALIZADO' as const,
          fim_atendimento: nowTime
        };
      }
      return q;
    });

    // Auto-select next waiting patient if available
    const nextWaiting = updatedQueue.find(q => q.status === 'AGUARDANDO');
    let alertData = undefined;

    if (nextWaiting) {
      updatedQueue = updatedQueue.map(q => {
        if (q.id === nextWaiting.id) {
          return {
            ...q,
            status: 'CHAMADO' as const,
            chamado_em: nowTime,
            medico_id: 'med_augusto_81047',
            medico_nome: 'Dr. Augusto Faro',
            consultorio: 'Consultório 01'
          };
        }
        return q;
      });

      alertData = {
        patientName: nextWaiting.paciente_nome,
        consultorio: 'Consultório 01',
        medicoNome: 'Dr. Augusto Faro',
        timestamp: nowTime
      };
      setCalledAlert(alertData);
      if (soundEnabled) playChimeSound();
    } else {
      setCalledAlert(null);
    }

    setQueue(updatedQueue);
    setActiveTimerSeconds(0);

    // Logs
    const finLog: FilaLog = {
      id: `log_${Date.now()}`,
      paciente_nome: activeItem.paciente_nome,
      medico_nome: 'Dr. Augusto Faro',
      consultorio: 'Consultório 01',
      evento: 'FINALIZADO',
      horario: nowTime,
      duracao_minutos: Math.floor(activeTimerSeconds / 60) || 12
    };
    setLogs(prev => [finLog, ...prev]);

    broadcastUpdate(updatedQueue, alertData);
  };

  // EXAM AI ANALYSIS LOGIC
  const presets: Record<ExamType, ExamPreset> = {
    oct: {
      id: 'oct-1',
      type: 'oct',
      title: 'Tomografia de Coerência Óptica (OCT Nervo Óptico & Mácula)',
      patientName: patients.find(p => p.id === selectedExamPatientId)?.name || 'Paciente Selecionado',
      previewUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
      findings: {
        od: 'Escavação C/D 0.65 vertical. Afinamento da camada de fibras nervosas retinianas (CFNR) no setor temporal inferior (72 µm). Integridade preservada na área foveal.',
        oe: 'Escavação C/D 0.40 fisiológica. Espessura macular preservada (278 µm). Camada CFNR sem defeitos anatômicos perceptíveis.',
        metrics: [
          { label: 'C/D Ratio OD', value: '0.65 (Aumentada)', status: 'alerta' },
          { label: 'C/D Ratio OE', value: '0.40 (Normal)', status: 'normal' },
          { label: 'Espessura CFNR OD', value: '72 µm (Inferior)', status: 'alerta' },
          { label: 'Espessura Foveal OE', value: '278 µm', status: 'normal' }
        ]
      },
      aiDiagnosis: 'Assimetria de escavação com afinamento setorial inferior no Olho Direito. Compatível com suspeita inicial de Glaucoma Primário de Ângulo Aberto (GPAA).',
      riskLevel: 'Moderado (Acompanhar)',
      recommendation: 'Recomenda-se correlacionar com Perimetria Computadorizada (Campo Visual) e repetir OCT em 6 meses para acompanhamento de progressão.'
    },
    campo_visual: {
      id: 'cv-1',
      type: 'campo_visual',
      title: 'Campo Visual Humana 24-2 (Perimetria Computadorizada)',
      patientName: patients.find(p => p.id === selectedExamPatientId)?.name || 'Paciente Selecionado',
      previewUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      findings: {
        od: 'Índice VFI 94%. Perda Média (MD) -2.8 dB. Escotoma arciforme inicial no quadrante superior nasal. Fidedignidade do teste alta (Perda de Fixação < 5%).',
        oe: 'Índice VFI 99%. Perda Média (MD) -0.4 dB. Sem defeitos de campo visual significativos.',
        metrics: [
          { label: 'VFI OD', value: '94%', status: 'alerta' },
          { label: 'VFI OE', value: '99%', status: 'normal' },
          { label: 'Perda Média (MD)', value: '-2.8 dB', status: 'alerta' },
          { label: 'PSD (Desvio)', value: '3.1 dB', status: 'alerta' }
        ]
      },
      aiDiagnosis: 'Defeito arciforme inicial em quadrante nasal no OD correspondente à alteração de CFNR no OCT. Campo visual esquerdo dentro dos limites da normalidade.',
      riskLevel: 'Moderado (Acompanhar)',
      recommendation: 'Correlação tomográfica-perimétrica confirmada. Sugere-se otimizar controle da Pressão Intraocular (PIO).'
    },
    tonometria: {
      id: 'tono-1',
      type: 'tonometria',
      title: 'Tonometria de Aplanação de Goldmann (PIO) & Paquimetria',
      patientName: patients.find(p => p.id === selectedExamPatientId)?.name || 'Paciente Selecionado',
      previewUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      findings: {
        od: 'PIO Medida: 21 mmHg. CCT (Espessura Corneana Central): 510 µm (Córnea fina). PIO Corrigida estimada: 23 mmHg.',
        oe: 'PIO Medida: 15 mmHg. CCT: 515 µm. PIO Corrigida estimada: 16 mmHg.',
        metrics: [
          { label: 'PIO Medida OD', value: '21 mmHg', status: 'alerta' },
          { label: 'PIO Corrigida OD', value: '23 mmHg', status: 'critico' },
          { label: 'PIO Medida OE', value: '15 mmHg', status: 'normal' },
          { label: 'PIO Corrigida OE', value: '16 mmHg', status: 'normal' }
        ]
      },
      aiDiagnosis: 'Hipertensão Ocular no Olho Direito após correção paquimétrica. Olho Esquerdo com pressão intraocular normal.',
      riskLevel: 'Elevado (Risco de Glaucoma / Patologia)',
      recommendation: 'Indicação de hipotensor ocular tópico conforme avaliação do médico Oftalmologista. Reavaliar curva diurna de pressão.'
    }
  };

  const handleStartExamAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTimeout(() => {
      setAnalysisResult(presets[examType]);
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleSaveExamToDossier = () => {
    if (!analysisResult || !selectedExamPatientId || !onAddExamToPatient) return;
    const newDoc: PatientDocument = {
      id: `exam_ai_${Date.now()}`,
      type: 'exame',
      title: `Laudo IA: ${analysisResult.title}`,
      imageUrl: analysisResult.previewUrl,
      category: examType === 'oct' ? 'OCT Macular/Nervo' : examType === 'campo_visual' ? 'Campimetria' : 'Tonometria',
      date: new Date().toLocaleDateString('pt-BR'),
      notes: `Análise IA: ${analysisResult.aiDiagnosis} | Risco: ${analysisResult.riskLevel}`,
      doctorName: 'Dr. Augusto Faro'
    };
    onAddExamToPatient(selectedExamPatientId, newDoc);
    setSavedExamSuccess(true);
    setTimeout(() => setSavedExamSuccess(false), 3000);
  };

  if (!isOpen) return null;

  // Filtered queue elements
  const currentActivePatient = queue.find(q => q.status === 'EM_ATENDIMENTO' || q.status === 'CHAMADO');
  const upcomingQueue = queue.filter(q => q.status === 'AGUARDANDO');
  const finishedToday = queue.filter(q => q.status === 'FINALIZADO');

  // Format timer seconds as mm:ss
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[94vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* HEADER FUTURISTA ÍRIS CLIN */}
        <header className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
              <Stethoscope className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  Painel de Chamada Médica &amp; Fila de Atendimento
                </h2>
                <span className="text-[10px] font-black bg-sky-400/20 text-sky-300 border border-sky-400/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-ping" /> REALTIME TEMPO REAL
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Dr. Augusto Faro • CRM/BA 81.047 • Consultório 01
              </p>
            </div>
          </div>

          {/* RIGHT UTILITIES & CLOSE */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold border ${
                soundEnabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={soundEnabled ? 'Som da chamada ativado' : 'Som desativado'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Som LIGADO' : 'MUTE'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              title="Fechar Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* TABS NAVIGATION BAR */}
        <nav className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between overflow-x-auto shrink-0 gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('medico')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'medico' 
                  ? 'bg-sky-500 text-slate-950 shadow-md font-black scale-102' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Painel do Médico</span>
              <span className="text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded-full font-extrabold text-sky-200">
                {upcomingQueue.length} na fila
              </span>
            </button>

            <button
              onClick={() => setActiveTab('recepcao')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 relative ${
                activeTab === 'recepcao' 
                  ? 'bg-indigo-600 text-white shadow-md font-black scale-102' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Painel da Recepção / TV</span>
              {calledAlert && (
                <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping absolute top-1 right-1" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('exames')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'exames' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black scale-102' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Análise IA de Exames</span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'sql' 
                  ? 'bg-slate-700 text-amber-300 shadow-md font-black' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span>Esquema SQL Fila</span>
            </button>
          </div>

          {/* ROLE SELECTOR PERMISSION DEMO */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 hidden md:flex">
            <span>Acesso Perfil:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-[11px] font-extrabold focus:outline-hidden"
            >
              <option value="MEDICO">MEDICO (Dr. Augusto)</option>
              <option value="ADMIN">ADMINISTRADOR</option>
              <option value="RECEPCAO">RECEPCAO / ATENDENTE</option>
            </select>
          </div>
        </nav>

        {/* BODY CONTAINER */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 space-y-6">

          {/* TAB 1: PAINEL DO MÉDICO (FILA DE ATENDIMENTO) */}
          {activeTab === 'medico' && (
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* CARD 1: PACIENTE ATUAL EM CONSULTA OU CHAMADO */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-900/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  
                  {/* PATIENT DETAILS */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <Activity className="w-3.5 h-3.5" /> PACIENTE ATUAL EM ATENDIMENTO
                      </span>

                      <span className="text-xs text-slate-300 font-bold flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                        <Building2 className="w-3.5 h-3.5 text-sky-400" /> Consultório 01
                      </span>
                    </div>

                    {currentActivePatient ? (
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          {currentActivePatient.paciente_nome}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                          <span>Horário do Caixa: <strong className="text-emerald-400 font-black">{currentActivePatient.pagamento_confirmado_em}</strong></span>
                          <span>• Status: <strong className="text-amber-300 font-black uppercase">{currentActivePatient.status}</strong></span>
                          <span>• Tempo em Consulta: <strong className="text-sky-300 font-black text-sm">{formatTimer(activeTimerSeconds)} min</strong></span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-400 italic">
                          Nenhum paciente no consultório no momento
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Clique no botão ao lado para chamar o primeiro paciente da fila com pagamento confirmado.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS (CHAMAR PRÓXIMO / FINALIZAR CONSULTA) */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    
                    {/* BUTTON 4: CHAMAR PRÓXIMO */}
                    <button
                      onClick={handleChamarProximo}
                      className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg hover:shadow-sky-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 min-h-[52px]"
                    >
                      <BellRing className="w-5 h-5 text-slate-950 animate-bounce" />
                      <span>[ CHAMAR PRÓXIMO ]</span>
                    </button>

                    {/* BUTTON 7: FINALIZAR CONSULTA */}
                    {currentActivePatient && (
                      <button
                        onClick={() => handleFinalizarAtendimento()}
                        className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-rose-900/80 text-rose-200 hover:text-white font-black text-xs rounded-2xl border border-rose-500/40 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 min-h-[52px]"
                      >
                        <CheckSquare className="w-4 h-4 text-rose-400" />
                        <span>[ FINALIZAR CONSULTA ]</span>
                      </button>
                    )}

                  </div>

                </div>
              </div>

              {/* CARD 2: PRÓXIMOS DA FILA (ORDER BY PAGAMENTO_CONFIRMADO_EM ASC) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ListOrdered className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-base font-black text-slate-900">
                        Próximos Pacientes na Fila de Espera
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ordenado automaticamente pela data e hora da confirmação do pagamento no caixa (<code className="bg-slate-100 text-indigo-700 px-1 rounded">ORDER BY pagamento_confirmado_em ASC</code>)
                    </p>
                  </div>

                  <span className="text-xs font-black bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    {upcomingQueue.length} Pacientes em Espera
                  </span>
                </div>

                {/* QUEUE TABLE / CARDS */}
                {upcomingQueue.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    Fila limpa! Todos os pacientes com pagamento confirmado já foram atendidos ou chamados.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {upcomingQueue.map((item, idx) => (
                      <div 
                        key={item.id}
                        className="p-4 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {idx + 1}º
                          </div>

                          <div>
                            <h4 className="text-sm font-black text-slate-900">{item.paciente_nome}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                              <span>Chegada: <strong className="text-slate-800">{item.data_chegada}</strong></span>
                              <span>• Pagamento Caixa: <strong className="text-emerald-700 font-extrabold">{item.pagamento_confirmado_em}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 uppercase">
                            🟢 {item.status}
                          </span>

                          <button
                            onClick={handleChamarProximo}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer min-h-[38px]"
                          >
                            Chamar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* CARD 3: ATENDIDOS HOJE SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Atendidos Hoje</span>
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{finishedToday.length} Pacientes</p>
                  <p className="text-[11px] text-slate-500 mt-1">Consultas finalizadas com sucesso</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Tempo Médio de Consulta</span>
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">14.5 minutos</p>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">Dentro da meta estipulada</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Tempo Total de Atendimento</span>
                    <BarChart2 className="w-5 h-5 text-sky-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">2h 18min</p>
                  <p className="text-[11px] text-slate-500 mt-1">Tempo produtivo do médico no consultório</p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PAINEL DA RECEPÇÃO & ALERTA EM TELA CHEIA */}
          {activeTab === 'recepcao' && (
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* RULE 5: BLINKING ALERT BANNER FOR RECEPTION */}
              {calledAlert && (
                <div className="p-6 bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 text-white rounded-3xl shadow-2xl border-2 border-sky-300 animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-amber-300 animate-bounce" /> 🔔 ALERTA DE CHAMADA - RECEPÇÃO PISCANTE
                    </span>
                    <span className="text-xs font-bold text-sky-100">{calledAlert.timestamp}</span>
                  </div>

                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-sky-200 uppercase font-black tracking-widest">PACIENTE CHAMADO PELO MÉDICO:</p>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                      {calledAlert.patientName}
                    </h2>
                    <p className="text-base font-extrabold text-amber-300">
                      DIRIGIR-SE AO {calledAlert.consultorio.toUpperCase()} ({calledAlert.medicoNome})
                    </p>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setCalledAlert(null)}
                      className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer min-h-[44px]"
                    >
                      Confirmar Encaminhamento do Paciente
                    </button>
                  </div>
                </div>
              )}

              {/* RECEPTION QUEUE STATUS BOARD (AGUARDANDO, CHAMADO, EM ATENDIMENTO, FINALIZADO) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Painel de TV da Recepção &amp; Fila Geral
                    </h3>
                    <p className="text-xs text-slate-500">Exibição para orientação dos pacientes e atendentes do caixa</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">🟢 AGUARDANDO</span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">🟡 CHAMADO</span>
                    <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">🔵 EM ATENDIMENTO</span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">⚫ FINALIZADO</span>
                  </div>
                </div>

                {/* FULL QUEUE LISTING */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {queue.map((item, idx) => (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.status === 'CHAMADO'
                          ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/50 animate-pulse'
                          : item.status === 'EM_ATENDIMENTO'
                          ? 'bg-sky-50 border-sky-300'
                          : item.status === 'FINALIZADO'
                          ? 'bg-slate-50 opacity-60 border-slate-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}º
                          </span>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{item.paciente_nome}</h4>
                            <p className="text-[11px] text-slate-500">
                              Pagamento confirmado às: <strong className="text-slate-800">{item.pagamento_confirmado_em}</strong>
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
                          item.status === 'AGUARDANDO'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : item.status === 'CHAMADO'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : item.status === 'EM_ATENDIMENTO'
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: ANÁLISE IA DE EXAMES (OCT, CAMPO VISUAL, TONOMETRIA) */}
          {activeTab === 'exames' && (
            <div className="space-y-6 animate-in fade-in duration-200">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* SELECT PATIENT */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>1. Selecionar Paciente</span>
                  </label>
                  <select
                    value={selectedExamPatientId}
                    onChange={(e) => setSelectedExamPatientId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} • Status: {p.status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* EXAM TYPE SELECTION */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-600" />
                    <span>2. Tipo de Exame Ocular</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setExamType('oct'); setAnalysisResult(null); }}
                      className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer text-center ${
                        examType === 'oct' 
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-xs' 
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      OCT
                    </button>

                    <button
                      type="button"
                      onClick={() => { setExamType('campo_visual'); setAnalysisResult(null); }}
                      className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer text-center ${
                        examType === 'campo_visual' 
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-xs' 
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      Campo Visual
                    </button>

                    <button
                      type="button"
                      onClick={() => { setExamType('tonometria'); setAnalysisResult(null); }}
                      className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer text-center ${
                        examType === 'tonometria' 
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-xs' 
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      Tonometria
                    </button>
                  </div>
                </div>

              </div>

              {/* TRIGGER ANALYSIS */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {examType === 'oct' ? 'Tomografia OCT (Nervo Óptico / Macular)' : examType === 'campo_visual' ? 'Perimetria Humana 24-2' : 'Medição de PIO & Paquimetria Corneana'}
                  </h3>
                  <p className="text-xs text-slate-500">Carregue imagens do tomógrafo/perímetro para laudo inteligente de IA</p>
                </div>

                <button
                  type="button"
                  onClick={handleStartExamAnalysis}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Brain className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analisando Imagens com IA...' : 'Executar Análise de IA'}</span>
                </button>
              </div>

              {/* ANALYSIS RESULTS */}
              {analysisResult && (
                <div className="bg-white p-6 rounded-3xl border border-cyan-200 shadow-lg space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <span className="text-[10px] font-black bg-cyan-100 text-cyan-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Laudo Gerado por IA Íris Vision
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">{analysisResult.title}</h3>
                      <p className="text-xs text-slate-500">Paciente: <strong>{patients.find(p => p.id === selectedExamPatientId)?.name}</strong></p>
                    </div>

                    <div className="px-4 py-2 rounded-2xl border text-xs font-black bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Risco: {analysisResult.riskLevel}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {analysisResult.findings.metrics.map((m, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{m.label}</p>
                        <p className="text-sm font-black mt-0.5 text-slate-900">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200/80 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-black text-indigo-950 text-sm">
                      <Sparkles className="w-4 h-4 text-cyan-600" />
                      <span>Parecer Técnico da IA &amp; Hipótese Diagnóstica</span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed">{analysisResult.aiDiagnosis}</p>
                    <div className="pt-2 border-t border-indigo-200/60">
                      <strong className="text-indigo-900 font-extrabold">Recomendação:</strong>
                      <p className="text-slate-700 mt-0.5">{analysisResult.recommendation}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    {savedExamSuccess ? (
                      <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-black flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Laudo Anexado com Sucesso ao Prontuário do Paciente!</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSaveExamToDossier}
                        className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                      >
                        <FileUp className="w-4 h-4 text-cyan-400" />
                        <span>Anexar Laudo ao Prontuário do Paciente</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: BANCO DE DADOS & ESQUEMA DDL SQL (RULE 9 & 11) */}
          {activeTab === 'sql' && (
            <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl border border-slate-800 space-y-4 font-mono text-xs overflow-x-auto shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between text-amber-300 font-sans border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  <h3 className="font-black text-sm">Esquema SQL &amp; Consulta Principal (Regras 9, 10 e 11)</h3>
                </div>
                <span className="text-[10px] font-black bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                  SUPABASE / POSTGRESQL REALTIME
                </span>
              </div>

              <div>
                <p className="text-slate-400 font-sans mb-2 font-bold">1. Tabela de Fila de Atendimento:</p>
                <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-emerald-400 leading-relaxed">
{`CREATE TABLE fila_atendimento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    paciente_id UUID NOT NULL,
    medico_id UUID,

    data_chegada TIMESTAMP,
    pagamento_confirmado_em TIMESTAMP,

    status VARCHAR(30) DEFAULT 'AGUARDANDO',

    chamado_em TIMESTAMP,
    inicio_atendimento TIMESTAMP,
    fim_atendimento TIMESTAMP,

    observacao TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);`}
                </pre>
              </div>

              <div>
                <p className="text-slate-400 font-sans mb-2 font-bold">2. Consulta Principal da Fila Ordenada por Pagamento do Caixa:</p>
                <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-sky-300 leading-relaxed">
{`SELECT
    f.id,
    p.nome,
    f.pagamento_confirmado_em,
    f.status
FROM fila_atendimento f
JOIN pacientes p
ON p.id = f.paciente_id
WHERE f.status IN (
    'AGUARDANDO',
    'CHAMADO',
    'EM_ATENDIMENTO'
)
ORDER BY f.pagamento_confirmado_em ASC;`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 hidden sm:inline font-bold">
            Sistema de Fila Ocular Inteligente • Íris Clin Realtime Engine
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer min-h-[44px]"
          >
            Fechar Painel
          </button>
        </footer>

      </div>
    </div>
  );
}
