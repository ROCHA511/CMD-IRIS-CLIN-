import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { Patient, PatientDocument } from '../types';

interface AiExamAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onAddExamToPatient?: (patientId: string, document: PatientDocument) => void;
}

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
  onAddExamToPatient
}: AiExamAnalysisModalProps) {
  const [examType, setExamType] = useState<ExamType>('oct');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ExamPreset | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const presets: Record<ExamType, ExamPreset> = {
    oct: {
      id: 'oct-1',
      type: 'oct',
      title: 'Tomografia de Coerência Óptica (OCT Nervo Óptico & Mácula)',
      patientName: patients.find(p => p.id === selectedPatientId)?.name || 'Paciente Selecionado',
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
      patientName: patients.find(p => p.id === selectedPatientId)?.name || 'Paciente Selecionado',
      previewUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      findings: {
        od: 'Índice VFI 94%. Perda Média (MD) -2.8 dB. Escotoma arciforme inicial no quadrante superior nasal. Fidedignidade do teste alta (Perda de Fixação < 5%).',
        oe: 'Índice VFI 99%. Perda Média (MD) -0.4 dB. Sem defeitos de campo visual significativos.',
        metrics: [
          { label: 'VFI (Visual Field Index) OD', value: '94%', status: 'alerta' },
          { label: 'VFI OE', value: '99%', status: 'normal' },
          { label: 'Perda Média (MD) OD', value: '-2.8 dB', status: 'alerta' },
          { label: 'PSD (Padrão Desvio) OD', value: '3.1 dB', status: 'alerta' }
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
      patientName: patients.find(p => p.id === selectedPatientId)?.name || 'Paciente Selecionado',
      previewUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      findings: {
        od: 'PIO Medida: 21 mmHg. CCT (Espessura Corneana Central): 510 µm (Córnea fina). PIO Corrigida estimada: 23 mmHg.',
        oe: 'PIO Medida: 15 mmHg. CCT: 515 µm. PIO Corrigida estimada: 16 mmHg.',
        metrics: [
          { label: 'PIO Medida OD', value: '21 mmHg', status: 'alerta' },
          { label: 'PIO Corrigida OD (CCT 510µm)', value: '23 mmHg (Elevada)', status: 'critico' },
          { label: 'PIO Medida OE', value: '15 mmHg', status: 'normal' },
          { label: 'PIO Corrigida OE (CCT 515µm)', value: '16 mmHg', status: 'normal' }
        ]
      },
      aiDiagnosis: 'Hipertensão Ocular no Olho Direito após correção paquimétrica. Olho Esquerdo com pressão intraocular normal.',
      riskLevel: 'Elevado (Risco de Glaucoma / Patologia)',
      recommendation: 'Indicação de hipotensor ocular tópico conforme avaliação do médico Oftalmologista. Reavaliar curva diurna de pressão.'
    }
  };

  const handleStartAiAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setAnalysisResult(presets[examType]);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleSaveToPatientDossier = () => {
    if (!analysisResult || !selectedPatientId || !onAddExamToPatient) return;

    const newDoc: PatientDocument = {
      id: `exam_ai_${Date.now()}`,
      type: 'exame',
      title: `Laudo IA: ${analysisResult.title}`,
      imageUrl: analysisResult.previewUrl,
      category: examType === 'oct' ? 'OCT Macular/Nervo' : examType === 'campo_visual' ? 'Campimetria' : 'Tonometria',
      date: new Date().toLocaleDateString('pt-BR'),
      notes: `Análise IA: ${analysisResult.aiDiagnosis} | Risco: ${analysisResult.riskLevel}`,
      doctorName: 'Íris AI & Dr. Oftalmologista Responsável'
    };

    onAddExamToPatient(selectedPatientId, newDoc);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const currentPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* HEADER */}
        <header className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
              <Eye className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Análise Inteligente de Exames Oculares por IA</h2>
                <span className="text-[10px] font-black bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded-full">
                  OCT • CAMPO VISUAL • TONOMETRIA
                </span>
              </div>
              <p className="text-xs text-slate-300">Leitura automatizada de exames complementares para suporte ao diagnóstico oftalmológico</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">

          {/* STEP 1: PATIENT & EXAM TYPE SELECTOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* SELECT PATIENT */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>1. Selecionar Paciente</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
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
                <span>2. Tipo de Exame a Analisar</span>
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
                  OCT (Tomografia)
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
                  Tonometria (PIO)
                </button>
              </div>
            </div>

          </div>

          {/* UPLOAD / SIMULATION TRIGGER BANNER */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black shrink-0">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {examType === 'oct' ? 'Tomografia OCT (Nervo Óptico / Macular)' : examType === 'campo_visual' ? 'Perimetria Humana 24-2' : 'Medição de PIO & Paquimetria Corneana'}
                  </h3>
                  <p className="text-xs text-slate-500">Envie o arquivo PDF/Imagem do tomógrafo ou use a simulação pré-carregada</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartAiAnalysis}
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Brain className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Analisando Imagens com IA...' : 'Executar Análise de IA'}</span>
              </button>
            </div>
          </div>

          {/* ANALYSIS RESULTS PANEL */}
          {analysisResult && (
            <div className="bg-white p-6 rounded-3xl border border-cyan-200 shadow-lg space-y-6 animate-in fade-in duration-300">
              
              {/* RESULT HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-black bg-cyan-100 text-cyan-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Laudo Gerado por IA Íris Vision
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{analysisResult.title}</h3>
                  <p className="text-xs text-slate-500">Paciente: <strong>{currentPatient?.name}</strong> • Data: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <div className={`px-4 py-2 rounded-2xl border text-xs font-black flex items-center gap-2 ${
                  analysisResult.riskLevel.includes('Elevado')
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : analysisResult.riskLevel.includes('Moderado')
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Grau de Risco: {analysisResult.riskLevel}</span>
                </div>
              </div>

              {/* METRICS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {analysisResult.findings.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{m.label}</p>
                    <p className={`text-sm font-black mt-0.5 ${
                      m.status === 'critico' ? 'text-rose-600' : m.status === 'alerta' ? 'text-amber-600' : 'text-slate-900'
                    }`}>
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* DETAILED FINDINGS */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <strong className="text-slate-900 font-extrabold block mb-1">Achados no Olho Direito (OD):</strong>
                  <p className="text-slate-700 leading-relaxed">{analysisResult.findings.od}</p>
                </div>
                <div>
                  <strong className="text-slate-900 font-extrabold block mb-1">Achados no Olho Esquerdo (OE):</strong>
                  <p className="text-slate-700 leading-relaxed">{analysisResult.findings.oe}</p>
                </div>
              </div>

              {/* AI DIAGNOSIS SUMMARY & RECOMMENDATIONS */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200/80 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-black text-indigo-950 text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <span>Parecer Técnico da IA &amp; Hipótese Diagnóstica</span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {analysisResult.aiDiagnosis}
                </p>
                <div className="pt-2 border-t border-indigo-200/60">
                  <strong className="text-indigo-900 font-extrabold">Recomendação Clínica:</strong>
                  <p className="text-slate-700 mt-0.5">{analysisResult.recommendation}</p>
                </div>
              </div>

              {/* SAVE TO PATIENT DOSSIER BUTTON */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                {savedSuccess ? (
                  <div className="w-full p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-black flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Laudo de Exame Anexado com Sucesso ao Prontuário de {currentPatient?.name}!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveToPatientDossier}
                    className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <FileUp className="w-4 h-4 text-cyan-400" />
                    <span>Anexar Laudo ao Prontuário de {currentPatient?.name}</span>
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 hidden sm:inline font-bold">As análises de IA devem sempre ser validadas pelo oftalmologista.</span>
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
