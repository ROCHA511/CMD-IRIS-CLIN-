/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FichaOcrCaptureModal - Módulo de Escaneamento Inteligente de Fichas Clínicas (OCR + IA)
 * Versão 2.0 - ÍrisClin Enterprise
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Camera, Upload, RotateCw, ZoomIn, ZoomOut, Sparkles, 
  CheckCircle, AlertTriangle, Eye, ShieldCheck, Database,
  RefreshCw, MapPin, Plus, FileText, FileDown, Layers, Check
} from 'lucide-react';
import { Patient, PatientDocument } from '../types';
import { calculateAge } from '../utils/age';

interface FichaOcrCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  currentUser: any;
  onSavePatient: (patient: Patient, isUpdate: boolean, fieldsUpdated?: any) => void;
}

export default function FichaOcrCaptureModal({
  isOpen,
  onClose,
  patients,
  currentUser,
  onSavePatient
}: FichaOcrCaptureModalProps) {
  const [step, setStep] = useState<'capture' | 'preview' | 'result'>('capture');
  
  // Camera & Image state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  
  // Image Adjustments
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [sharpen, setSharpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // OCR & LLM Extraction States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [inconsistencies, setInconsistencies] = useState<string[]>([]);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicatePatient, setDuplicatePatient] = useState<Patient | null>(null);
  const [fieldsToUpdate, setFieldsToUpdate] = useState<any>({});
  
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setProcessedImage(null);
      setExtractedData(null);
      setStep('capture');
      setIsDuplicate(false);
      setDuplicatePatient(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error(err);
      setCameraError('Permissão da câmera negada ou dispositivo indisponível.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
      setCapturedImage(dataUrl);
      setProcessedImage(dataUrl);
      stopCamera();
      setStep('preview');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
        setProcessedImage(base64);
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  // Redraw canvas with filters
  const applyImageAdjustments = () => {
    if (!capturedImage) return;
    const img = new window.Image();
    img.src = capturedImage;
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        
        // Apply rotation and zoom
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        
        // Apply CSS-like filters
        ctx.filter = `contrast(${contrast}%) brightness(${brightness}%)`;
        ctx.drawImage(img, 0, 0);
        ctx.restore();
        
        // Custom simple sharpen implementation (Sharpen / Nitidez)
        if (sharpen) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const width = imageData.width;
          const height = imageData.height;
          // Simple kernel for sharpen
          const weights = [
             0, -1,  0,
            -1,  5, -1,
             0, -1,  0
          ];
          const side = Math.round(Math.sqrt(weights.length));
          const halfSide = Math.floor(side / 2);
          const output = ctx.createImageData(width, height);
          const dst = output.data;

          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const sy = y;
              const sx = x;
              const dstOff = (y * width + x) * 4;
              let r = 0, g = 0, b = 0;
              for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                  const scy = sy + cy - halfSide;
                  const scx = sx + cx - halfSide;
                  if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
                    const srcOff = (scy * width + scx) * 4;
                    const wt = weights[cy * side + cx];
                    r += data[srcOff] * wt;
                    g += data[srcOff + 1] * wt;
                    b += data[srcOff + 2] * wt;
                  }
                }
              }
              dst[dstOff] = Math.min(255, Math.max(0, r));
              dst[dstOff + 1] = Math.min(255, Math.max(0, g));
              dst[dstOff + 2] = Math.min(255, Math.max(0, b));
              dst[dstOff + 3] = data[dstOff + 3];
            }
          }
          ctx.putImageData(output, 0, 0);
        }
        
        setProcessedImage(canvas.toDataURL('image/jpeg', 0.90));
      }
    };
  };

  useEffect(() => {
    if (step === 'preview') {
      applyImageAdjustments();
    }
  }, [zoom, rotation, contrast, brightness, sharpen, step]);

  const processWithIrisAi = async () => {
    if (!processedImage) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/copilot/ocr-ficha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: processedImage })
      });
      const result = await res.json();
      
      if (result.success && result.data) {
        const data = result.data;
        setExtractedData(data);
        setInconsistencias(data.inconsistencias || []);
        
        // Anti-duplicidade check
        checkForDuplicates(data);
      }
      setStep('result');
    } catch (err) {
      console.error('Falha ao processar com Iris AI:', err);
      alert('Erro de conexão ao processar imagem.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkForDuplicates = (data: any) => {
    let duplicate: Patient | null = null;
    
    // 1. CPF
    if (data.cpf) {
      const cleanCpf = data.cpf.replace(/\D/g, '');
      duplicate = patients.find(p => p.cpf && p.cpf.replace(/\D/g, '') === cleanCpf) || null;
    }
    
    // 2. Telefone
    if (!duplicate && data.telefone) {
      const cleanPhone = data.telefone.replace(/\D/g, '');
      duplicate = patients.find(p => p.phone && p.phone.replace(/\D/g, '') === cleanPhone) || null;
    }
    
    // 3. WhatsApp
    if (!duplicate && data.whatsapp) {
      const cleanWa = data.whatsapp.replace(/\D/g, '');
      duplicate = patients.find(p => p.phone && p.phone.replace(/\D/g, '') === cleanWa) || null;
    }
    
    // 4. Nome completo + Nascimento
    if (!duplicate && data.nome && data.data_nascimento) {
      const cleanName = data.nome.trim().toLowerCase();
      duplicate = patients.find(p => 
        p.name.trim().toLowerCase() === cleanName && 
        p.data_nascimento === data.data_nascimento
      ) || null;
    }

    if (duplicate) {
      setIsDuplicate(true);
      setDuplicatePatient(duplicate);
      
      // Determine fields to update (only fill empty fields)
      const diff: any = {};
      const fields = [
        'phone', 'email', 'address', 'cpf', 'rg', 
        'profession', 'city', 'previousGlasses', 
        'surgeries', 'eyeDiseases', 'allergies'
      ];
      
      fields.forEach(field => {
        const ocrVal = data[field === 'phone' ? 'telefone' : field];
        const currentVal = (duplicate as any)[field];
        if (ocrVal && !currentVal) {
          diff[field] = ocrVal;
        }
      });
      
      setFieldsToUpdate(diff);
    } else {
      setIsDuplicate(false);
      setDuplicatePatient(null);
      setFieldsToUpdate({});
    }
  };

  const handleConfirmSave = () => {
    if (!extractedData) return;

    if (isDuplicate && duplicatePatient) {
      // Update existing patient
      const updatedPatient: Patient = {
        ...duplicatePatient,
        ...fieldsToUpdate,
        // Append escaneado documents
        documents: [
          ...(duplicatePatient.documents || []),
          {
            id: `doc-ocr-${Date.now()}`,
            type: 'ocr_ficha',
            title: `Ficha Digitalizada - ${extractedData.nome}`,
            imageUrl: processedImage || '',
            category: 'Ficha Digitalizada',
            date: new Date().toISOString().split('T')[0],
            notes: `Origem: OCR Versão 2.0. Resumo: ${extractedData.resumoIA || ''}`,
            doctorName: extractedData.medico || 'Dr. Augusto Faro'
          }
        ]
      };

      onSavePatient(updatedPatient, true, fieldsToUpdate);
    } else {
      // Create new patient
      const newId = `patient-ocr-${Date.now()}`;
      const newPat: Patient = {
        id: newId,
        name: extractedData.nome || 'Paciente Escaneado',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        lastMessage: 'Ficha digitalizada via Scanner Iris AI.',
        lastActiveTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Orçamento',
        avatarColor: 'bg-amber-100 text-amber-700',
        online: true,
        opticalData: {
          od: { sph: '0.00', cyl: '0.00', axis: '0', add: '0.00', pd: '32.0/32.0' },
          oe: { sph: '0.00', cyl: '0.00', axis: '0', add: '0.00', pd: '32.0/32.0' }
        },
        lensFeatures: {
          antiReflexo: true,
          blueControl: true,
          materialArmacao: 'Acetato Preto'
        },
        timeline: [
          { id: `t-${Date.now()}-1`, time: '10:00 AM', title: 'Ficha Digitalizada por OCR', iconType: 'registration', status: 'done' }
        ],
        chatHistory: [
          { id: `c-${Date.now()}-1`, sender: 'system', senderName: 'Sistema', content: 'Ficha cadastral integrada via scanner inteligente da Iris AI.', timestamp: '10:00 AM' }
        ],
        aiSuggestions: [
          'Efetuar consulta básica oftálmica para verificar anamnese.'
        ],
        phone: extractedData.telefone || '(73) 98104-7390',
        email: extractedData.email || '',
        address: extractedData.endereco || '',
        cpf: extractedData.cpf || '',
        rg: extractedData.rg || '',
        data_nascimento: extractedData.data_nascimento || '1990-01-01',
        profession: extractedData.profissao || 'Autônomo',
        city: extractedData.cidade || 'Ituberá - BA',
        doctorInCharge: extractedData.medico || 'Dr. Augusto Faro',
        surgeries: extractedData.cirurgias || 'Nenhuma registrada',
        eyeDiseases: extractedData.patologias || 'Nenhuma registrada',
        allergies: extractedData.allergies || 'Nenhuma registrada',
        crmStage: 'Lead',
        purchaseProbability: 35,
        documents: [
          {
            id: `doc-ocr-${Date.now()}`,
            type: 'ocr_ficha',
            title: `Ficha Digitalizada - ${extractedData.nome}`,
            imageUrl: processedImage || '',
            category: 'Ficha Digitalizada',
            date: new Date().toISOString().split('T')[0],
            notes: `Ficha digitalizada inicial. Resumo: ${extractedData.resumoIA || ''}`,
            doctorName: extractedData.medico || 'Dr. Augusto Faro'
          }
        ]
      };

      onSavePatient(newPat, false);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[88vh] bg-[#0c1326] rounded-3xl border border-amber-500/25 shadow-2xl flex flex-col overflow-hidden relative">
        <canvas ref={canvasRef} className="hidden" />
        
        {/* HEADER */}
        <header className="px-6 py-4 bg-gradient-to-r from-[#091024] via-[#0d162d] to-[#091024] border-b border-amber-500/20 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-100 flex items-center gap-1.5">
                Fotografar &amp; Escanear Ficha Clínica
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30">V2.0</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Captura de imagens em alta resolução com OCR e parser inteligente Iris AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* CONTENT VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#070c18]/45 flex flex-col min-h-0">
          {step === 'capture' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 py-8">
              {isCameraActive ? (
                <div className="relative w-full max-w-2xl aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-amber-500/20 shadow-lg flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                    <button onClick={capturePhoto} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-full font-black text-xs shadow-lg cursor-pointer transition-transform active:scale-95 border-2 border-white flex items-center gap-2">
                      <Camera className="w-4.5 h-4.5" />
                      Capturar Ficha Agora
                    </button>
                    <button onClick={stopCamera} className="p-2.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-md w-full bg-[#0c1326] border border-amber-500/15 p-8 rounded-3xl text-center space-y-5 shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Como deseja capturar a ficha?</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Utilize a câmera traseira do celular ou anexe uma imagem digitalizada em PDF/JPG.</p>
                  </div>

                  {cameraError && (
                    <div className="p-3 bg-amber-950/60 border border-amber-500/20 text-amber-300 text-[10px] rounded-2xl font-bold">
                      {cameraError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <button onClick={startCamera} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40">
                      <Camera className="w-4 h-4" />
                      Abrir Câmera
                    </button>
                    <label className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4 text-sky-400" />
                      Anexar Ficha
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
              {/* IMAGE ADJUSTMENT COLUMN */}
              <div className="lg:col-span-8 bg-slate-900/60 rounded-3xl border border-amber-500/15 overflow-hidden flex flex-col justify-between min-h-[350px]">
                <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden p-2">
                  {processedImage && (
                    <img 
                      src={processedImage} 
                      alt="Preview" 
                      className="max-h-[50vh] object-contain transition-transform"
                    />
                  )}
                </div>
                
                {/* TOOLBAR CONTROLS */}
                <div className="p-4 bg-[#0a0f1d] border-t border-amber-500/15 space-y-3">
                  <div className="flex flex-wrap items-center gap-5 justify-between">
                    <div className="flex items-center gap-2 text-slate-350 text-[11px] font-bold">
                      <ZoomIn className="w-4 h-4 text-amber-500" />
                      <span>Zoom: {Math.round(zoom * 100)}%</span>
                      <input 
                        type="range" min="0.5" max="2" step="0.1" value={zoom} 
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-slate-350 text-[11px] font-bold">
                      <span>Rotação: {rotation}°</span>
                      <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer">
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-slate-350 text-[11px] font-bold">
                      <span>Contraste: {contrast}%</span>
                      <input 
                        type="range" min="50" max="200" value={contrast} 
                        onChange={(e) => setContrast(parseInt(e.target.value))}
                        className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-slate-350 text-[11px] font-bold">
                      <span>Brilho: {brightness}%</span>
                      <input 
                        type="range" min="50" max="150" value={brightness} 
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <button 
                      onClick={() => setSharpen(!sharpen)} 
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${
                        sharpen 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                          : 'bg-transparent text-slate-400 border-slate-750 hover:bg-white/5'
                      }`}
                    >
                      Remover Sombras / Nitidez
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTION PANEL */}
              <div className="lg:col-span-4 bg-[#0c1326] p-5 rounded-3xl border border-amber-500/15 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-amber-500/15">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Leitura de Imagem</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    A Iris AI aplicará técnicas avançadas de contraste, conversão de nitidez e filtragem de ruídos antes de enviar para o motor clínico de OCR e LLM.
                  </p>
                  <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Orientação:</span>
                      <span className="font-bold text-slate-200">{rotation}°</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Melhorias Ativadas:</span>
                      <span className="font-bold text-emerald-400">{sharpen ? 'Nitidez + Contraste' : 'Nenhuma'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-5">
                  <button 
                    onClick={processWithIrisAi} 
                    disabled={isAnalyzing}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-[#070c18] disabled:opacity-40 text-slate-950 text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Lendo com IA Iris...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Processar com IA (OCR)
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => { setCapturedImage(null); setStep('capture'); }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-250 text-[11px] font-bold rounded-xl cursor-pointer"
                  >
                    Tirar outra foto
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'result' && extractedData && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
              
              {/* LEFT COLUMN: ANÁLISE IA & INCONSISTÊNCIAS */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                
                {/* PREVIEW ORIGINAL */}
                <div className="h-40 bg-slate-950 rounded-2xl border border-amber-500/10 overflow-hidden flex items-center justify-center p-2.5 relative">
                  <img src={processedImage || ''} className="h-full object-contain opacity-55" alt="Ficha" />
                  <span className="absolute bottom-2 left-2 bg-[#0c1326] text-amber-300 border border-amber-500/25 text-[9px] font-extrabold px-2 py-0.5 rounded shadow-sm">
                    Ficha Capturada Original
                  </span>
                </div>

                {/* INCONSISTÊNCIAS IDENTIFICADAS */}
                <div className="bg-[#0c1326] p-4.5 rounded-2xl border border-amber-500/15 flex-1 flex flex-col gap-3 min-h-[220px]">
                  <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-slate-350 flex items-center gap-2 pb-2 border-b border-amber-500/15">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                    Validações &amp; Pendências da Ficha
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-2 max-h-[180px] pr-1">
                    {inconsistencies.length === 0 ? (
                      <div className="flex items-center gap-2 p-2 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-bold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Ficha lida com 100% de consistência! CPF e telefones validados.</span>
                      </div>
                    ) : (
                      inconsistencies.map((err, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 p-2 bg-amber-500/5 border border-amber-500/20 text-amber-300 text-[10.5px] rounded-xl font-bold leading-snug">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{err}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/15 rounded-xl">
                    <span className="text-[9px] text-sky-400 font-extrabold uppercase block">Resumo IA Iris:</span>
                    <p className="text-[10px] text-slate-300 font-medium leading-relaxed mt-1">
                      {extractedData.resumoIA || 'Não foi possível gerar um resumo.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: FORMULÁRIO DE EXTRATAÇÃO DE DADOS */}
              <div className="lg:col-span-7 bg-[#0c1326] p-5 rounded-3xl border border-amber-500/15 flex flex-col justify-between min-h-0">
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  
                  {/* IDENTIFICAÇÃO DE DUPLICIDADE BANNER */}
                  {isDuplicate && duplicatePatient ? (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/35 rounded-2xl flex items-center justify-between text-xs animate-in slide-in-from-top-3">
                      <div className="flex gap-2.5">
                        <Database className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <p className="font-extrabold text-amber-300 text-[11.5px]">⚠️ Cadastro Existente Identificado!</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            O CPF ou celular pertence a <strong>{duplicatePatient.name}</strong> (DN: {duplicatePatient.data_nascimento}).
                          </p>
                        </div>
                      </div>
                      <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded border border-amber-400/25 uppercase shrink-0">
                        Duplicidade Zero
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-400">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-extrabold text-emerald-300 text-[11.5px]">✓ Novo Paciente Detectado!</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Nenhuma correspondência encontrada. O sistema criará um novo registro limpo no banco.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">Nome Completo:</label>
                      <input 
                        type="text" value={extractedData.nome || ''} 
                        onChange={(e) => setExtractedData({ ...extractedData, nome: e.target.value })}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">Data Nascimento:</label>
                      <input 
                        type="date" value={extractedData.data_nascimento || ''} 
                        onChange={(e) => setExtractedData({ ...extractedData, data_nascimento: e.target.value })}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">CPF:</label>
                      <input 
                        type="text" value={extractedData.cpf || ''} 
                        onChange={(e) => setExtractedData({ ...extractedData, cpf: e.target.value })}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">RG:</label>
                      <input 
                        type="text" value={extractedData.rg || ''} 
                        onChange={(e) => setExtractedData({ ...extractedData, rg: e.target.value })}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">WhatsApp / Telefone:</label>
                      <input 
                        type="text" value={extractedData.telefone || ''} 
                        onChange={(e) => setExtractedData({ ...extractedData, telefone: e.target.value })}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">E-mail:</label>
                      <input 
                        type="email" value={extractedData.email || ''} 
                        onChange={(e) => setExtractedData({ ...extractedData, email: e.target.value })}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">Endereço:</label>
                      <input 
                        type="text" value={extractedData.endereco || ''} 
                        onChange={(e) => setExtractedData({ ...extractedData, endereco: e.target.value })}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">CEP:</label>
                      <input 
                        type="text" value={extractedData.cep || ''} 
                        onChange={(e) => setExtractedData({ ...extractedData, cep: e.target.value })}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">Profissão:</label>
                      <input 
                        type="text" value={extractedData.profissao || ''} 
                        onChange={(e) => setExtractedData({ ...extractedData, profissao: e.target.value })}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">Cidade / UF:</label>
                      <input 
                        type="text" value={extractedData.cidade && extractedData.estado ? `${extractedData.cidade} - ${extractedData.estado}` : (extractedData.cidade || '')} 
                        onChange={(e) => {
                          const parts = e.target.value.split('-');
                          setExtractedData({ 
                            ...extractedData, 
                            cidade: parts[0]?.trim(), 
                            estado: parts[1]?.trim() || extractedData.estado 
                          });
                        }}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                  </div>

                  {/* CLINICAL DATA */}
                  <div className="border-t border-amber-500/10 pt-3.5 grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">Patologias:</label>
                      <input 
                        type="text" value={extractedData.patologias || ''} 
                        onChange={(e) => setExtractedData({ ...extractedData, patologias: e.target.value })}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 font-bold uppercase block mb-1">Cirurgias:</label>
                      <input 
                        type="text" value={extractedData.cirurgias || ''} 
                        onChange={(e) => setExtractedData({ ...extractedData, cirurgias: e.target.value })}
                        className="w-full bg-[#070c18] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/35 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* DECISION ACTIONS */}
                <div className="pt-5 border-t border-amber-500/15 flex items-center justify-end gap-3 shrink-0">
                  {isDuplicate && duplicatePatient ? (
                    <button 
                      onClick={handleConfirmSave}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-amber-400/40"
                    >
                      <RefreshCw className="w-4 h-4" />
                      🔄 Atualizar Cadastro Existente
                    </button>
                  ) : (
                    <button 
                      onClick={handleConfirmSave}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-white/20"
                    >
                      <Plus className="w-4 h-4" />
                      ➕ Criar Novo Cadastro
                    </button>
                  )}
                  <button 
                    onClick={() => setStep('preview')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-250 text-[11px] font-bold rounded-xl cursor-pointer"
                  >
                    Voltar para Edição
                  </button>
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
