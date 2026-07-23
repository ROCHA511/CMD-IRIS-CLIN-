import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  FileText, 
  Eye, 
  Download, 
  Trash2, 
  User, 
  Calendar, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  Maximize2, 
  ShieldCheck, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter, 
  Tag, 
  Stethoscope, 
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  Zap,
  Check,
  Copy,
  Share2,
  FileSpreadsheet,
  ArrowLeft
} from 'lucide-react';
import { Patient, PatientDocument, PatientOpticalData } from '../types';

interface PatientDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onUpdatePatientDocuments: (patientId: string, documents: PatientDocument[]) => void;
  onUpdatePatientOpticalData?: (patientId: string, opticalData: PatientOpticalData) => void;
}

// High quality medical prescription & exam placeholder images
const DEFAULT_SAMPLE_DOCS: PatientDocument[] = [
  {
    id: 'doc-sample-1',
    type: 'receita',
    title: 'Receita Óptica de Óculos Multifocal',
    category: 'Receita Médica',
    date: '2026-07-20',
    doctorName: 'Dr. Augusto Faro',
    notes: 'Prescrição para uso contínuo de lentes multifocais com tratamento BlueControl e antirreflexo.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'doc-sample-2',
    type: 'exame',
    title: 'Retinografia & Fundoscopia Ocular',
    category: 'Exame Ocular',
    date: '2026-07-18',
    doctorName: 'Dr. Augusto Faro',
    notes: 'Mapeamento de retina sem alterações patológicas aparentes. Escavação de papila dentro dos limites normais.',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000'
  }
];

export default function PatientDossierModal({
  isOpen,
  onClose,
  patient,
  onUpdatePatientDocuments,
  onUpdatePatientOpticalData
}: PatientDossierModalProps) {
  const [activeTab, setActiveTab] = useState<'geral' | 'receitas_exames'>('receitas_exames');
  const [documents, setDocuments] = useState<PatientDocument[]>(() => {
    if (patient.documents && patient.documents.length > 0) {
      return patient.documents;
    }
    return DEFAULT_SAMPLE_DOCS;
  });

  // Camera & Capture State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // New Document Form
  const [docType, setDocType] = useState<'receita' | 'exame' | 'outro'>('receita');
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Receita Médica');
  const [docNotes, setDocNotes] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'todos' | 'receita' | 'exame'>('todos');
  const [searchDocTerm, setSearchDocTerm] = useState('');

  // AI OCR Extraction States
  const [isAnalyzingOcr, setIsAnalyzingOcr] = useState(false);
  const [extractedOpticalData, setExtractedOpticalData] = useState<PatientOpticalData | null>(null);
  const [shouldSyncOpticalData, setShouldSyncOpticalData] = useState(true);
  const [ocrSuccessNotice, setOcrSuccessNotice] = useState<string | null>(null);

  // Lightbox Zoom
  const [selectedImageModal, setSelectedImageModal] = useState<PatientDocument | null>(null);

  // Consolidated Dossier Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedTextNotice, setCopiedTextNotice] = useState(false);

  // Helper: Copy Consolidated Dossier Text to Clipboard
  const handleCopyTextDossier = () => {
    const latestPrescription = documents.find(d => d.type === 'receita');
    const allExams = documents.filter(d => d.type === 'exame');

    let text = `=================================================\n`;
    text += `ÍRISCLIN - DOSSIÊ CLÍNICO CONSOLIDADO\n`;
    text += `=================================================\n`;
    text += `Paciente: ${patient.name}\n`;
    text += `Idade: ${patient.age || '48'} anos | Telefone: ${patient.phone || '(73) 9 8104-7390'}\n`;
    text += `Médico Responsável: ${patient.doctorInCharge || 'Dr. Augusto Faro'}\n`;
    text += `Data de Emissão do Dossiê: ${new Date().toLocaleDateString('pt-BR')}\n\n`;

    text += `--- 1. ÚLTIMA RECEITA ÓPTICA / REFRAÇÃO ---\n`;
    if (patient.opticalData) {
      text += `OD (Olho Direito): Esf ${patient.opticalData.od.sph} | Cil ${patient.opticalData.od.cyl} | Eixo ${patient.opticalData.od.axis}° | Add ${patient.opticalData.od.add} | DNP ${patient.opticalData.od.pd}\n`;
      text += `OE (Olho Esquerdo): Esf ${patient.opticalData.oe.sph} | Cil ${patient.opticalData.oe.cyl} | Eixo ${patient.opticalData.oe.axis}° | Add ${patient.opticalData.oe.add} | DNP ${patient.opticalData.oe.pd}\n`;
    }
    if (latestPrescription) {
      text += `Prescrição Anexada: ${latestPrescription.title} (${latestPrescription.date})\n`;
      if (latestPrescription.notes) text += `Observações: ${latestPrescription.notes}\n`;
    }

    text += `\n--- 2. EXAMES OCULARES ANEXADOS (Total: ${allExams.length}) ---\n`;
    if (allExams.length === 0) {
      text += `Nenhum exame anexado até o momento.\n`;
    } else {
      allExams.forEach((ex, idx) => {
        text += `${idx + 1}. [${ex.date}] ${ex.title} (${ex.category})\n`;
        if (ex.doctorName) text += `   Médico: ${ex.doctorName}\n`;
        if (ex.notes) text += `   Parecer Técnico: ${ex.notes}\n`;
      });
    }

    text += `\n=================================================\n`;
    text += `Documento Gerado via Iris AI Copilot • Dr. Augusto Faro CRM/BA 81.047\n`;

    navigator.clipboard.writeText(text);
    setCopiedTextNotice(true);
    setTimeout(() => setCopiedTextNotice(false), 3000);
  };

  // Helper: Download Consolidated Dossier HTML File
  const handleDownloadHtmlDossier = () => {
    const latestPrescription = documents.find(d => d.type === 'receita');
    const allExams = documents.filter(d => d.type === 'exame');

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dossie_Clinico_${patient.name.replace(/\s+/g, '_')}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; background: #ffffff; line-height: 1.5; }
    .header { border-bottom: 3px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .header h1 { color: #0369a1; margin: 0; font-size: 22px; font-weight: 800; }
    .header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
    .patient-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; border-radius: 12px; margin-bottom: 24px; }
    .section-title { font-size: 15px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px; margin-bottom: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: center; font-size: 13px; }
    th { background: #e0f2fe; color: #0369a1; font-weight: 800; }
    .exam-grid { display: grid; grid-template-cols: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .exam-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; background: #f8fafc; }
    .exam-title { font-weight: 800; color: #0f172a; font-size: 14px; }
    .exam-meta { font-size: 12px; color: #0284c7; margin-bottom: 8px; font-weight: 600; }
    .exam-img { width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-top: 8px; border: 1px solid #cbd5e1; }
    .footer { margin-top: 48px; border-top: 2px solid #e2e8f0; pt: 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>ÍRISCLIN - CENTRO OFTALMOLÓGICO</h1>
      <p>Dossiê Médico Consolidado de Optometria & Oftalmologia</p>
    </div>
    <div style="text-align: right; font-size: 12px; color: #0369a1; font-weight: bold;">
      Data: ${new Date().toLocaleDateString('pt-BR')}
    </div>
  </div>

  <div class="patient-box">
    <strong style="font-size: 16px; color: #0369a1;">${patient.name}</strong><br>
    <strong>Idade:</strong> ${patient.age || '48'} anos &nbsp;|&nbsp; <strong>Telefone:</strong> ${patient.phone || '(73) 9 8104-7390'}<br>
    <strong>Médico Responsável:</strong> ${patient.doctorInCharge || 'Dr. Augusto Faro (CRM/BA 81.047)'} &nbsp;|&nbsp; <strong>Status:</strong> ${patient.status}
  </div>

  <div class="section-title">1. ÚLTIMA RECEITA ÓPTICA (REFRAÇÃO OCULAR)</div>
  ${patient.opticalData ? `
  <table>
    <thead>
      <tr>
        <th>Olho</th>
        <th>Esférico</th>
        <th>Cilíndrico</th>
        <th>Eixo</th>
        <th>Adição</th>
        <th>DNP / DP</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Olho Direito (OD)</strong></td>
        <td>${patient.opticalData.od.sph}</td>
        <td>${patient.opticalData.od.cyl}</td>
        <td>${patient.opticalData.od.axis}°</td>
        <td>${patient.opticalData.od.add}</td>
        <td>${patient.opticalData.od.pd}</td>
      </tr>
      <tr>
        <td><strong>Olho Esquerdo (OE)</strong></td>
        <td>${patient.opticalData.oe.sph}</td>
        <td>${patient.opticalData.oe.cyl}</td>
        <td>${patient.opticalData.oe.axis}°</td>
        <td>${patient.opticalData.oe.add}</td>
        <td>${patient.opticalData.oe.pd}</td>
      </tr>
    </tbody>
  </table>
  ` : '<p style="font-size: 13px; color: #64748b;">Nenhuma refração salva diretamente.</p>'}

  ${latestPrescription ? `
    <div class="exam-card" style="margin-bottom: 20px;">
      <div class="exam-title">${latestPrescription.title} (${latestPrescription.date})</div>
      <div class="exam-meta">Categoria: ${latestPrescription.category} | Médico: ${latestPrescription.doctorName || 'Dr. Augusto Faro'}</div>
      <p style="font-size: 12px; margin: 0;">${latestPrescription.notes || 'Sem observações adicionais.'}</p>
      ${latestPrescription.imageUrl ? `<img src="${latestPrescription.imageUrl}" class="exam-img" alt="Foto da Receita" />` : ''}
    </div>
  ` : ''}

  <div class="section-title">2. EXAMES OCULARES CONSOLIDADOS (${allExams.length})</div>
  ${allExams.length === 0 ? '<p style="font-size: 13px; color: #64748b;">Nenhum exame anexado.</p>' : `
  <div class="exam-grid">
    ${allExams.map(ex => `
      <div class="exam-card">
        <div class="exam-title">${ex.title}</div>
        <div class="exam-meta">${ex.category} • Data: ${ex.date}</div>
        <p style="font-size: 12px; color: #334155; margin: 0;">${ex.notes || 'Sem laudo registrado.'}</p>
        ${ex.imageUrl ? `<img src="${ex.imageUrl}" class="exam-img" alt="${ex.title}" />` : ''}
      </div>
    `).join('')}
  </div>
  `}

  <div class="footer">
    <p>Documento oficial extraído do Dossiê Clínico do Paciente • ÍrisClin Copilot</p>
    <p style="font-weight: bold; color: #0f172a;">Dr. Augusto Faro — CRM/BA 81.047</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dossie_Consolidado_${patient.name.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Camera Stop Handler
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Sync state when patient changes
  useEffect(() => {
    if (patient.documents && patient.documents.length > 0) {
      setDocuments(patient.documents);
    } else {
      setDocuments(DEFAULT_SAMPLE_DOCS);
    }
  }, [patient]);

  // Clean up media stream on unmount or tab change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  // OCR Vision analysis caller
  const analyzeImageWithIrisOcr = async (imageSrc: string) => {
    setIsAnalyzingOcr(true);
    setOcrSuccessNotice(null);
    try {
      const response = await fetch('/api/copilot/ocr-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageSrc,
          patientName: patient.name,
          docTypeHint: docType
        })
      });

      const data = await response.json();
      if (data.success && data.result) {
        const res = data.result;
        if (res.title) setDocTitle(res.title);
        if (res.category) setDocCategory(res.category);
        if (res.notes) setDocNotes(res.notes);
        if (res.opticalData) {
          setExtractedOpticalData(res.opticalData);
        }
        setOcrSuccessNotice('Dados colhidos com sucesso da foto pela Iris AI! ✨');
      }
    } catch (err) {
      console.error('OCR analysis failed:', err);
    } finally {
      setIsAnalyzingOcr(false);
    }
  };

  // Start Camera handler
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError('Não foi possível acessar a câmera do dispositivo. Verifique as permissões do navegador.');
      setIsCameraActive(false);
    }
  };

  // Capture frame from live video
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      // Auto-trigger OCR extraction on captured image
      analyzeImageWithIrisOcr(dataUrl);
    }
  };

  // Handle image file upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCapturedImage(dataUrl);
        // Auto-trigger OCR extraction on uploaded image
        analyzeImageWithIrisOcr(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add document to list
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedImage) {
      alert('Por favor, tire uma foto ou escolha um arquivo de imagem da receita/exame.');
      return;
    }

    const title = docTitle.trim() || (docType === 'receita' ? 'Receita Óptica' : 'Exame Ocular');
    const newDoc: PatientDocument = {
      id: `doc-${Date.now()}`,
      type: docType,
      title,
      category: docCategory,
      imageUrl: capturedImage,
      date: new Date().toISOString().split('T')[0],
      doctorName: patient.doctorInCharge || 'Dr. Augusto Faro',
      notes: docNotes.trim() || undefined
    };

    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    onUpdatePatientDocuments(patient.id, updatedDocs);

    // If checked and OCR extracted optical data, sync to patient's optical profile
    if (shouldSyncOpticalData && extractedOpticalData && onUpdatePatientOpticalData) {
      onUpdatePatientOpticalData(patient.id, extractedOpticalData);
    }

    // Reset Form
    setCapturedImage(null);
    setDocTitle('');
    setDocNotes('');
    setExtractedOpticalData(null);
    setOcrSuccessNotice(null);
    stopCamera();
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta foto/documento do Dossiê do paciente?')) {
      const updatedDocs = documents.filter(d => d.id !== id);
      setDocuments(updatedDocs);
      onUpdatePatientDocuments(patient.id, updatedDocs);
    }
  };

  // Filtered documents list
  const filteredDocs = documents.filter(doc => {
    const matchesCategory = filterCategory === 'todos' || doc.type === filterCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchDocTerm.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchDocTerm.toLowerCase()) ||
                          (doc.notes && doc.notes.toLowerCase().includes(searchDocTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-sky-100">
        
        {/* TOP DOSSIÊ HEADER */}
        <header className="px-6 py-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img 
                src={patient.avatar} 
                alt={patient.name} 
                className="w-12 h-12 rounded-full object-cover border-2 border-sky-400/60 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-[9px] text-white font-extrabold px-1.5 py-0.2 rounded-full border border-slate-900">
                Ativo
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>Dossiê Clínico de {patient.name}</span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold border border-sky-500/30">
                    Docier
                  </span>
                </h2>
              </div>
              
              {/* Contact bar */}
              <div className="flex items-center gap-4 text-xs text-sky-200/80 mt-0.5 font-medium">
                <span className="flex items-center gap-1 text-emerald-300 font-bold font-mono">
                  <Phone className="w-3.5 h-3.5" />
                  {patient.phone || '(73) 9 8104-7390'}
                </span>
                <span>•</span>
                <span>{patient.age ? `${patient.age} anos` : '48 anos'}</span>
                <span>•</span>
                <span className="text-sky-300 font-bold">{patient.doctorInCharge || 'Dr. Augusto Faro'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setShowExportModal(true)} 
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-400/40 shadow-md shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98]"
              title="Gerar e Exportar Dossiê Consolidado com Exames e Última Receita"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Exportar Dossiê</span>
            </button>
            <button 
              type="button"
              onClick={() => window.print()} 
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
              title="Imprimir Dossiê do Paciente"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* TAB NAVIGATION BAR */}
        <div className="flex items-center justify-between border-b border-sky-100 bg-sky-50/40 px-6 shrink-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab('receitas_exames')}
              className={`py-3 px-5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                activeTab === 'receitas_exames'
                  ? 'border-sky-600 text-sky-950 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-4 h-4 text-sky-600" />
              <span>Módulo de Receitas & Exames (Câmera)</span>
              <span className="bg-sky-100 text-sky-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('geral')}
              className={`py-3 px-5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                activeTab === 'geral'
                  ? 'border-sky-600 text-sky-950 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Resumo Completo do Dossiê</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'geral' ? 'receitas_exames' : 'geral')}
            className="px-3 py-1 bg-white border border-sky-200 hover:bg-sky-50 text-sky-900 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all my-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-700" />
            <span>Voltar para {activeTab === 'geral' ? 'Módulo Câmera' : 'Dossiê Geral'}</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {activeTab === 'receitas_exames' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
              
              {/* LEFT COLUMN: CAMERA / CAPTURE MODULE */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-sky-100/80 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-sky-50">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-sky-600" />
                    Captura de Receita / Exame
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                    Câmera Pronta
                  </span>
                </div>

                <form onSubmit={handleSaveDocument} className="space-y-3.5">
                  
                  {/* TYPE SELECTOR */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDocType('receita');
                        setDocCategory('Receita Médica');
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        docType === 'receita'
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Receita Médica
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDocType('exame');
                        setDocCategory('Exame Ocular');
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        docType === 'exame'
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      Exame Ocular
                    </button>
                  </div>

                  {/* WEBCAM VIEWFINDER / PREVIEW BOX */}
                  <div className="relative aspect-4/3 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner group">
                    {capturedImage ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={capturedImage} 
                          alt="Foto Capturada" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCapturedImage(null)}
                          className="absolute top-2 right-2 bg-slate-900/80 text-white p-1.5 rounded-full hover:bg-red-600 transition-all cursor-pointer"
                          title="Descartar Foto e Recapturar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <span className="absolute bottom-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Foto Selecionada ✓
                        </span>
                      </div>
                    ) : isCameraActive ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* CAMERA CAPTURE OVERLAY BUTTON */}
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-2">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer border-2 border-white transition-transform active:scale-95"
                          >
                            <Camera className="w-4 h-4" />
                            Capturar Foto Agora
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-slate-800/80 hover:bg-slate-900 text-white p-2 rounded-full cursor-pointer"
                            title="Fechar Câmera"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 text-slate-300 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-sky-400">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Tirar Foto da Receita ou Exame</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Ative a câmera ou selecione a imagem do arquivo</p>
                        </div>

                        {cameraError && (
                          <p className="text-[10px] text-amber-400 bg-amber-950/60 p-2 rounded-lg border border-amber-800/50">
                            {cameraError}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 justify-center mt-1">
                          <button
                            type="button"
                            onClick={startCamera}
                            className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            Abrir Câmera ao Vivo
                          </button>

                          <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer">
                            <Upload className="w-3.5 h-3.5 text-sky-400" />
                            Anexar Arquivo
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileUpload} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* IRIS AI OCR EXTRACTION STATUS CARD */}
                  {isAnalyzingOcr ? (
                    <div className="p-3 bg-gradient-to-r from-sky-500/10 via-sky-600/15 to-sky-500/10 rounded-2xl border border-sky-300/60 flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Sparkles className="w-4 h-4 animate-spin" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-sky-900 flex items-center gap-1.5">
                          Iris AI Visão Computacional
                        </h4>
                        <p className="text-[10px] text-sky-800 font-medium mt-0.5">
                          Analisando imagem da receita/exame e colhendo parâmetros de refração...
                        </p>
                      </div>
                    </div>
                  ) : capturedImage && (
                    <div className="p-3 bg-gradient-to-br from-sky-50 via-emerald-50/50 to-sky-50 rounded-2xl border border-sky-200/80 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-sky-900 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          Dados Colhidos da Foto (OCR Iris AI)
                        </span>
                        <button
                          type="button"
                          onClick={() => analyzeImageWithIrisOcr(capturedImage)}
                          className="text-[10px] bg-white hover:bg-sky-100 text-sky-700 px-2 py-0.5 rounded-lg border border-sky-200 font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          Reanalisar Foto
                        </button>
                      </div>

                      {ocrSuccessNotice && (
                        <p className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded-lg border border-emerald-200/80 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          {ocrSuccessNotice}
                        </p>
                      )}

                      {extractedOpticalData && (
                        <div className="space-y-1.5 pt-1">
                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/90 p-2 rounded-xl border border-sky-100 font-mono shadow-2xs">
                            <div className="border-r border-sky-100 pr-1">
                              <span className="font-extrabold text-sky-800 block text-[9.5px]">OD (Direito)</span>
                              <p className="text-slate-700 truncate">Esf: <strong className="text-sky-900">{extractedOpticalData.od?.sph || '0.00'}</strong></p>
                              <p className="text-slate-700 truncate">Cil: <strong className="text-sky-900">{extractedOpticalData.od?.cyl || '0.00'}</strong> | Eixo: <strong className="text-sky-900">{extractedOpticalData.od?.axis || '0'}°</strong></p>
                              {extractedOpticalData.od?.add && <p className="text-slate-700 truncate">Add: <strong className="text-emerald-700">{extractedOpticalData.od?.add}</strong></p>}
                            </div>
                            <div className="pl-1">
                              <span className="font-extrabold text-sky-800 block text-[9.5px]">OE (Esquerdo)</span>
                              <p className="text-slate-700 truncate">Esf: <strong className="text-sky-900">{extractedOpticalData.oe?.sph || '0.00'}</strong></p>
                              <p className="text-slate-700 truncate">Cil: <strong className="text-sky-900">{extractedOpticalData.oe?.cyl || '0.00'}</strong> | Eixo: <strong className="text-sky-900">{extractedOpticalData.oe?.axis || '0'}°</strong></p>
                              {extractedOpticalData.oe?.add && <p className="text-slate-700 truncate">Add: <strong className="text-emerald-700">{extractedOpticalData.oe?.add}</strong></p>}
                            </div>
                          </div>

                          <label className="flex items-center gap-2 text-[10.5px] font-bold text-slate-700 cursor-pointer pt-0.5">
                            <input 
                              type="checkbox"
                              checked={shouldSyncOpticalData}
                              onChange={(e) => setShouldSyncOpticalData(e.target.checked)}
                              className="rounded border-sky-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span>Anexar e atualizar prescrição de grau na ficha do paciente</span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FORM FIELDS */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                        Título do Documento
                      </label>
                      <input 
                        type="text"
                        placeholder={docType === 'receita' ? 'Ex: Receita Lentes Multifocais - Dr. Faro' : 'Ex: Exame de Topografia Ocular'}
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-medium text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                          Categoria
                        </label>
                        <select
                          value={docCategory}
                          onChange={(e) => setDocCategory(e.target.value)}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-700"
                        >
                          <option value="Receita Médica">Receita Médica</option>
                          <option value="Exame Ocular">Exame Ocular</option>
                          <option value="Topografia Ocular">Topografia de Córnea</option>
                          <option value="Retinografia">Retinografia Simples</option>
                          <option value="OCT Macular">OCT Ocular</option>
                          <option value="Laudo Médico">Laudo Médico</option>
                          <option value="Outros">Outros Documentos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                          Médico Solicitante
                        </label>
                        <input 
                          type="text"
                          readOnly
                          value={patient.doctorInCharge || 'Dr. Augusto Faro'}
                          className="w-full text-xs p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                        Observações / Diagnóstico da Foto
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Lentes prescritas com filtro BlueControl e presbiopia de +1.50..."
                        value={docNotes}
                        onChange={(e) => setDocNotes(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!capturedImage}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Salvar no Dossiê do Paciente
                    </button>
                  </div>

                </form>
              </div>

              {/* RIGHT COLUMN: DOCUMENT GALLERY */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-sky-100/80 shadow-xs flex flex-col overflow-hidden">
                
                {/* GALLERY FILTERS & SEARCH */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-sky-50 shrink-0">
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input 
                      type="text"
                      placeholder="Buscar por nome ou exame..."
                      value={searchDocTerm}
                      onChange={(e) => setSearchDocTerm(e.target.value)}
                      className="w-full sm:w-48 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setFilterCategory('todos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterCategory === 'todos'
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Todos ({documents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterCategory('receita')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterCategory === 'receita'
                          ? 'bg-sky-600 text-white'
                          : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                      }`}
                    >
                      Receitas
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterCategory('exame')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterCategory === 'exame'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      Exames
                    </button>
                  </div>
                </div>

                {/* GALLERY GRID */}
                <div className="flex-1 overflow-y-auto pt-4 space-y-3">
                  {filteredDocs.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      Nenhum documento ou receita anexada para este filtro.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredDocs.map((doc) => (
                        <div 
                          key={doc.id}
                          className="group border border-slate-200/80 hover:border-sky-300 rounded-2xl overflow-hidden bg-white shadow-2xs hover:shadow-md transition-all flex flex-col"
                        >
                          {/* Image Box */}
                          <div 
                            className="relative aspect-16/10 bg-slate-100 overflow-hidden cursor-pointer"
                            onClick={() => setSelectedImageModal(doc)}
                          >
                            <img 
                              src={doc.imageUrl} 
                              alt={doc.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            
                            {/* Overlay Badge */}
                            <span className={`absolute top-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs ${
                              doc.type === 'receita'
                                ? 'bg-sky-600 text-white'
                                : 'bg-indigo-600 text-white'
                            }`}>
                              {doc.category}
                            </span>

                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="p-2 bg-white rounded-full text-slate-800 shadow-lg">
                                <Maximize2 className="w-4 h-4" />
                              </span>
                            </div>
                          </div>

                          {/* Info Footer */}
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{doc.title}</h4>
                              {doc.notes && (
                                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{doc.notes}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                              <span className="flex items-center gap-1 font-semibold text-slate-600">
                                <Calendar className="w-3 h-3 text-sky-500" />
                                {doc.date.split('-').reverse().join('/')}
                              </span>

                              <div className="flex items-center gap-1">
                                <a
                                  href={doc.imageUrl}
                                  download={`dossie_${patient.name}_${doc.id}.jpg`}
                                  className="p-1 hover:bg-slate-100 text-slate-500 rounded transition-all"
                                  title="Baixar imagem"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-all cursor-pointer"
                                  title="Excluir do Dossiê"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : (
            /* TAB 2: OVERALL DOSSIER FULL CLINICAL REPORT */
            <div className="max-w-4xl mx-auto space-y-5">
              
              {/* BANNER DE EXPORTAÇÃO DO DOSSIÊ */}
              <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-800 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 border border-emerald-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold">Documento Consolidado do Dossiê</h3>
                    <p className="text-[11px] text-emerald-100/90 font-medium">
                      Gere o documento consolidado contendo a última receita e todos os exames do paciente.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Gerar Dossiê Exportável</span>
                </button>
              </div>

              {/* DOSSIER CARD 1: INFORMACÕES DO PACIENTE */}
              <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-sky-50">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-600" />
                    Identificação e Dados Gerais do Paciente
                  </h3>
                  <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg">
                    ID #{patient.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Nome Completo:</span>
                    <span className="font-bold text-slate-800 text-sm">{patient.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">WhatsApp / Telefone:</span>
                    <span className="font-bold text-emerald-600 font-mono text-sm">{patient.phone || '(73) 98104-7390'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">E-mail:</span>
                    <span className="font-semibold text-slate-700">{patient.email || 'paciente@irisclin.com.br'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">CPF / Documento:</span>
                    <span className="font-semibold font-mono text-slate-700">{patient.cpf || '000.000.000-00'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Idade:</span>
                    <span className="font-bold text-slate-800">{patient.age || 48} anos</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Profissão:</span>
                    <span className="font-semibold text-slate-700">{patient.profession || 'Autônomo'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Cidade / Estado:</span>
                    <span className="font-semibold text-slate-700">{patient.city || 'Itabuna - BA'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Endereço Residencial:</span>
                    <span className="font-semibold text-slate-700">{patient.address || 'Centro, Itabuna - BA'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Médico Responsável:</span>
                    <span className="font-extrabold text-sky-900">{patient.doctorInCharge || 'Dr. Augusto Faro'}</span>
                  </div>
                </div>
              </div>

              {/* DOSSIER CARD 2: PARÂMETROS E GRAU ÓPTICO */}
              <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-2xs space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-sky-50">
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  Prescrição Óptica Atual (OD / OE)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* OD */}
                  <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-100">
                    <span className="text-xs font-extrabold text-sky-900 block mb-2">Olho Direito (OD)</span>
                    <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs">
                      <div><span className="text-[9px] text-slate-400 block font-sans">ESF</span><b className="text-slate-800">{patient.opticalData.od.sph}</b></div>
                      <div><span className="text-[9px] text-slate-400 block font-sans">CIL</span><b className="text-slate-800">{patient.opticalData.od.cyl}</b></div>
                      <div><span className="text-[9px] text-slate-400 block font-sans">EIXO</span><b className="text-slate-800">{patient.opticalData.od.axis}°</b></div>
                      <div><span className="text-[9px] text-slate-400 block font-sans">ADIÇÃO</span><b className="text-slate-800">{patient.opticalData.od.add}</b></div>
                      <div><span className="text-[9px] text-slate-400 block font-sans">DNP</span><b className="text-slate-800">{patient.opticalData.od.pd}</b></div>
                    </div>
                  </div>

                  {/* OE */}
                  <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <span className="text-xs font-extrabold text-indigo-900 block mb-2">Olho Esquerdo (OE)</span>
                    <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs">
                      <div><span className="text-[9px] text-slate-400 block font-sans">ESF</span><b className="text-slate-800">{patient.opticalData.oe.sph}</b></div>
                      <div><span className="text-[9px] text-slate-400 block font-sans">CIL</span><b className="text-slate-800">{patient.opticalData.oe.cyl}</b></div>
                      <div><span className="text-[9px] text-slate-400 block font-sans">EIXO</span><b className="text-slate-800">{patient.opticalData.oe.axis}°</b></div>
                      <div><span className="text-[9px] text-slate-400 block font-sans">ADIÇÃO</span><b className="text-slate-800">{patient.opticalData.oe.add}</b></div>
                      <div><span className="text-[9px] text-slate-400 block font-sans">DNP</span><b className="text-slate-800">{patient.opticalData.oe.pd}</b></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOSSIER CARD 3: HISTÓRICO CLINICO E PATOLOGIAS */}
              <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-2xs space-y-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-sky-50">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  Histórico Clínico e Alergias
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Óculos Anteriores:</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{patient.previousGlasses || 'Nenhum'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Doenças Oculares Registradas:</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{patient.eyeDiseases || 'Nenhuma patologia registrada'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Cirurgias Oculares:</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{patient.surgeries || 'Nenhuma'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Alergias Medicamentosas:</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{patient.allergies || 'Nenhuma alergia relatada'}</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* FULLSCREEN LIGHTBOX FOR PRESCRIPTION / EXAM ZOOM */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
            <header className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <div>
                <h3 className="text-sm font-extrabold">{selectedImageModal.title}</h3>
                <p className="text-[11px] text-slate-400">{selectedImageModal.category} • {selectedImageModal.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={selectedImageModal.imageUrl} 
                  download 
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Baixar
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImageModal(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
              <img 
                src={selectedImageModal.imageUrl} 
                alt={selectedImageModal.title} 
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>

            {selectedImageModal.notes && (
              <footer className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-300">
                <b className="text-sky-400 block mb-0.5">Observação Técnica:</b>
                {selectedImageModal.notes}
              </footer>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONSOLIDADO DE EXPORTAÇÃO DO DOSSIÊ */}
      {showExportModal && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            
            {/* TOOLBAR SUPERIOR */}
            <header className="px-6 py-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-2">
                    <span>Exportar Dossiê Consolidado</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                      Oficial
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300 font-medium">
                    {patient.name} • Exames e Última Receita
                  </p>
                </div>
              </div>

              {/* BOTOES DE AÇÃO */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTextDossier}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  title="Copiar resumo textual para a área de transferência"
                >
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Copiar Texto</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadHtmlDossier}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  title="Baixar arquivo HTML com relatório formatado"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Baixar HTML</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40 border border-emerald-400/30"
                  title="Imprimir relatório ou salvar como PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-100" />
                  <span>Imprimir / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* NOTIFICAÇÃO DE TEXTO COPIADO */}
            {copiedTextNotice && (
              <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 text-center animate-fade-in flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Resumo do Dossiê copiado para a área de transferência com sucesso!</span>
              </div>
            )}

            {/* CONTEÚDO DO DOCUMENTO CONSOLIDADO (PRINTABLE AREA) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100/70" id="consolidated-patient-dossier">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-6 text-slate-800 max-w-3xl mx-auto">
                
                {/* 1. CABEÇALHO OFICIAL DA CLÍNICA */}
                <div className="border-b-2 border-sky-600 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 to-sky-800 text-white flex items-center justify-center shadow-md font-extrabold text-xl shrink-0">
                      Í
                    </div>
                    <div>
                      <h1 className="text-lg font-black text-sky-900 tracking-tight uppercase">
                        ÍrisClin • Centro Oftalmológico
                      </h1>
                      <p className="text-xs text-slate-500 font-medium">
                        Dossiê Clínico Consolidado de Optometria & Refração Ocular
                      </p>
                      <p className="text-[11px] text-sky-700 font-semibold mt-0.5">
                        Dr. Augusto Faro — CRM/BA 81.047
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs text-slate-500 font-mono space-y-0.5 bg-sky-50/60 p-2.5 rounded-xl border border-sky-100/80">
                    <div><span className="text-slate-400 font-sans text-[10px] uppercase block font-bold">Data de Emissão:</span> <b>{new Date().toLocaleDateString('pt-BR')}</b></div>
                    <div><span className="text-slate-400 font-sans text-[10px] uppercase block font-bold">Prontuário ID:</span> <b>#{patient.id}</b></div>
                  </div>
                </div>

                {/* 2. DADOS DO PACIENTE */}
                <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-sky-50 p-4 rounded-2xl border border-sky-100/90 shadow-2xs">
                  <h2 className="text-xs font-black uppercase tracking-wider text-sky-900 mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    Identificação do Paciente
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Nome:</span>
                      <strong className="text-slate-900 text-sm block">{patient.name}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Telefone / Whats:</span>
                      <strong className="text-emerald-700 font-mono block">{patient.phone || '(73) 9 8104-7390'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Idade:</span>
                      <strong className="text-slate-800 block">{patient.age || 48} anos</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Status Clínico:</span>
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10.5px]">
                        {patient.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. ÚLTIMA RECEITA ÓPTICA / REFRAÇÃO OCULAR */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-sky-600" />
                      1. Última Prescrição de Grau Óptico (Refração Ocular)
                    </h2>
                    <span className="text-[10px] font-extrabold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-mono">
                      OD & OE
                    </span>
                  </div>

                  {patient.opticalData && (
                    <div className="overflow-x-auto rounded-xl border border-sky-200/80 shadow-3xs">
                      <table className="w-full text-xs text-center border-collapse bg-white">
                        <thead>
                          <tr className="bg-sky-100/80 text-sky-950 font-black">
                            <th className="p-2 border-b border-sky-200 text-left pl-3">Olho</th>
                            <th className="p-2 border-b border-sky-200">Esférico (ESF)</th>
                            <th className="p-2 border-b border-sky-200">Cilíndrico (CIL)</th>
                            <th className="p-2 border-b border-sky-200">Eixo</th>
                            <th className="p-2 border-b border-sky-200">Adição (ADD)</th>
                            <th className="p-2 border-b border-sky-200">DNP / DP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          <tr>
                            <td className="p-2 text-left pl-3 font-sans font-bold text-sky-900 bg-sky-50/50">Olho Direito (OD)</td>
                            <td className="p-2 font-bold text-slate-800">{patient.opticalData.od.sph}</td>
                            <td className="p-2 font-bold text-slate-800">{patient.opticalData.od.cyl}</td>
                            <td className="p-2 font-bold text-slate-800">{patient.opticalData.od.axis}°</td>
                            <td className="p-2 font-extrabold text-emerald-700">{patient.opticalData.od.add}</td>
                            <td className="p-2 text-slate-700">{patient.opticalData.od.pd}</td>
                          </tr>
                          <tr>
                            <td className="p-2 text-left pl-3 font-sans font-bold text-indigo-900 bg-indigo-50/50">Olho Esquerdo (OE)</td>
                            <td className="p-2 font-bold text-slate-800">{patient.opticalData.oe.sph}</td>
                            <td className="p-2 font-bold text-slate-800">{patient.opticalData.oe.cyl}</td>
                            <td className="p-2 font-bold text-slate-800">{patient.opticalData.oe.axis}°</td>
                            <td className="p-2 font-extrabold text-emerald-700">{patient.opticalData.oe.add}</td>
                            <td className="p-2 text-slate-700">{patient.opticalData.oe.pd}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* LATEST PRESCRIPTION PHOTO & NOTES (IF AVAILABLE) */}
                  {documents.filter(d => d.type === 'receita').length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center">
                      {documents.find(d => d.type === 'receita')?.imageUrl && (
                        <img 
                          src={documents.find(d => d.type === 'receita')?.imageUrl} 
                          alt="Foto da Receita" 
                          className="w-24 h-20 object-cover rounded-lg border border-slate-300 shrink-0 shadow-2xs"
                        />
                      )}
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-slate-900">
                          {documents.find(d => d.type === 'receita')?.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Data: {documents.find(d => d.type === 'receita')?.date} • Médico: {documents.find(d => d.type === 'receita')?.doctorName || 'Dr. Augusto Faro'}
                        </p>
                        <p className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 italic">
                          "{documents.find(d => d.type === 'receita')?.notes || 'Lentes recomendadas com filtro azul e tratamento antirreflexo.'}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. HISTÓRICO DE EXAMES OCULARES CONSOLIDADOS */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-sky-600" />
                      2. Histórico Consolidado de Exames Oculares
                    </h2>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono">
                      Total: {documents.filter(d => d.type === 'exame').length} exames
                    </span>
                  </div>

                  {documents.filter(d => d.type === 'exame').length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                      Nenhum exame cadastrado no dossiê até o momento.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {documents.filter(d => d.type === 'exame').map((exame, idx) => (
                        <div key={exame.id || idx} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-mono">
                                {exame.category}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 font-mono">
                                {exame.date}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                              {exame.title}
                            </h4>

                            {exame.notes && (
                              <p className="text-[10.5px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 leading-relaxed">
                                {exame.notes}
                              </p>
                            )}
                          </div>

                          {exame.imageUrl && (
                            <img 
                              src={exame.imageUrl} 
                              alt={exame.title} 
                              className="w-full h-28 object-cover rounded-xl border border-slate-200 mt-1 shadow-3xs"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. ANAMNESE E HISTÓRICO CLÍNICO RESUMIDO */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <h3 className="text-[11px] font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    Histórico Clínico e Antecedentes Oculares
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                    <div><b>Óculos Anteriores:</b> {patient.previousGlasses || 'Uso descontínuo de multifocal'}</div>
                    <div><b>Patologias:</b> {patient.eyeDiseases || 'Sem alterações patológicas graves'}</div>
                    <div><b>Cirurgias Oculares:</b> {patient.surgeries || 'Nenhuma'}</div>
                    <div><b>Alergias:</b> {patient.allergies || 'Sem alergias relatadas'}</div>
                  </div>
                </div>

                {/* 6. ASSINATURA E CARIMBO DIGITAL */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 text-[10.5px] font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Documento com Validação Digital via Íris AI Copilot</span>
                  </div>

                  <div className="text-center">
                    <div className="w-48 border-b-2 border-slate-800 mx-auto mb-1"></div>
                    <p className="text-xs font-black text-slate-900">Dr. Augusto Faro</p>
                    <p className="text-[10px] text-slate-500 font-medium">Médico Oftalmologista • CRM/BA 81.047</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
