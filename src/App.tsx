/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Search, 
  ChevronRight, 
  Send, 
  Bell, 
  Settings, 
  Calendar, 
  Clock, 
  FileText, 
  SlidersHorizontal, 
  Eye, 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Grid, 
  Database, 
  LogOut, 
  User as UserIcon, 
  Trash2, 
  PlusCircle, 
  UserCheck, 
  Check, 
  RotateCcw,
  ArrowLeft,
  ChevronLeft,
  Sliders,
  CheckCircle,
  FileCheck,
  Glasses,
  Mic,
  MicOff,
  Image,
  Paperclip,
  Share2,
  Phone,
  DollarSign,
  Award,
  Users,
  AlertTriangle,
  Lightbulb,
  Volume2,
  VolumeX,
  MapPin,
  FileSpreadsheet,
  TrendingUp,
  MessageSquare,
  Camera,
  FolderOpen,
  Megaphone,
  Smartphone,
  ClipboardList,
  Wifi,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Patient, ChatMessage, TimelineEvent, OpticalMetrics, PatientOpticalData, PatientDocument, User, UserRole, AuditLog } from './types';
import { INITIAL_PATIENTS } from './data/patients';
import FluxoCaixa from './components/FluxoCaixa';
import PatientDossierModal from './components/PatientDossierModal';
import OutreachExamModal from './components/OutreachExamModal';
import WhatsAppMetaPreviewModal from './components/WhatsAppMetaPreviewModal';
import PwaInstallBanner from './components/PwaInstallBanner';
import IrisVoiceAssistantModal from './components/IrisVoiceAssistantModal';
import AgendaConfirmacoesModal from './components/AgendaConfirmacoesModal';
import AtendenteVoiceBar from './components/AtendenteVoiceBar';
import MobileDownloadModal from './components/MobileDownloadModal';
import PwaConfigHelper from './components/PwaConfigHelper';
import PatientListModal from './components/PatientListModal';
import WeeklyConfirmedAgendaModal from './components/WeeklyConfirmedAgendaModal';
import IrisVoiceSettingsModal from './components/IrisVoiceSettingsModal';
import OfflineSyncModal from './components/OfflineSyncModal';
import TeamPerformanceModal from './components/TeamPerformanceModal';
import AiExamAnalysisModal from './components/AiExamAnalysisModal';
import AuthModal, { PRESET_USERS } from './components/AuthModal';
import PatientPortalModal from './components/PatientPortalModal';
import { speakHumanVoice } from './utils/humanVoice';

// Custom interface for Dashboard metrics
interface ClinicDashboard {
  patientsToday: number;
  avgResponseTimeSec: number;
  conversionRate: number;
  revenueTodayBRL: number;
  npsScore: number;
  whatsappQueueLength: number;
  activeClinicalSlots: number;
  aiLearningsCount: number;
  errorsCaught: number;
}

export default function App() {
  // Clinical state
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('irisclin_patients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PATIENTS;
      }
    }
    return INITIAL_PATIENTS;
  });

  const [selectedId, setSelectedId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [chatInput, setChatInput] = useState('');
  
  // Custom interactive scheduler states
  const [selectedDay, setSelectedDay] = useState<number>(20); // July 20th
  const [selectedTime, setSelectedTime] = useState<string>('11:30 AM');
  
  // Clinical AI Co-pilot states
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  // Optical editing parameters & Tab management
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [activeTab, setActiveTab] = useState<'ficha' | 'parametros'>('ficha');
  const [mobileActiveTab, setMobileActiveTab] = useState<'patients' | 'chat' | 'ficha'>('patients');
  const [showDashboard, setShowDashboard] = useState(true);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [isWhatsAppMetaPreviewOpen, setIsWhatsAppMetaPreviewOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [isMobileDownloadOpen, setIsMobileDownloadOpen] = useState(false);
  const [isPwaHelperOpen, setIsPwaHelperOpen] = useState(false);
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);
  const [isWeeklyAgendaOpen, setIsWeeklyAgendaOpen] = useState(false);

  // Helper to update or insert single patient
  const handleUpdateSinglePatient = (updatedPatient: Patient) => {
    setPatients(prev => {
      const exists = prev.some(p => p.id === updatedPatient.id);
      if (exists) {
        return prev.map(p => p.id === updatedPatient.id ? updatedPatient : p);
      }
      return [updatedPatient, ...prev];
    });
  };

  // Bulk / Individual outreach messaging for Eye Exam invitations
  const handleSendBulkMessage = (
    targetPatientIds: string[], 
    messageContent: string, 
    channel: 'whatsapp' | 'chat'
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPatients(prev => prev.map(p => {
      if (targetPatientIds.includes(p.id)) {
        const personalizedText = messageContent.replace(/\{\{nome\}\}/g, p.name.split(' ')[0]);
        const newMsg: ChatMessage = {
          id: `outreach-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sender: 'copilot',
          senderName: 'Iris AI Outreach',
          content: personalizedText,
          timestamp: timeStr
        };

        const newTimelineEvent: TimelineEvent = {
          id: `tl-out-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          time: timeStr,
          title: `Convite de Exame de Vista enviado via ${channel === 'whatsapp' ? 'WhatsApp' : 'Chat Iris AI'}`,
          iconType: 'calendar',
          status: 'Enviado'
        };

        return {
          ...p,
          lastMessage: personalizedText,
          lastActiveTime: timeStr,
          chatHistory: [...p.chatHistory, newMsg],
          timeline: [newTimelineEvent, ...p.timeline]
        };
      }
      return p;
    }));
  };

  // Update documents for a patient (Dossiê)
  const handleUpdatePatientDocuments = (patientId: string, docs: PatientDocument[]) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, documents: docs };
      }
      return p;
    }));
  };

  // Update optical metrics from OCR photo harvest for a patient
  const handleUpdatePatientOpticalData = (patientId: string, newOptical: PatientOpticalData) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          opticalData: {
            od: { ...p.opticalData.od, ...newOptical.od },
            oe: { ...p.opticalData.oe, ...newOptical.oe }
          }
        };
      }
      return p;
    }));
  };

  // NEW FEATURE: Speech Recognition states (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // NEW FEATURE: Voice Text-to-Speech (TTS) voice setting & Iris Voice Options
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);

  // NEW FEATURES: Offline Sync, Team Performance, and AI Exam Analysis Modals
  const [isOfflineSyncOpen, setIsOfflineSyncOpen] = useState(false);
  const [isTeamPerformanceOpen, setIsTeamPerformanceOpen] = useState(false);
  const [isAiExamOpen, setIsAiExamOpen] = useState(false);

  // RBAC AUTHENTICATION & USER MANAGEMENT STATE
  const [currentUser, setCurrentUser] = useState<User | null>(PRESET_USERS[0]); // Default: Dioenne Rocha (ADMIN)
  const [allUsers, setAllUsers] = useState<User[]>(PRESET_USERS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPatientPortalOpen, setIsPatientPortalOpen] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'aud_1', usuario_nome: 'Dioenne Rocha', usuario_email: 'dioenne@irisclin.com.br', perfil: 'ADMIN', acao: 'Login no Sistema - Perfil ADMIN Identificado', horario: 'Hoje, 08:15', ip: '189.23.102.44', dispositivo: 'Chrome OS / Windows Desktop' },
    { id: 'aud_2', usuario_nome: 'Marly Lima Rocha', usuario_email: 'marly@irisclin.com.br', perfil: 'ADMIN', acao: 'Acesso ao Painel Financeiro', horario: 'Ontem, 17:40', ip: '189.23.102.48', dispositivo: 'MacBook Air / Safari' },
    { id: 'aud_3', usuario_nome: 'Dr. Augusto Faro', usuario_email: 'augusto@irisclin.com.br', perfil: 'MEDICO', acao: 'Acesso ao Painel Médico - Fila de Atendimento', horario: 'Hoje, 08:20', ip: '189.23.102.45', dispositivo: 'iPad Pro / Safari' },
    { id: 'aud_4', usuario_nome: 'Ainoã', usuario_email: 'ainoa@irisclin.com.br', perfil: 'RECEPCIONISTA', acao: 'Abertura de Caixa e Confirmação de Presença', horario: 'Hoje, 08:00', ip: '189.23.102.12', dispositivo: 'Recepção PC 01' }
  ]);

  const [globalLoading, setGlobalLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenFinance = () => {
    if (!currentUser) {
      showToast('Autenticação necessária para acessar a Área Financeira.', 'error');
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.perfil !== 'ADMIN' && currentUser.perfil !== 'RECEPCIONISTA') {
      showToast(`Acesso Negado: Perfil ${currentUser.perfil} não possui permissão para visualizar o Caixa.`, 'error');
      return;
    }
    setIsFinanceOpen(true);
  };

  const handleOpenTeamPerformance = () => {
    if (!currentUser) {
      showToast('Autenticação necessária para acessar a Performance da Equipe.', 'error');
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.perfil !== 'ADMIN') {
      showToast(`Acesso Negado: Perfil ${currentUser.perfil} não possui permissão para visualizar o Desempenho da Equipe.`, 'error');
      return;
    }
    setIsTeamPerformanceOpen(true);
  };

  const handleOpenOutreach = () => {
    if (!currentUser) {
      showToast('Autenticação necessária para disparar convites.', 'error');
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.perfil !== 'ADMIN' && currentUser.perfil !== 'RECEPCIONISTA') {
      showToast(`Acesso Negado: Perfil ${currentUser.perfil} não possui permissão para disparar mensagens em lote.`, 'error');
      return;
    }
    setIsOutreachModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      usuario_nome: user.nome,
      usuario_email: user.email,
      perfil: user.perfil,
      acao: `Autenticação Efetuada (IA Identificou: ${user.nome} → ${user.perfil})`,
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      ip: '189.23.102.' + Math.floor(Math.random() * 200 + 10),
      dispositivo: 'Desktop Browser'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (user.perfil === 'PACIENTE') {
      setIsPatientPortalOpen(true);
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      const newLog: AuditLog = {
        id: `aud_${Date.now()}`,
        usuario_nome: currentUser.nome,
        usuario_email: currentUser.email,
        perfil: currentUser.perfil,
        acao: 'Logout efetuado do sistema',
        horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        ip: '189.23.102.44',
        dispositivo: 'Desktop Browser'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  const handleAddNewUserByAdmin = (newUser: User) => {
    setAllUsers(prev => [newUser, ...prev]);
    if (currentUser) {
      const newLog: AuditLog = {
        id: `aud_${Date.now()}`,
        usuario_nome: currentUser.nome,
        usuario_email: currentUser.email,
        perfil: currentUser.perfil,
        acao: `Criou novo usuário: ${newUser.nome} (${newUser.perfil})`,
        horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        ip: '189.23.102.44',
        dispositivo: 'Desktop Browser'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  const handleAddExamToPatient = (patientId: string, document: PatientDocument) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const existingDocs = p.documents || [];
        return {
          ...p,
          documents: [document, ...existingDocs]
        };
      }
      return p;
    }));
  };

  // NEW FEATURE: Simulated Image / Document Upload States
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Static Dashboard metrics
  const [dashboardMetrics, setDashboardMetrics] = useState<ClinicDashboard>({
    patientsToday: 18,
    avgResponseTimeSec: 14,
    conversionRate: 82,
    revenueTodayBRL: 4320,
    npsScore: 94,
    whatsappQueueLength: 2,
    activeClinicalSlots: 4,
    aiLearningsCount: 157,
    errorsCaught: 0
  });

  // New patient modal state (with permanent memory fields)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientStatus, setNewPatientStatus] = useState<Patient['status']>('Orçamento');
  const [newPatientOD, setNewPatientOD] = useState<OpticalMetrics>({ sph: '-1.50', cyl: '-0.50', axis: '90', add: '0.00', pd: '32.0/32.0' });
  const [newPatientOE, setNewPatientOE] = useState<OpticalMetrics>({ sph: '-1.50', cyl: '-0.50', axis: '90', add: '0.00', pd: '32.0/32.0' });
  const [newPatientAntiReflexo, setNewPatientAntiReflexo] = useState(true);
  const [newPatientBlueControl, setNewPatientBlueControl] = useState(true);
  const [newPatientMaterial, setNewPatientMaterial] = useState('Acetato Preto');
  const [newPatientAge, setNewPatientAge] = useState<number>(35);
  const [newPatientPhone, setNewPatientPhone] = useState<string>('(73) 98104-7390');
  const [newPatientEmail, setNewPatientEmail] = useState<string>('');
  const [newPatientAddress, setNewPatientAddress] = useState<string>('');
  const [newPatientCpf, setNewPatientCpf] = useState<string>('');
  const [newPatientProfession, setNewPatientProfession] = useState<string>('Autônomo');
  const [newPatientCity, setNewPatientCity] = useState<string>('Itabuna - BA');
  const [newPatientPrevGlasses, setNewPatientPrevGlasses] = useState<string>('Nenhum');
  const [newPatientDiseases, setNewPatientDiseases] = useState<string>('Nenhuma');
  const [newPatientAllergies, setNewPatientAllergies] = useState<string>('Nenhuma alergia');
  const [newPatientDoctor, setNewPatientDoctor] = useState<string>('Dr. Augusto Faro');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist patients list
  useEffect(() => {
    localStorage.setItem('irisclin_patients', JSON.stringify(patients));
  }, [patients]);

  const selectedPatient = patients.find(p => p.id === selectedId) || patients[0];

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedPatient?.chatHistory, isChatting]);

  // Handle active clinical analysis via server-side Gemini AI
  const triggerAiAnalysis = async (force: boolean = false) => {
    if (!selectedPatient) return;
    
    // Prevent double triggers unless forced
    if (aiAnalysis && !force) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/copilot/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: selectedPatient.name,
          opticalData: selectedPatient.opticalData,
          lensFeatures: selectedPatient.lensFeatures,
          customPrompt: customPrompt
        })
      });
      const data = await response.json();
      if (data.success) {
        setAiAnalysis(data.analysis);
      }
    } catch (e) {
      console.error('Error analyzing clinical data:', e);
      setAiAnalysis(`### Copilot ÍrisClin ✨\n\nErro ao conectar com o serviço do AI Copilot. Por favor, tente novamente mais tarde.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto trigger AI analysis on switching patients
  useEffect(() => {
    setAiAnalysis('');
    setCustomPrompt('');
    setIsEditingMetrics(false);
  }, [selectedId]);

  // NEW FEATURE: Speech-to-Text via Web Speech API
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
        setChatInput(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Seu navegador não oferece suporte nativo para a Web Speech API. Tente no Google Chrome ou Edge!');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // NEW FEATURE: Text-to-Speech (TTS) Speak Audio with Ultra-Human Female Voice
  const speakText = (text: string) => {
    if (!isTtsEnabled) return;
    speakHumanVoice(text);
  };

  // Handle patient chat input
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const textToSend = chatInput.trim();
    setChatInput('');
    await appendUserMessageAndGenerateReply(textToSend);
  };

  // Helper to send messages and trigger AI responses
  const appendUserMessageAndGenerateReply = async (messageText: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'admin',
      senderName: 'Dr. Augusto Faro',
      content: messageText,
      timestamp
    };

    // Append message to active patient
    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatient.id) {
        return {
          ...p,
          lastMessage: messageText,
          lastActiveTime: timestamp,
          chatHistory: [...p.chatHistory, userMsg]
        };
      }
      return p;
    });

    setPatients(updatedPatients);
    setIsChatting(true);

    // Call interactive clinical chat assistant endpoint
    try {
      const activeHistory = [...selectedPatient.chatHistory, userMsg];
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: activeHistory,
          patientContext: {
            name: selectedPatient.name,
            age: selectedPatient.age,
            profession: selectedPatient.profession,
            city: selectedPatient.city,
            previousGlasses: selectedPatient.previousGlasses,
            surgeries: selectedPatient.surgeries,
            eyeDiseases: selectedPatient.eyeDiseases,
            allergies: selectedPatient.allergies,
            status: selectedPatient.status,
            lensFeatures: selectedPatient.lensFeatures,
            opticalData: selectedPatient.opticalData
          }
        })
      });
      const data = await response.json();
      
      const replyMsg: ChatMessage = {
        id: `m-reply-${Date.now()}`,
        sender: 'copilot',
        senderName: 'Iris AI',
        content: data.response || `Obrigado pelo seu retorno. Entrarei em contato em breve para confirmar o orçamento.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setPatients(prev => prev.map(p => {
        if (p.id === selectedPatient.id) {
          return {
            ...p,
            chatHistory: [...p.chatHistory, replyMsg]
          };
        }
        return p;
      }));

      // Speak response automatically if enabled
      speakText(replyMsg.content);

    } catch (err) {
      console.error('Error generating chat reply:', err);
    } finally {
      setIsChatting(false);
    }
  };

  // NEW FEATURE: Simulated Image & Document Analyzer
  const handleMockUpload = async (fileName: string) => {
    setShowUploadMenu(false);
    setUploadProgress(10);
    setUploadedFileName(fileName);

    // Simulated progress loader
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev !== null && prev >= 100) {
          clearInterval(interval);
          return null;
        }
        return prev !== null ? prev + 30 : null;
      });
    }, 250);

    // Trigger API extraction once loaded
    setTimeout(async () => {
      try {
        const res = await fetch('/api/copilot/image-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageName: fileName, patientId: selectedPatient.id })
        });
        const data = await res.json();
        
        if (data.success) {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          let alertMsg = '';
          if (fileName === 'receita_medica.jpg') {
            // Apply extracted values to active patient!
            setPatients(prev => prev.map(p => {
              if (p.id === selectedPatient.id) {
                return {
                  ...p,
                  opticalData: data.analysis.extracted,
                  timeline: [
                    { id: `t-ext-${Date.now()}`, time: timestamp, title: 'Receita Digitalizada via Iris AI', iconType: 'prescription', status: 'done' },
                    ...p.timeline
                  ]
                };
              }
              return p;
            }));
            alertMsg = `Receita médica analisada! Graus extraídos com sucesso por Visão Computacional. OD: Esf ${data.analysis.extracted.od.sph} | OE: Esf ${data.analysis.extracted.oe.sph}`;
          } else if (fileName === 'armação_escolhida.png') {
            setPatients(prev => prev.map(p => {
              if (p.id === selectedPatient.id) {
                return {
                  ...p,
                  lensFeatures: {
                    ...p.lensFeatures,
                    materialArmacao: data.analysis.extracted.frameMaterial
                  },
                  timeline: [
                    { id: `t-ext-${Date.now()}`, time: timestamp, title: 'Foto da Armação Registrada', iconType: 'completed', status: 'done' },
                    ...p.timeline
                  ]
                };
              }
              return p;
            }));
            alertMsg = `Foto da armação interpretada pela Iris AI: ${data.analysis.extracted.frameMaterial} cor ${data.analysis.extracted.frameColor}.`;
          } else {
            // PIX Confirm
            setPatients(prev => prev.map(p => {
              if (p.id === selectedPatient.id) {
                return {
                  ...p,
                  status: 'Em Laboratório',
                  timeline: [
                    { id: `t-ext-${Date.now()}`, time: timestamp, title: 'Comprovante PIX Validado', iconType: 'completed', status: 'done' },
                    ...p.timeline
                  ]
                };
              }
              return p;
            }));
            alertMsg = `Comprovante de pagamento validado: R$ 780,00 recebidos via PIX Itaú. Status alterado para Em Laboratório!`;
          }

          // Add a system log message in chat history
          const sysMsg: ChatMessage = {
            id: `sys-${Date.now()}`,
            sender: 'system',
            senderName: 'Sistema Iris AI',
            content: `📎 [Documento Analisado: ${fileName}] ${data.analysis.description}`,
            timestamp
          };

          setPatients(prev => prev.map(p => {
            if (p.id === selectedPatient.id) {
              return {
                ...p,
                chatHistory: [...p.chatHistory, sysMsg]
              };
            }
            return p;
          }));

          // Speak output
          speakText(alertMsg);

        }
      } catch (err) {
        console.error('Error in mock upload:', err);
      } finally {
        setUploadedFileName(null);
      }
    }, 1000);
  };

  // NEW FEATURE: Simulated Meta WhatsApp API Triggers
  const handleWhatsAppTrigger = async (action: 'send_pix' | 'send_location' | 'send_budget_pdf' | 'send_ready_alert' | 'send_nps_survey') => {
    try {
      const response = await fetch('/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          phone: '(11) 98765-4321',
          payload: {}
        })
      });
      const data = await response.json();
      if (data.success) {
        // Append official timeline log
        const newTimelineEvent: TimelineEvent = {
          id: `t-wa-${Date.now()}`,
          time: data.timestamp,
          title: data.systemMessage,
          iconType: 'calendar',
          status: 'done'
        };

        // Append WhatsApp icon log in chat
        const sysMsg: ChatMessage = {
          id: `wa-msg-${Date.now()}`,
          sender: 'system',
          senderName: 'Meta WhatsApp API',
          content: `🟢 API Oficial WhatsApp: Disparo automático "${action}" enviado com sucesso!`,
          timestamp: data.timestamp
        };

        // Insert response message from Iris AI explaining the sendoff!
        const replyMsg: ChatMessage = {
          id: `wa-reply-${Date.now()}`,
          sender: 'copilot',
          senderName: 'Iris AI',
          content: data.botReply,
          timestamp: data.timestamp
        };

        setPatients(prev => prev.map(p => {
          if (p.id === selectedPatient.id) {
            return {
              ...p,
              timeline: [newTimelineEvent, ...p.timeline],
              chatHistory: [...p.chatHistory, sysMsg, replyMsg]
            };
          }
          return p;
        }));

        // Adjust executive statistics dynamically to show active integration
        setDashboardMetrics(prev => ({
          ...prev,
          patientsToday: prev.patientsToday + 1,
          revenueTodayBRL: action === 'send_pix' ? prev.revenueTodayBRL + 780 : prev.revenueTodayBRL,
          aiLearningsCount: prev.aiLearningsCount + 3
        }));

        speakText(data.botReply);
      }
    } catch (e) {
      console.error('WhatsApp trigger error:', e);
    }
  };

  // Create new patient with memory layers
  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    const newId = `patient-${Date.now()}`;
    const newPat: Patient = {
      id: newId,
      name: newPatientName.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      lastMessage: 'Ficha inicial de saúde cadastrada no sistema.',
      lastActiveTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: newPatientStatus,
      avatarColor: 'bg-indigo-100 text-indigo-700',
      online: true,
      opticalData: {
        od: newPatientOD,
        oe: newPatientOE
      },
      lensFeatures: {
        antiReflexo: newPatientAntiReflexo,
        blueControl: newPatientBlueControl,
        materialArmacao: newPatientMaterial
      },
      timeline: [
        { id: `t-${Date.now()}-1`, time: '10:28 AM', title: 'Paciente Cadastrado', iconType: 'registration', status: 'done' }
      ],
      chatHistory: [
        { id: `c-${Date.now()}-1`, sender: 'system', senderName: 'Sistema', content: 'Ficha clínica do paciente inicializada no cérebro da Iris AI.', timestamp: '10:28 AM' }
      ],
      aiSuggestions: [
        'Realizar mapeamento de retina presencial por idade.',
        'Verificar sensibilidade ao contraste para óculos anteriores.'
      ],
      // Permanent Memory Layers & Contact
      phone: newPatientPhone.trim() || '(73) 98104-7390',
      email: newPatientEmail.trim() || 'paciente@irisclin.com.br',
      address: newPatientAddress.trim() || 'Centro, Itabuna - BA',
      cpf: newPatientCpf.trim() || '000.000.000-00',
      age: newPatientAge,
      profession: newPatientProfession,
      city: newPatientCity,
      previousGlasses: newPatientPrevGlasses,
      preferredPayment: 'PIX ou Cartão',
      birthday: 'Não registrado',
      dependents: [],
      doctorInCharge: newPatientDoctor,
      surgeries: 'Nenhuma registrada',
      eyeDiseases: newPatientDiseases,
      allergies: newPatientAllergies,
      crmStage: 'Lead',
      purchaseProbability: 40
    };

    setPatients(prev => [newPat, ...prev]);
    setSelectedId(newId);
    setShowAddModal(false);

    // Reset fields
    setNewPatientName('');
    setNewPatientPhone('(73) 98104-7390');
    setNewPatientEmail('');
    setNewPatientAddress('');
    setNewPatientCpf('');
    setNewPatientStatus('Orçamento');
  };

  // Update lens features dynamically
  const handleToggleLensFeature = (feature: 'antiReflexo' | 'blueControl') => {
    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatient.id) {
        return {
          ...p,
          lensFeatures: {
            ...p.lensFeatures,
            [feature]: !p.lensFeatures[feature]
          }
        };
      }
      return p;
    }));
  };

  // Update frame material
  const handleUpdateFrameMaterial = (material: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatient.id) {
        return {
          ...p,
          lensFeatures: {
            ...p.lensFeatures,
            materialArmacao: material
          }
        };
      }
      return p;
    }));
  };

  // Update SPH/CYL metrics
  const handleUpdateMetric = (eye: 'od' | 'oe', field: keyof OpticalMetrics, val: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatient.id) {
        return {
          ...p,
          opticalData: {
            ...p.opticalData,
            [eye]: {
              ...p.opticalData[eye],
              [field]: val
            }
          }
        };
      }
      return p;
    }));
  };

  // Update Patient Profile Field
  const handleUpdateProfileField = (field: keyof Patient, val: any) => {
    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatient.id) {
        return {
          ...p,
          [field]: val
        };
      }
      return p;
    }));
  };

  // Delete current patient
  const handleDeletePatient = (idToDelete: string) => {
    if (patients.length <= 1) return;
    const remaining = patients.filter(p => p.id !== idToDelete);
    setPatients(remaining);
    setSelectedId(remaining[0].id);
  };

  // Quick book scheduler
  const handleScheduleAppointment = () => {
    const eventTime = `${selectedTime}`;
    const newEvent: TimelineEvent = {
      id: `t-scheduled-${Date.now()}`,
      time: selectedTime,
      title: `Retorno Agendado - Dia ${selectedDay}/07 às ${selectedTime}`,
      iconType: 'calendar',
      status: 'pending'
    };

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatient.id) {
        return {
          ...p,
          timeline: [newEvent, ...p.timeline]
        };
      }
      return p;
    }));

    // Alert
    alert(`Agendado com sucesso para ${selectedPatient.name} no dia ${selectedDay}/07/2026 às ${selectedTime}! O WhatsApp do paciente receberá o lembrete automático.`);
  };

  // Render format helper for Markdown
  const renderAnalysisMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.trim().startsWith('###') || line.trim().startsWith('##')) {
        return <h3 key={idx} className="font-display font-semibold text-xs text-sky-900 mt-3 mb-1 first:mt-0 flex items-center gap-1"><Sparkles className="w-3 h-3 text-sky-500 shrink-0"/>{line.replace(/###|##/g, '').trim()}</h3>;
      }
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return <li key={idx} className="text-[11px] text-slate-700 leading-normal pl-2 my-0.5 ml-2 list-disc">{line.substring(2).trim()}</li>;
      }
      if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')) {
        return <p key={idx} className="text-[11px] text-slate-700 font-bold mt-1.5 mb-0.5">{line.trim()}</p>;
      }
      return <p key={idx} className="text-[11px] text-slate-600 leading-relaxed mb-1">{line.trim()}</p>;
    });
  };

  // Filter patients
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex items-center justify-center font-sans overflow-hidden antialiased p-0 sm:p-2 md:p-3 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Fundo com Gradiente Radial e Luzes Douradas/Azuis */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f1d3a] via-[#080d1a] to-[#03060f] pointer-events-none -z-10" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Painel Principal em Vidro Escuro com Borda Dourada Suave */}
      <div className="w-full max-w-[1460px] h-screen sm:h-[96vh] bg-[#0c1326]/90 backdrop-blur-2xl rounded-2xl border border-amber-500/20 shadow-[0_20px_70px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.06)] flex flex-col overflow-hidden relative">
        
        {/* TOP COMPREHENSIVE BRANDING & HEADER BAR */}
        <header className="h-[76px] px-5 sm:px-6 border-b border-amber-500/20 bg-gradient-to-r from-[#091024] via-[#0d162d] to-[#091024] flex items-center justify-between shrink-0 shadow-md">
          
          {/* Logo & Clinical Niche Subheading */}
          <div className="flex items-center gap-3">
            <div 
              className="h-12 px-3.5 py-1 bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-amber-500/20 rounded-xl border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center gap-2 cursor-pointer hover:scale-[1.02] transition-all"
              onClick={() => setIsMobileDownloadOpen(true)}
            >
              <img 
                src="/irisclin-og-image.jpg" 
                alt="ÍrisClin SISTEMA WEB" 
                className="h-9 w-9 rounded-full object-cover border border-amber-400/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]"
                referrerPolicy="no-referrer"
              />
              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-black px-1.5 py-0.5 rounded border border-amber-400/40 uppercase tracking-widest hidden sm:inline-block">
                WEB
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-white text-[18px] tracking-tight flex items-center gap-1.5">
                  ÍrisClin <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 font-extrabold">SISTEMA WEB</span>
                </span>
                <span className="text-[9.5px] bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  OFICIAL
                </span>
              </div>
              <p className="text-[9.5px] uppercase tracking-wider text-amber-200/70 font-semibold flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                Gestão Oftalmológica &amp; IA Meta WhatsApp
              </p>
            </div>
          </div>

          {/* Central quick toggles & active indicator */}
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-100/60 border border-slate-200/40 p-1.5 rounded-xl">
            <button
              onClick={() => setIsPatientListOpen(true)}
              className="px-3 py-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-[11px] font-extrabold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
              title="Abrir Bloquinho de Notas com Relação de Clientes (Busca por Nome ou CPF)"
            >
              <ClipboardList className="w-3.5 h-3.5 text-amber-200" />
              <span>Relação de Clientes</span>
              <span className="bg-amber-950/80 text-amber-100 font-mono text-[9px] px-1.5 py-0.2 rounded-full border border-amber-400/40">
                {patients.length} Pacientes
              </span>
            </button>

            <button
              onClick={() => setIsWeeklyAgendaOpen(true)}
              className="px-3 py-1 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-[11px] font-extrabold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
              title="Abrir Lista dos Pacientes Agendados para a Semana Confirmados (Reloginho)"
            >
              <Clock className="w-3.5 h-3.5 text-sky-200" />
              <span>Agenda Semanal</span>
              <span className="bg-sky-950/80 text-sky-100 font-mono text-[9px] px-1.5 py-0.2 rounded-full border border-sky-400/40">
                {patients.filter(p => p.appointmentStatus === 'Confirmado').length} Confirmados
              </span>
            </button>

            {/* Dedicated Microphone Button for Atendente Voice Interaction */}
            <AtendenteVoiceBar 
              patients={patients}
              onUpdatePatient={handleUpdateSinglePatient}
              onOpenAgenda={() => setIsAgendaOpen(true)}
              onOpenFinance={() => setIsFinanceOpen(true)}
              onTriggerOutreach={handleSendBulkMessage}
            />

            {/* Button to access RBAC Auth & User Management */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-sky-300 text-[11px] font-extrabold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-sky-400/30"
              title="Acessar Tela de Login, Troca de Perfil (ADMIN, MEDICO, RECEPCIONISTA, PACIENTE), Tabela de Usuários e Auditoria LGPD"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>🔐 Autenticação &amp; Perfis</span>
            </button>

            {currentUser?.perfil === 'PACIENTE' && (
              <button
                onClick={() => setIsPatientPortalOpen(true)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>👤 Meu Portal Paciente</span>
              </button>
            )}

            {/* Button to access link & download on mobile */}
            <button
              onClick={() => setIsMobileDownloadOpen(true)}
              className="px-3 py-1 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 hover:from-slate-800 hover:to-indigo-800 text-white text-[11px] font-extrabold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-[0.97] border border-indigo-500/30"
              title="Gerar Link de Acesso Mobile e QR Code para Baixar o App no Celular"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>📱 Baixar no Celular</span>
            </button>

            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="px-3 py-1 bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white text-[11px] font-extrabold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
              title="Abrir Assistente de Voz Operacional da Íris AI (Voz Feminina Elegante)"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-200 animate-pulse" />
              <span>Íris Voice &amp; Comandos</span>
            </button>

            <button 
              onClick={() => setShowDashboard(!showDashboard)}
              className={`text-[10px] px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                showDashboard ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              <span>{showDashboard ? 'Ocultar Indicadores' : 'Mostrar Indicadores'}</span>
            </button>

            <button 
              onClick={() => setIsTtsEnabled(!isTtsEnabled)}
              className="text-[10px] px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 text-slate-600 hover:bg-white cursor-pointer"
              title="Permite que a Iris AI fale as mensagens de texto em voz alta automaticamente"
            >
              {isTtsEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-500 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>Voz Feminina: {isTtsEnabled ? 'Ativa' : 'Muda'}</span>
            </button>
          </div>

          {/* User Profile & Clinic System Badge */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
            title="Clique para alternar perfil, gerenciar usuários ou fazer login"
          >
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <h4 className="text-[12.5px] font-black text-slate-800 leading-tight">
                  {currentUser ? currentUser.nome : 'Entrar na Conta'}
                </h4>
                {currentUser && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase border ${
                    currentUser.perfil === 'ADMIN' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                    currentUser.perfil === 'MEDICO' ? 'bg-cyan-100 text-cyan-900 border-cyan-300' :
                    currentUser.perfil === 'RECEPCIONISTA' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' :
                    'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {currentUser.perfil}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-bold">
                {currentUser ? `${currentUser.email} • Trocar Perfil` : 'Clique para Autenticar'}
              </p>
            </div>
            <div className="relative">
              <img 
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                alt={currentUser?.nome || "Usuário Íris"} 
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border-2 border-sky-400 object-cover shadow-xs ring-2 ring-sky-100 shrink-0"
              />
              <span className="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5" />
            </div>
          </button>
        </header>

        {/* MOBILE & PWA ORGANIZED QUICK ACTION BAR (lg:hidden) */}
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-2 overflow-x-auto shrink-0 flex items-center gap-2 shadow-inner">
          {/* BOTÃO OCULTAR / MOSTRAR INDICADORES PARA MOBILE ABAIXO DO DR. AUGUSTO */}
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className={`px-3 py-1.5 font-black text-[11px] rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer transition-all border ${
              showDashboard
                ? 'bg-slate-800 text-amber-300 border-amber-400/40 hover:bg-slate-700'
                : 'bg-sky-600 text-white border-sky-400 hover:bg-sky-500'
            }`}
            title="Alternar visibilidade do painel de indicadores"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            <span>{showDashboard ? '📊 Ocultar Indicadores' : '📊 Mostrar Indicadores'}</span>
          </button>
          <button
            onClick={() => setIsPatientListOpen(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5 text-amber-200" />
            <span>📋 Pacientes (Nome/CPF)</span>
          </button>

          <button
            onClick={() => setIsWeeklyAgendaOpen(true)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-sky-200" />
            <span>⏱️ Agenda Semanal</span>
          </button>

          <button
            onClick={() => setIsAgendaOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-200" />
            <span>📅 Confirmados Hoje</span>
          </button>

          <button
            onClick={handleOpenFinance}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-200" />
            <span>💰 Caixa</span>
          </button>

          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-200" />
            <span>🗣️ Íris Voice</span>
          </button>

          <button
            onClick={() => setIsMobileDownloadOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-[11px] border border-slate-700 rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>📱 PWA</span>
          </button>
        </div>

        {/* COMPACT REAL-TIME EXECUTIVE INDICATORS DASHBOARD */}
        <AnimatePresence>
          {showDashboard && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 overflow-hidden shrink-0"
            >
              <div className="max-w-[1380px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3">
                {/* Metric 1 */}
                <div className="bg-slate-800/40 border border-slate-700/30 p-2.5 rounded-xl text-center">
                  <p className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 text-sky-400" /> Atendimentos Hoje
                  </p>
                  <h3 className="text-lg font-extrabold text-white font-mono mt-0.5">{dashboardMetrics.patientsToday}</h3>
                </div>

                {/* Metric 2 */}
                <div className="bg-slate-800/40 border border-slate-700/30 p-2.5 rounded-xl text-center">
                  <p className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> Resposta Média
                  </p>
                  <h3 className="text-lg font-extrabold text-white font-mono mt-0.5">{dashboardMetrics.avgResponseTimeSec}s</h3>
                </div>

                {/* Metric 3 */}
                <div className="bg-slate-800/40 border border-slate-700/30 p-2.5 rounded-xl text-center">
                  <p className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" /> Conversão Óptica
                  </p>
                  <h3 className="text-lg font-extrabold text-white font-mono mt-0.5">{dashboardMetrics.conversionRate}%</h3>
                </div>

                {/* Metric 4 */}
                <button 
                  onClick={handleOpenFinance}
                  className="bg-slate-800/60 border border-emerald-500/30 hover:border-emerald-400 p-2.5 rounded-xl text-center cursor-pointer transition-all hover:bg-slate-800 flex flex-col items-center justify-center group"
                  title="Clique para abrir a Área Financeira completa"
                >
                  <p className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1 group-hover:text-emerald-400 transition-colors">
                    <DollarSign className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" /> Faturamento / Abrir Caixa
                  </p>
                  <h3 className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">R$ {dashboardMetrics.revenueTodayBRL}</h3>
                </button>

                {/* Metric 5 */}
                <div className="bg-slate-800/40 border border-slate-700/30 p-2.5 rounded-xl text-center">
                  <p className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Award className="w-3 h-3 text-yellow-400" /> NPS da Clínica
                  </p>
                  <h3 className="text-lg font-extrabold text-white font-mono mt-0.5">{dashboardMetrics.npsScore}/100</h3>
                </div>

                {/* Metric 6 */}
                <div className="bg-slate-800/40 border border-slate-700/30 p-2.5 rounded-xl text-center">
                  <p className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Phone className="w-3 h-3 text-sky-400 animate-pulse" /> Fila WhatsApp
                  </p>
                  <h3 className="text-lg font-extrabold text-white font-mono mt-0.5">{dashboardMetrics.whatsappQueueLength} na fila</h3>
                </div>

                {/* Metric 7 */}
                <div className="bg-slate-800/40 border border-slate-700/30 p-2.5 rounded-xl text-center">
                  <p className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-400" /> Vagas Clínicas
                  </p>
                  <h3 className="text-lg font-extrabold text-white font-mono mt-0.5">{dashboardMetrics.activeClinicalSlots} livres</h3>
                </div>

                {/* Metric 8: IA Aprendendo */}
                <div className="bg-slate-800/40 border border-slate-700/30 p-2.5 rounded-xl text-center col-span-1">
                  <p className="text-[9px] uppercase font-bold text-teal-400 flex items-center justify-center gap-1">
                    <Lightbulb className="w-3 h-3 text-teal-400" /> IA Aprendizados
                  </p>
                  <h3 className="text-lg font-extrabold text-teal-400 font-mono mt-0.5">{dashboardMetrics.aiLearningsCount} insights</h3>
                </div>

                {/* Metric 9: Erros / Feedback */}
                <div className="bg-slate-800/40 border border-slate-700/30 p-2.5 rounded-xl text-center col-span-1">
                  <p className="text-[9px] uppercase font-bold text-red-400 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-400" /> Erros de IA
                  </p>
                  <h3 className="text-lg font-extrabold text-red-400 font-mono mt-0.5">{dashboardMetrics.errorsCaught}</h3>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* WORKSPACE AREA: Sidebar Rail + 3 Panel Grid */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* SIDEBAR RAIL: Minimalist control column */}
          <aside className="w-[72px] border-r border-amber-500/20 bg-[#070c18] flex flex-col items-center py-5 justify-between shrink-0 shadow-lg">
            <div className="flex flex-col gap-3.5 w-full px-2">
              {/* Botão Bot Principal Dourado */}
              <button className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all mx-auto cursor-pointer hover:scale-105" title="IRIS AI Conversas">
                <Bot className="w-5 h-5 text-slate-950 font-bold" />
              </button>

              <button 
                onClick={() => setShowDashboard(!showDashboard)}
                className="w-11 h-11 rounded-2xl text-amber-300 bg-[#0c1326] hover:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center transition-all mx-auto cursor-pointer" 
                title="Estatísticas do CRM"
              >
                <Grid className="w-5 h-5" />
              </button>

              <button 
                onClick={handleOpenFinance}
                className="w-11 h-11 rounded-2xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center transition-all mx-auto cursor-pointer relative" 
                title="Área Financeira / Fluxo de Caixa"
              >
                <DollarSign className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              </button>

              <button 
                onClick={handleOpenOutreach}
                className="w-11 h-11 rounded-2xl text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 flex items-center justify-center transition-all mx-auto cursor-pointer relative" 
                title="Módulo de Disparos: Convites para Exame de Vista"
              >
                <Megaphone className="w-5 h-5 text-amber-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-[#070c18] animate-pulse" />
              </button>

              <button 
                onClick={() => setIsWhatsAppMetaPreviewOpen(true)}
                className="w-11 h-11 rounded-2xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center transition-all mx-auto cursor-pointer relative" 
                title="Preview de Campanha Meta WhatsApp API"
              >
                <Phone className="w-5 h-5 text-emerald-400" />
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>

              {/* BLOQUINHO DE NOTAS (Abaixo do telefone) - Lista de Todos os Pacientes com Busca por Nome ou CPF */}
              <button 
                onClick={() => setIsPatientListOpen(true)}
                className="w-11 h-11 rounded-2xl text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/40 flex items-center justify-center transition-all mx-auto cursor-pointer relative hover:scale-105" 
                title="Bloquinho de Notas • Relação de Clientes (Busca por Nome ou CPF)"
              >
                <ClipboardList className="w-5.5 h-5.5 text-amber-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-[#070c18] animate-pulse" />
              </button>

              <button 
                onClick={() => setIsAgendaOpen(true)}
                className="w-11 h-11 rounded-2xl text-slate-400 bg-[#0c1326] hover:text-amber-300 hover:bg-amber-500/20 border border-amber-500/10 flex items-center justify-center transition-all mx-auto cursor-pointer" 
                title="Agenda Geral & Senhas do Dia"
              >
                <Calendar className="w-5 h-5" />
              </button>

              {/* RELOGINHO (Lateral) - Pacientes Agendados para a Semana Confirmados */}
              <button 
                onClick={() => setIsWeeklyAgendaOpen(true)}
                className="w-11 h-11 rounded-2xl text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 flex items-center justify-center transition-all mx-auto cursor-pointer relative hover:scale-105" 
                title="Reloginho • Pacientes Agendados para a Semana (Confirmados)"
              >
                <Clock className="w-5 h-5 text-sky-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-sky-500 rounded-full" />
              </button>

              {/* DESEMPENHO DA EQUIPE & TAXA DE CONFIRMAÇÃO */}
              <button 
                onClick={handleOpenTeamPerformance}
                className="w-11 h-11 rounded-2xl text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center transition-all mx-auto cursor-pointer relative hover:scale-105" 
                title="Painel de Desempenho da Equipe e Taxa de Confirmação de Consultas"
              >
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#070c18]" />
              </button>

              {/* ANÁLISE IA DE EXAMES (OCT, CAMPO VISUAL, TONOMETRIA) */}
              <button 
                onClick={() => setIsAiExamOpen(true)}
                className="w-11 h-11 rounded-2xl text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-200/30 flex items-center justify-center transition-all mx-auto cursor-pointer relative hover:scale-105" 
                title="Análise Inteligente de Exames por IA (OCT, Campo Visual e Tonometria)"
              >
                <Eye className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full" />
              </button>

              {/* SINCRONIZAÇÃO OFFLINE INDEXEDDB PWA */}
              <button 
                onClick={() => setIsOfflineSyncOpen(true)}
                className="w-11 h-11 rounded-2xl text-emerald-400 bg-[#0c1326] hover:bg-emerald-500/20 border border-[#101f30] flex items-center justify-center transition-all mx-auto cursor-pointer relative hover:scale-105" 
                title="Modo Offline PWA Avançado com Sincronização Local (IndexedDB)"
              >
                <Wifi className="w-5 h-5 text-emerald-400" />
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>

              <button 
                onClick={() => setIsVoiceSettingsOpen(true)}
                className="w-11 h-11 rounded-2xl text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center transition-all mx-auto cursor-pointer relative hover:scale-105" 
                title="Opções de Voz da Iris (Animada, Acolhedora, Velocidade e Tom)"
              >
                <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-[#070c18]" />
              </button>
            </div>

            <button 
              onClick={() => {
                if (confirm('Deseja realmente reiniciar o banco local do CRM ÍrisClin?')) {
                  localStorage.removeItem('irisclin_patients');
                  window.location.reload();
                }
              }}
              className="w-11 h-11 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 flex items-center justify-center transition-all mx-auto cursor-pointer" 
              title="Reiniciar Banco do CRM"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </aside>

          {/* MAIN PANELS WRAPPER */}
          <main className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-0 overflow-hidden bg-transparent">

            {/* MOBILE ACTION SWITCHER TABS */}
            <div className="md:hidden flex bg-[#091024] border-b border-amber-500/20 p-2 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setMobileActiveTab('patients')}
                className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mobileActiveTab === 'patients'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/15'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1326]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Pacientes ({patients.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileActiveTab('chat')}
                className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mobileActiveTab === 'chat'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/15'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1326]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat &amp; IA</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileActiveTab('ficha')}
                className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mobileActiveTab === 'ficha'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/15'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1326]'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Ficha Clínica</span>
              </button>
            </div>

            {/* PANEL 1: LISTA DE PACIENTES (CRM Funnel) */}
            <section className={`md:col-span-3 border-r border-amber-500/10 flex-col bg-[#070c18]/50 h-full overflow-hidden shrink-0 ${mobileActiveTab === 'patients' ? 'flex flex-1' : 'hidden md:flex'}`}>
              <div className="p-4 border-b border-amber-500/10 shrink-0 bg-[#091022]/40">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-extrabold text-[12.5px] text-amber-200 tracking-wider uppercase flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    Mosaico de Pacientes
                  </h3>
                  
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-all flex items-center gap-1 text-[11px] font-black cursor-pointer border border-amber-500/30"
                    title="Adicionar Paciente"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {/* Funnel filters */}
                <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
                  {['Todos', 'Orçamento', 'Em Laboratório', 'Para Retirada', 'Sem Pendências'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`text-[9.5px] px-2 py-1 rounded-lg font-extrabold transition-all shrink-0 cursor-pointer ${
                        statusFilter === status 
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs shadow-amber-500/10' 
                          : 'bg-[#0c1326]/60 hover:bg-[#0c1326] text-slate-300 border border-amber-500/10'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Search Box */}
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome ou mensagem..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-8 py-2 bg-[#0c1326] border border-amber-500/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500/35 text-slate-200 placeholder-slate-500 font-semibold"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable list of patient cards */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {filteredPatients.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Nenhum paciente localizado</div>
                ) : (
                  filteredPatients.map((p) => {
                    const isActive = p.id === selectedId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedId(p.id);
                          setMobileActiveTab('chat');
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 relative overflow-hidden group ${
                          isActive 
                            ? 'bg-[#0c1326]/90 border-amber-500/35 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/20' 
                            : 'bg-[#0c1326]/20 border-transparent hover:bg-[#0c1326]/60 hover:border-amber-500/15'
                        }`}
                      >
                        {/* Status bar marker */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          p.status === 'Orçamento' ? 'bg-amber-400' :
                          p.status === 'Em Laboratório' ? 'bg-sky-400' :
                          p.status === 'Para Retirada' ? 'bg-emerald-500' : 'bg-slate-500'
                        }`} />

                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <img 
                            src={p.avatar} 
                            alt={p.name} 
                            className="w-9 h-9 rounded-full object-cover border border-amber-500/10"
                          />
                          {p.online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c1326]" />
                          )}
                        </div>

                        {/* Body summary */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`text-xs font-bold truncate ${isActive ? 'text-amber-200' : 'text-slate-200'}`}>
                              {p.name}
                            </h4>
                            <span className="text-[8px] text-slate-400 font-mono shrink-0 font-medium">
                              {p.lastActiveTime}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                            {p.lastMessage}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${
                              p.status === 'Orçamento' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' :
                              p.status === 'Em Laboratório' ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20' :
                              p.status === 'Para Retirada' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' :
                              'bg-[#070c18] text-zinc-400 border border-slate-800'
                            }`}>
                              {p.status}
                            </span>

                            {/* Delete Button */}
                            {patients.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Deseja remover ${p.name} do sistema?`)) {
                                    handleDeletePatient(p.id);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 cursor-pointer"
                                title="Remover"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* PANEL 2: ACTIVE CONVERSATIONS & WHATSAPP SIMULATION */}
            <section className={`md:col-span-5 border-r border-amber-500/10 flex-col bg-[#070c18]/30 h-full overflow-hidden shrink-0 ${mobileActiveTab === 'chat' ? 'flex flex-1' : 'hidden md:flex'}`}>
              
              {/* Chat header area with indicators */}
              <div className="px-5 py-3 border-b border-amber-500/10 bg-[#091022]/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-amber-200 text-[12px] uppercase font-extrabold tracking-wider font-display">Copiloto Clínico & WhatsApp</span>
                  <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Iris AI Ativa
                  </span>
                </div>
                
                {/* Voice toggle quick option */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-slate-400 font-bold">TTS:</span>
                  <input 
                    type="checkbox" 
                    checked={isTtsEnabled} 
                    onChange={(e) => setIsTtsEnabled(e.target.checked)} 
                    className="w-3 h-3 text-amber-500 bg-slate-900 border-amber-500/25 rounded cursor-pointer"
                    title="Reprodução de voz da Iris"
                  />
                </div>
              </div>

              {/* PATIENT CONTACT & DOSSIER (DOCIER) BAR */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-[#0c1326]/60 via-[#0a1020]/80 to-[#0c1326]/60 border-b border-amber-500/10 flex items-center justify-between shrink-0 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img 
                      src={selectedPatient.avatar} 
                      alt={selectedPatient.name} 
                      className="w-9 h-9 rounded-full object-cover border-2 border-amber-500/20 shadow-3xs"
                    />
                    {selectedPatient.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0a1020]" />
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-amber-200 truncate">
                        {selectedPatient.name}
                      </h4>
                      <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 font-mono flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        {selectedPatient.phone || '(73) 9 8104-7390'}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 truncate font-medium mt-0.5">
                      {selectedPatient.age || 48} anos • Dr. Augusto Faro • <span className="font-semibold text-amber-400">{selectedPatient.status}</span>
                    </p>
                  </div>
                </div>

                {/* PROMINENT ACTION BUTTONS: CONVITES & DOSSIER */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenOutreach}
                    className="px-3 py-2 bg-gradient-to-r from-emerald-600/20 to-teal-700/20 hover:from-emerald-500/15 hover:to-teal-600/15 text-emerald-300 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0 border border-emerald-500/20"
                    title="Enviar Convite de Exame de Vista via WhatsApp / Iris AI"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Convite Exame</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDossierOpen(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0 border border-amber-500/25"
                    title="Abrir Módulo de Receitas e Exames"
                  >
                    <Camera className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Dossiê</span>
                    <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded-full font-bold font-mono">
                      {selectedPatient.documents?.length || 2}
                    </span>
                  </button>
                </div>
              </div>

              {/* Chat Viewport */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 flex flex-col bg-[#070c18]/10">
                {selectedPatient.chatHistory.map((chat) => {
                  const isCopilot = chat.sender === 'copilot';
                  const isSystem = chat.sender === 'system';
                  const isPatient = chat.sender === 'patient';
                  const isAdmin = chat.sender === 'admin';

                  if (isSystem) {
                    return (
                      <div key={chat.id} className="mx-auto text-center my-1.5 max-w-[90%]">
                        <span className="text-[9.5px] bg-[#0c1326] text-amber-300/80 font-bold px-3 py-1 rounded-full border border-amber-500/10 shadow-2xs">
                          {chat.content}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={chat.id} 
                      className={`flex gap-2.5 max-w-[85%] ${isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {/* Avatar */}
                      <img 
                        src={
                          isAdmin ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120' :
                          isCopilot ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' :
                          selectedPatient.avatar
                        } 
                        alt={chat.senderName} 
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-amber-500/10 shadow-xs"
                      />

                      {/* Bubble */}
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1.5 mb-0.5 justify-between">
                          <span className={`text-[9.5px] font-extrabold ${isCopilot ? 'text-amber-400' : 'text-slate-350'}`}>
                            {chat.senderName} {isCopilot && '✨'}
                          </span>
                          <span className="text-[8px] text-slate-400 font-medium">{chat.timestamp}</span>
                        </div>
                        
                        {/* Bubble background design */}
                        <div className={`px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-3xs group relative ${
                          isAdmin 
                            ? 'bg-amber-500 text-slate-950 rounded-tr-none font-bold' 
                            : isCopilot 
                            ? 'bg-[#0c1326] border border-amber-500/15 text-slate-250 rounded-tl-none ring-1 ring-amber-500/5'
                            : 'bg-[#121c38]/40 border border-amber-500/10 text-slate-300 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-line">{chat.content}</p>

                          {/* Interactive "Speak/Falar" helper button for Iris responses */}
                          {isCopilot && (
                            <button 
                              onClick={() => speakText(chat.content)}
                              className="absolute -right-7 top-1/2 -translate-y-1/2 p-1 bg-[#0c1326] hover:bg-amber-500/10 rounded-md border border-amber-500/20 text-amber-450 cursor-pointer transition-all shadow-3xs"
                              title="Ouvir Resposta de Voz"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isChatting && (
                  <div className="flex gap-2.5 max-w-[80%] mr-auto items-center">
                    <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-[10px] text-amber-300 shrink-0">
                      I
                    </div>
                    <div className="px-4 py-2.5 bg-[#0c1326] border border-amber-500/15 text-slate-300 rounded-2xl rounded-tl-none text-xs flex gap-1 items-center font-bold">
                      <span>Iris está digitando</span>
                      <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                
                {/* Upload loading indicator */}
                {uploadProgress !== null && (
                  <div className="mx-auto bg-[#0c1326] border border-amber-500/10 p-3 rounded-xl shadow-md text-center max-w-[80%] my-2">
                    <p className="text-[10px] text-slate-400 font-bold mb-1.5 flex items-center justify-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      Extraindo dados de: <span className="text-amber-300 font-mono">{uploadedFileName}</span>
                    </p>
                    <div className="w-full h-1.5 bg-[#070c18] rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form with Speech API Microphone + Media upload selectors */}
              <div className="relative">
                {/* Upload Options Drawer */}
                <AnimatePresence>
                  {showUploadMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute bottom-[105%] left-4 bg-[#0c1326] rounded-xl shadow-xl border border-amber-500/20 p-2.5 z-20 w-64 space-y-1.5"
                    >
                      <h5 className="text-[10px] font-bold uppercase text-slate-350 tracking-wide px-2 py-0.5">Simular Upload de Documentos</h5>
                      
                      <button 
                        onClick={() => handleMockUpload('receita_medica.jpg')}
                        className="w-full text-left text-xs p-2 hover:bg-amber-500/10 rounded-lg flex items-center gap-2 text-slate-200 font-semibold transition-all cursor-pointer border border-transparent hover:border-amber-500/15"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-400 font-bold" />
                        <div>
                          <p className="text-xs leading-none">Receita Médica (imagem)</p>
                          <span className="text-[8.5px] text-slate-400">Extrator Inteligente de Grau</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => handleMockUpload('armação_escolhida.png')}
                        className="w-full text-left text-xs p-2 hover:bg-amber-500/10 rounded-lg flex items-center gap-2 text-slate-200 font-semibold transition-all cursor-pointer border border-transparent hover:border-amber-500/15"
                      >
                        <Glasses className="w-3.5 h-3.5 text-amber-400" />
                        <div>
                          <p className="text-xs leading-none">Foto de Armação (PNG)</p>
                          <span className="text-[8.5px] text-slate-400">Visão Computacional de Estilo</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => handleMockUpload('comprovante_pix.pdf')}
                        className="w-full text-left text-xs p-2 hover:bg-amber-500/10 rounded-lg flex items-center gap-2 text-slate-200 font-semibold transition-all cursor-pointer border border-transparent hover:border-amber-500/15"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <div>
                          <p className="text-xs leading-none">Comprovante PIX (PDF)</p>
                          <span className="text-[8.5px] text-slate-400">Baixa automática no CRM</span>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSendMessage} className="p-3 bg-[#0c1326]/90 border-t border-amber-500/10 flex items-center gap-2 shrink-0">
                  {/* Media attachment button */}
                  <button 
                    type="button" 
                    onClick={() => setShowUploadMenu(!showUploadMenu)}
                    className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer" 
                    title="Enviar Fotos ou Arquivos para Análise"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={`Conversar com ${selectedPatient.name}...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-[#070c18] border border-amber-500/15 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/35 text-slate-200 font-semibold placeholder-slate-500"
                  />

                  {/* SPEECH API: Microphone toggle dictation button */}
                  <button 
                    type="button" 
                    onClick={toggleSpeechRecognition}
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'text-slate-450 hover:text-amber-400 hover:bg-amber-500/10'
                    }`}
                    title={isListening ? "Gravando voz... Clique para parar." : "Digitar por Voz (Web Speech API)"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatting}
                    className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-[#070c18] text-slate-950 disabled:text-slate-500 disabled:opacity-40 transition-all cursor-pointer shadow-xs shrink-0 font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* CHRONOLOGICAL TIMELINE & INTEGRATED SCHEDULER */}
              <div className="border-t border-amber-500/10 bg-[#091022]/40 p-4 shrink-0 grid grid-cols-12 gap-4">
                
                {/* TIMELINE */}
                <div className="col-span-7 border-r border-amber-500/10 pr-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-350 mb-2.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Histórico e Logs
                    </h4>

                    <div className="space-y-3.5 max-h-[125px] overflow-y-auto pr-1">
                      {selectedPatient.timeline.map((evt) => (
                        <div key={evt.id} className="flex gap-2.5 items-start relative">
                          <div className={`w-5 h-5 rounded-full shrink-0 border flex items-center justify-center ${
                            evt.iconType === 'prescription' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
                            evt.iconType === 'dilation' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' :
                            evt.iconType === 'calendar' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                            'bg-amber-500/10 border-amber-500/20 text-amber-300'
                          }`}>
                            {evt.iconType === 'prescription' && <FileText className="w-2.5 h-2.5" />}
                            {evt.iconType === 'dilation' && <Eye className="w-2.5 h-2.5" />}
                            {evt.iconType === 'completed' && <Check className="w-2.5 h-2.5" />}
                            {evt.iconType === 'calendar' && <Calendar className="w-2.5 h-2.5" />}
                            {evt.iconType === 'registration' && <FileCheck className="w-2.5 h-2.5" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-slate-200 truncate">{evt.title}</p>
                            <span className="text-[8.5px] text-slate-400 font-mono">{evt.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SCHEDULER: Quick Return scheduling */}
                <div className="col-span-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-355 mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Agendar Consulta de Retorno
                    </h4>

                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-300 bg-[#0c1326] border border-amber-500/10 rounded p-1 mb-1.5 select-none">
                      <span>Julho 2026</span>
                      <span className="text-slate-400">Selecione</span>
                    </div>

                    {/* Active days list */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                      {[18, 19, 20, 21, 22, 23, 24].map((day) => {
                        const isSelected = selectedDay === day;
                        return (
                          <div 
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`p-0.5 text-[8.5px] font-bold rounded-sm cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-amber-500 text-slate-950 font-black shadow-3xs' 
                                : 'bg-[#0c1326] text-slate-300 hover:bg-amber-500/10 border border-amber-500/10'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="text-[9.5px] bg-[#0c1326] border border-amber-500/20 rounded p-1 font-bold text-slate-250 focus:outline-none flex-1"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      </select>
                    
                    <button
                      onClick={handleScheduleAppointment}
                      className="text-[9px] font-black bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 rounded transition-all shrink-0 cursor-pointer shadow-sm"
                    >
                      Marcar
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* PANEL 3: DADOS ÓPTICOS, PARÂMETROS & MEMÓRIA DA IRIS */}
            <section className={`md:col-span-4 border-l border-amber-500/10 flex-col bg-[#070c18]/30 h-full overflow-hidden shrink-0 ${mobileActiveTab === 'ficha' ? 'flex flex-1' : 'hidden md:flex'}`}>
              
              {/* Tab Selector */}
              <div className="flex border-b border-amber-500/10 shrink-0 bg-[#091022]/40">
                <button
                  onClick={() => setActiveTab('ficha')}
                  className={`flex-1 text-center py-3 text-[11px] uppercase font-extrabold tracking-wider transition-all cursor-pointer ${
                    activeTab === 'ficha' 
                      ? 'border-b-2 border-amber-500 text-amber-200 bg-[#070c18]/40 font-black' 
                      : 'text-slate-450 hover:text-slate-200 hover:bg-[#0c1326]/40 font-bold'
                  }`}
                >
                  Ficha do Cérebro (Memória)
                </button>
                <button
                  onClick={() => setActiveTab('parametros')}
                  className={`flex-1 text-center py-3 text-[11px] uppercase font-extrabold tracking-wider transition-all cursor-pointer ${
                    activeTab === 'parametros' 
                      ? 'border-b-2 border-amber-500 text-amber-200 bg-[#070c18]/40 font-black' 
                      : 'text-slate-450 hover:text-slate-200 hover:bg-[#0c1326]/40 font-bold'
                  }`}
                >
                  Graus & Parâmetros
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
                
                {activeTab === 'ficha' ? (
                  /* TAB 1: IRIS BRAIN PERMANENT MEMORY & AUTOMATIONS */
                  <div className="space-y-4">
                    
                    {/* Basic Patient Personal Identity Details */}
                    <div className="bg-[#0c1326]/60 p-3.5 rounded-2xl border border-amber-500/10 shadow-3xs space-y-3">
                      <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/10">
                        <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-amber-200 flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                          Memória Permanente do Paciente
                        </h4>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleOpenOutreach}
                            className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer border border-emerald-500/20 shadow-3xs"
                            title="Módulo de Disparo de Convite para Exame de Vista"
                          >
                            <Megaphone className="w-3 h-3 text-emerald-400" />
                            <span>Convite Exame</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDossierOpen(true)}
                            className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-md text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer border border-amber-500/20 shadow-3xs"
                            title="Ver Dossiê, Receitas e Exames"
                          >
                            <Camera className="w-3 h-3 text-amber-400" />
                            <span>Dossiê</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold block uppercase">Nome:</label>
                          <input 
                            type="text" 
                            value={selectedPatient.name} 
                            onChange={(e) => handleUpdateProfileField('name', e.target.value)}
                            className="font-bold text-amber-250 bg-transparent border-b border-transparent focus:border-amber-500/30 focus:outline-none w-full py-0.5"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 font-bold block uppercase">Profissão:</label>
                          <input 
                            type="text" 
                            value={selectedPatient.profession || 'Não Informada'} 
                            onChange={(e) => handleUpdateProfileField('profession', e.target.value)}
                            className="font-semibold text-slate-200 bg-transparent border-b border-transparent focus:border-amber-500/30 focus:outline-none w-full py-0.5"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 font-bold block uppercase">Idade:</label>
                          <input 
                            type="number" 
                            value={selectedPatient.age || 0} 
                            onChange={(e) => handleUpdateProfileField('age', parseInt(e.target.value) || 0)}
                            className="font-semibold text-slate-200 bg-transparent border-b border-transparent focus:border-amber-500/30 focus:outline-none w-full py-0.5"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 font-bold block uppercase">Cidade:</label>
                          <input 
                            type="text" 
                            value={selectedPatient.city || 'Não Informada'} 
                            onChange={(e) => handleUpdateProfileField('city', e.target.value)}
                            className="font-semibold text-slate-200 bg-transparent border-b border-transparent focus:border-amber-500/30 focus:outline-none w-full py-0.5"
                          />
                        </div>
                      </div>

                      {/* Advanced clinical records */}
                      <div className="border-t border-amber-500/10 pt-2.5 space-y-2">
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Óculos Anterior (Histórico):</span>
                          <input 
                            type="text" 
                            value={selectedPatient.previousGlasses || 'Nenhum registro'} 
                            onChange={(e) => handleUpdateProfileField('previousGlasses', e.target.value)}
                            className="text-xs text-slate-200 bg-transparent border-b border-transparent focus:border-amber-500/30 focus:outline-none w-full font-semibold"
                          />
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Doenças / Patologias Oculares:</span>
                          <input 
                            type="text" 
                            value={selectedPatient.eyeDiseases || 'Nenhuma patologia'} 
                            onChange={(e) => handleUpdateProfileField('eyeDiseases', e.target.value)}
                            className="text-xs text-slate-200 bg-transparent border-b border-transparent focus:border-amber-500/30 focus:outline-none w-full font-semibold"
                          />
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Alergias / Cirurgias:</span>
                          <input 
                            type="text" 
                            value={selectedPatient.allergies || 'Nenhuma'} 
                            onChange={(e) => handleUpdateProfileField('allergies', e.target.value)}
                            className="text-xs text-slate-200 bg-transparent border-b border-transparent focus:border-amber-500/30 focus:outline-none w-full font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CRM Funnel Controls */}
                    <div className="bg-[#0c1326]/60 p-3.5 rounded-2xl border border-amber-500/10 shadow-3xs space-y-3">
                      <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-amber-200 flex items-center gap-1.5 pb-1 border-b border-amber-500/10">
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        Estágio do Funil (CRM)
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold block uppercase">Etapa Clínico-Venda:</label>
                          <select 
                            value={selectedPatient.crmStage || 'Orçamento'} 
                            onChange={(e) => {
                              const v = e.target.value;
                              handleUpdateProfileField('crmStage', v);
                              // Update main status dynamically as well
                              const mainStatus: Patient['status'] = v === 'Orçamento' ? 'Orçamento' : v === 'Fechamento' ? 'Em Laboratório' : v === 'Pós-Venda' ? 'Para Retirada' : 'Sem Pendências';
                              handleUpdateProfileField('status', mainStatus);
                            }}
                            className="text-xs bg-[#0c1326] border border-amber-500/15 rounded p-1 font-bold text-slate-200 focus:outline-none w-full"
                          >
                            <option value="Lead">Lead inicial</option>
                            <option value="Orçamento">Orçamento pendente</option>
                            <option value="Fechamento">Em Fabricação (Fechado)</option>
                            <option value="Pós-Venda">Pós-venda ativo</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 font-bold block uppercase">Probabilidade de Compra:</label>
                          <div className="flex items-center gap-1.5 mt-1">
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={selectedPatient.purchaseProbability || 50} 
                              onChange={(e) => handleUpdateProfileField('purchaseProbability', parseInt(e.target.value))}
                              className="w-full h-1.5 bg-[#070c18] rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <span className="font-mono text-xs font-bold text-amber-250">{selectedPatient.purchaseProbability || 50}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meta WhatsApp Integration Automated Triggers */}
                    <div className="bg-[#0c1326]/60 p-3.5 rounded-2xl border border-amber-500/10 shadow-3xs space-y-3">
                      <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-amber-200 flex items-center gap-1.5 pb-1 border-b border-amber-500/10">
                        <Share2 className="w-3.5 h-3.5 text-amber-400" />
                        Disparos Oficiais WhatsApp (Meta)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Action 1 */}
                        <button 
                          onClick={() => handleWhatsAppTrigger('send_pix')}
                          className="text-[10px] text-left p-2 border border-amber-500/10 hover:border-amber-500/35 hover:bg-[#0c1326] rounded-xl flex items-center gap-2 font-extrabold text-slate-200 cursor-pointer transition-all bg-[#0a1020]/40"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <div>
                            <p className="leading-none text-slate-200">Enviar PIX / Link</p>
                            <span className="text-[8px] font-normal text-slate-400">Cobrança Direta</span>
                          </div>
                        </button>

                        {/* Action 2 */}
                        <button 
                          onClick={() => handleWhatsAppTrigger('send_budget_pdf')}
                          className="text-[10px] text-left p-2 border border-amber-500/10 hover:border-amber-500/35 hover:bg-[#0c1326] rounded-xl flex items-center gap-2 font-extrabold text-slate-200 cursor-pointer transition-all bg-[#0a1020]/40"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <div>
                            <p className="leading-none text-slate-200">Gerar PDF Orçamento</p>
                            <span className="text-[8px] font-normal text-slate-400">Layout ÍrisClin</span>
                          </div>
                        </button>

                        {/* Action 3 */}
                        <button 
                          onClick={() => handleWhatsAppTrigger('send_nps_survey')}
                          className="text-[10px] text-left p-2 border border-amber-500/10 hover:border-amber-500/35 hover:bg-[#0c1326] rounded-xl flex items-center gap-2 font-extrabold text-slate-200 cursor-pointer transition-all bg-[#0a1020]/40"
                        >
                          <Award className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                          <div>
                            <p className="leading-none text-slate-200">Disparar NPS 0-10</p>
                            <span className="text-[8px] font-normal text-slate-400">Pós-venda Inteligente</span>
                          </div>
                        </button>

                        {/* Action 4 */}
                        <button 
                          onClick={() => handleWhatsAppTrigger('send_location')}
                          className="text-[10px] text-left p-2 border border-amber-500/10 hover:border-amber-500/35 hover:bg-[#0c1326] rounded-xl flex items-center gap-2 font-extrabold text-slate-200 cursor-pointer transition-all bg-[#0a1020]/40"
                        >
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <div>
                            <p className="leading-none text-slate-200">Enviar Localização</p>
                            <span className="text-[8px] font-normal text-slate-400">Av. Paulista, 1000 - SP</span>
                          </div>
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* TAB 2: OPTICAL DIOPTER GRADES & PARAMS EDITING */
                  <div className="space-y-4">
                    
                    {/* Back Button to Ficha */}
                    <div className="flex items-center justify-between pb-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('ficha')}
                        className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-extrabold text-[11px] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-amber-500/20 shadow-2xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                        <span>Voltar para Memória</span>
                      </button>

                      <span className="text-[10px] text-slate-400 font-black uppercase">Grau &amp; Refração</span>
                    </div>
                    
                    {/* Visual Eye Metrics Form */}
                    <div className="bg-[#0c1326]/60 p-3.5 rounded-2xl border border-amber-500/10 shadow-3xs">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-amber-200 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          Dados de Refração (Mapeamento)
                        </h4>
                        
                        <button
                          onClick={() => setIsEditingMetrics(!isEditingMetrics)}
                          className="text-[9.5px] font-black text-amber-300 hover:text-amber-200 px-2 py-0.5 rounded bg-amber-500/10 transition-all cursor-pointer border border-amber-500/25"
                        >
                          {isEditingMetrics ? 'Concluir' : 'Alterar Valores'}
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-center text-[11px] border-collapse">
                          <thead>
                            <tr className="border-b border-amber-500/10 text-[9px] font-extrabold text-slate-400">
                              <th className="py-1 text-left font-extrabold text-amber-250">Olho</th>
                              <th className="py-1">ESF (SPH)</th>
                              <th className="py-1">CIL (CYL)</th>
                              <th className="py-1">EIXO</th>
                              <th className="py-1">ADIC (ADD)</th>
                              <th className="py-1">DNP (PD)</th>
                            </tr>
                          </thead>
                          <tbody className="font-mono text-slate-200 font-semibold">
                            {/* OD Row */}
                            <tr className="border-b border-amber-500/5 text-[10.5px]">
                              <td className="py-2 text-left font-sans font-extrabold text-amber-450">OD:</td>
                              <td className="py-2">
                                {isEditingMetrics ? (
                                  <input 
                                    type="text" 
                                    value={selectedPatient.opticalData.od.sph} 
                                    onChange={(e) => handleUpdateMetric('od', 'sph', e.target.value)}
                                    className="w-12 text-center bg-[#070c18] border border-amber-500/20 text-slate-200 rounded focus:outline-none font-mono text-xs font-semibold"
                                  />
                                ) : selectedPatient.opticalData.od.sph}
                              </td>
                              <td className="py-2">
                                {isEditingMetrics ? (
                                  <input 
                                    type="text" 
                                    value={selectedPatient.opticalData.od.cyl} 
                                    onChange={(e) => handleUpdateMetric('od', 'cyl', e.target.value)}
                                    className="w-12 text-center bg-[#070c18] border border-amber-500/20 text-slate-200 rounded focus:outline-none font-mono text-xs font-semibold"
                                  />
                                ) : selectedPatient.opticalData.od.cyl}
                              </td>
                              <td className="py-2">
                                {isEditingMetrics ? (
                                  <input 
                                    type="text" 
                                    value={selectedPatient.opticalData.od.axis} 
                                    onChange={(e) => handleUpdateMetric('od', 'axis', e.target.value)}
                                    className="w-10 text-center bg-[#070c18] border border-amber-500/20 text-slate-200 rounded focus:outline-none font-mono text-xs font-semibold"
                                  />
                                ) : `${selectedPatient.opticalData.od.axis}°`}
                              </td>
                              <td className="py-2">
                                {isEditingMetrics ? (
                                  <input 
                                    type="text" 
                                    value={selectedPatient.opticalData.od.add} 
                                    onChange={(e) => handleUpdateMetric('od', 'add', e.target.value)}
                                    className="w-12 text-center bg-[#070c18] border border-amber-500/20 text-slate-200 rounded focus:outline-none font-mono text-xs font-semibold"
                                  />
                                ) : selectedPatient.opticalData.od.add}
                              </td>
                              <td className="py-2">
                                {isEditingMetrics ? (
                                  <input 
                                    type="text" 
                                    value={selectedPatient.opticalData.od.pd} 
                                    onChange={(e) => handleUpdateMetric('od', 'pd', e.target.value)}
                                    className="w-16 text-center bg-[#070c18] border border-amber-500/20 text-slate-200 rounded focus:outline-none font-mono text-xs font-semibold"
                                  />
                                ) : selectedPatient.opticalData.od.pd}
                              </td>
                            </tr>

                            {/* OE Row */}
                            <tr className="text-[10.5px]">
                              <td className="py-2 text-left font-sans font-extrabold text-amber-450">OE:</td>
                              <td className="py-2">
                                {isEditingMetrics ? (
                                  <input 
                                    type="text" 
                                    value={selectedPatient.opticalData.oe.sph} 
                                    onChange={(e) => handleUpdateMetric('oe', 'sph', e.target.value)}
                                    className="w-12 text-center bg-[#070c18] border border-amber-500/20 text-slate-200 rounded focus:outline-none font-mono text-xs font-semibold"
                                  />
                                ) : selectedPatient.opticalData.oe.sph}
                              </td>
                              <td className="py-2">
                                {isEditingMetrics ? (
                                  <input 
                                    type="text" 
                                    value={selectedPatient.opticalData.oe.cyl} 
                                    onChange={(e) => handleUpdateMetric('oe', 'cyl', e.target.value)}
                                    className="w-12 text-center bg-[#070c18] border border-amber-500/20 text-slate-200 rounded focus:outline-none font-mono text-xs font-semibold"
                                  />
                                ) : selectedPatient.opticalData.oe.cyl}
                              </td>
                              <td className="py-2">
                                {isEditingMetrics ? (
                                  <input 
                                    type="text" 
                                    value={selectedPatient.opticalData.oe.axis} 
                                    onChange={(e) => handleUpdateMetric('oe', 'axis', e.target.value)}
                                    className="w-10 text-center bg-[#070c18] border border-amber-500/20 text-slate-200 rounded focus:outline-none font-mono text-xs font-semibold"
                                  />
                                ) : `${selectedPatient.opticalData.oe.axis}°`}
                              </td>
                              <td className="py-2">
                                {isEditingMetrics ? (
                                  <input 
                                    type="text" 
                                    value={selectedPatient.opticalData.oe.add} 
                                    onChange={(e) => handleUpdateMetric('oe', 'add', e.target.value)}
                                    className="w-12 text-center bg-[#070c18] border border-amber-500/20 text-slate-200 rounded focus:outline-none font-mono text-xs font-semibold"
                                  />
                                ) : selectedPatient.opticalData.oe.add}
                              </td>
                              <td className="py-2">
                                {isEditingMetrics ? (
                                  <input 
                                    type="text" 
                                    value={selectedPatient.opticalData.oe.pd} 
                                    onChange={(e) => handleUpdateMetric('oe', 'pd', e.target.value)}
                                    className="w-16 text-center bg-[#070c18] border border-amber-500/20 text-slate-200 rounded focus:outline-none font-mono text-xs font-semibold"
                                  />
                                ) : selectedPatient.opticalData.oe.pd}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {/* MODULE: CLINICAL AI ASSISTANT CO-PILOT ANALYSIS */}
                <div className="bg-gradient-to-br from-[#0c1326]/90 to-[#070c18]/90 p-4 rounded-2xl border border-amber-500/15 shadow-lg text-white space-y-3.5 relative overflow-hidden mt-3">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Análise de Tratamento Iris AI
                    </h4>
                    <span className="text-[8.5px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                      Livre de Erros
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Análise em tempo real do grau óptico de <span className="text-white font-bold">{selectedPatient.name}</span>. Nosso cérebro de triagem clínica cruzará as condições anteriores de saúde ocular.
                  </p>

                  <div className="space-y-1">
                    <input 
                      type="text" 
                      placeholder="Instrução adicional (Ex: Foco no cansaço de telas)..." 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full bg-[#070c18] border border-amber-500/15 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>

                  <button
                    onClick={() => triggerAiAnalysis(true)}
                    disabled={isAnalyzing}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-45 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-3 h-3 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        <span>Iris processando receita...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5" />
                        <span>Gerar Prescrição Assistida (Gemini)</span>
                      </>
                    )}
                  </button>

                  {/* Analysis Result display */}
                  {aiAnalysis && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#070c18] text-slate-200 p-3.5 rounded-xl border border-amber-500/15 max-h-[220px] overflow-y-auto mt-2 text-xs select-text shadow-inner"
                    >
                      {renderAnalysisMarkdown(aiAnalysis)}
                    </motion.div>
                  )}
                </div>

              </div>
            </section>

          </main>
        </div>

        {/* DIALOG/MODAL: ADD NEW PATIENT WITH IRIS PERMANENT MEMORY FIELDS */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-sky-400" />
                    <div>
                      <h3 className="font-display font-extrabold text-sm">Adicionar Ficha Clínica (Memória Iris AI)</h3>
                      <p className="text-[9px] text-slate-400">Cadastre o paciente com dados ópticos e anamnese</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleAddPatient} className="p-4 overflow-y-auto space-y-4 flex-1">
                  
                  {/* Basic Personal details */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Identidade Principal</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Nome Completo:</label>
                        <input 
                          type="text" 
                          required 
                          value={newPatientName} 
                          onChange={(e) => setNewPatientName(e.target.value)}
                          placeholder="Ex: Pedro de Alcântara"
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Status Inicial:</label>
                        <select 
                          value={newPatientStatus} 
                          onChange={(e) => setNewPatientStatus(e.target.value as Patient['status'])}
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        >
                          <option value="Orçamento">Orçamento Pendente</option>
                          <option value="Em Laboratório">Fabricação (Laboratório)</option>
                          <option value="Para Retirada">Pronto para Retirada</option>
                          <option value="Sem Pendências">Sem Pendências (Adaptado)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Idade:</label>
                        <input 
                          type="number" 
                          value={newPatientAge} 
                          onChange={(e) => setNewPatientAge(parseInt(e.target.value) || 30)}
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Profissão:</label>
                        <input 
                          type="text" 
                          value={newPatientProfession} 
                          onChange={(e) => setNewPatientProfession(e.target.value)}
                          placeholder="Ex: Programador"
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact & Location Details */}
                  <div className="space-y-2.5 border-t border-slate-100 pt-3">
                    <h4 className="text-[10px] uppercase font-bold text-sky-600 tracking-wider flex items-center gap-1.5">
                      <span>📱</span> Contato, Endereço &amp; Documentos
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">WhatsApp / Telefone:</label>
                        <input 
                          type="text" 
                          value={newPatientPhone} 
                          onChange={(e) => setNewPatientPhone(e.target.value)}
                          placeholder="(73) 98104-7390"
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">E-mail de Contato:</label>
                        <input 
                          type="email" 
                          value={newPatientEmail} 
                          onChange={(e) => setNewPatientEmail(e.target.value)}
                          placeholder="paciente@email.com"
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">CPF / Documento:</label>
                        <input 
                          type="text" 
                          value={newPatientCpf} 
                          onChange={(e) => setNewPatientCpf(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Cidade / UF:</label>
                        <input 
                          type="text" 
                          value={newPatientCity} 
                          onChange={(e) => setNewPatientCity(e.target.value)}
                          placeholder="Itabuna - BA"
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Endereço Residencial Completo:</label>
                        <input 
                          type="text" 
                          value={newPatientAddress} 
                          onChange={(e) => setNewPatientAddress(e.target.value)}
                          placeholder="Rua, Número, Bairro e Ponto de Referência"
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Permanent memory clinical fields */}
                  <div className="space-y-2.5 border-t border-slate-100 pt-3">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Anamnese de Memória Permanente</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Óculos Anterior:</label>
                        <input 
                          type="text" 
                          value={newPatientPrevGlasses} 
                          onChange={(e) => setNewPatientPrevGlasses(e.target.value)}
                          placeholder="Ex: Varilux Multifocal"
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Dra/Dr Responsável:</label>
                        <input 
                          type="text" 
                          value={newPatientDoctor} 
                          onChange={(e) => setNewPatientDoctor(e.target.value)}
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-medium"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Patologias Oculares / Cirurgias:</label>
                        <input 
                          type="text" 
                          value={newPatientDiseases} 
                          onChange={(e) => setNewPatientDiseases(e.target.value)}
                          placeholder="Ex: Astigmatismo composto, início catarata"
                          className="w-full border border-sky-100 rounded-lg p-2 text-xs text-slate-700 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optical initial parameters */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Graus do Exame de Vista</h4>
                    
                    {/* OD Form row */}
                    <div className="bg-slate-50 p-2 rounded-lg grid grid-cols-5 gap-1.5 text-center">
                      <div className="text-left font-bold text-xs text-sky-600 pt-1.5">OD (Dir)</div>
                      <input 
                        type="text" 
                        placeholder="Esf" 
                        value={newPatientOD.sph} 
                        onChange={(e) => setNewPatientOD(prev => ({...prev, sph: e.target.value}))}
                        className="bg-white border border-sky-100 rounded p-1 text-xs text-center font-mono font-bold"
                      />
                      <input 
                        type="text" 
                        placeholder="Cil" 
                        value={newPatientOD.cyl} 
                        onChange={(e) => setNewPatientOD(prev => ({...prev, cyl: e.target.value}))}
                        className="bg-white border border-sky-100 rounded p-1 text-xs text-center font-mono font-bold"
                      />
                      <input 
                        type="text" 
                        placeholder="Eixo" 
                        value={newPatientOD.axis} 
                        onChange={(e) => setNewPatientOD(prev => ({...prev, axis: e.target.value}))}
                        className="bg-white border border-sky-100 rounded p-1 text-xs text-center font-mono font-bold"
                      />
                      <input 
                        type="text" 
                        placeholder="Add" 
                        value={newPatientOD.add} 
                        onChange={(e) => setNewPatientOD(prev => ({...prev, add: e.target.value}))}
                        className="bg-white border border-sky-100 rounded p-1 text-xs text-center font-mono font-bold"
                      />
                    </div>

                    {/* OE Form row */}
                    <div className="bg-slate-50 p-2 rounded-lg grid grid-cols-5 gap-1.5 text-center">
                      <div className="text-left font-bold text-xs text-indigo-600 pt-1.5">OE (Esq)</div>
                      <input 
                        type="text" 
                        placeholder="Esf" 
                        value={newPatientOE.sph} 
                        onChange={(e) => setNewPatientOE(prev => ({...prev, sph: e.target.value}))}
                        className="bg-white border border-sky-100 rounded p-1 text-xs text-center font-mono font-bold"
                      />
                      <input 
                        type="text" 
                        placeholder="Cil" 
                        value={newPatientOE.cyl} 
                        onChange={(e) => setNewPatientOE(prev => ({...prev, cyl: e.target.value}))}
                        className="bg-white border border-sky-100 rounded p-1 text-xs text-center font-mono font-bold"
                      />
                      <input 
                        type="text" 
                        placeholder="Eixo" 
                        value={newPatientOE.axis} 
                        onChange={(e) => setNewPatientOE(prev => ({...prev, axis: e.target.value}))}
                        className="bg-white border border-sky-100 rounded p-1 text-xs text-center font-mono font-bold"
                      />
                      <input 
                        type="text" 
                        placeholder="Add" 
                        value={newPatientOE.add} 
                        onChange={(e) => setNewPatientOE(prev => ({...prev, add: e.target.value}))}
                        className="bg-white border border-sky-100 rounded p-1 text-xs text-center font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Save/Actions button */}
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-sky-600/10"
                    >
                      Salvar Ficha do Paciente
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <FluxoCaixa 
          isOpen={isFinanceOpen} 
          onClose={() => setIsFinanceOpen(false)} 
          patients={patients}
          onUpdateRevenue={(newRev) => setDashboardMetrics(prev => ({ ...prev, revenueTodayBRL: newRev }))}
        />

        <PatientDossierModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          patient={selectedPatient}
          onUpdatePatientDocuments={handleUpdatePatientDocuments}
          onUpdatePatientOpticalData={handleUpdatePatientOpticalData}
        />

        <OutreachExamModal
          isOpen={isOutreachModalOpen}
          onClose={() => setIsOutreachModalOpen(false)}
          patients={patients}
          activePatient={selectedPatient}
          onSendBulkMessage={handleSendBulkMessage}
        />

        <WhatsAppMetaPreviewModal
          isOpen={isWhatsAppMetaPreviewOpen}
          onClose={() => setIsWhatsAppMetaPreviewOpen(false)}
          patients={patients}
          onConfirmDispatch={(approvedMessage) => {
            handleSendBulkMessage(patients.map(p => p.id), approvedMessage, 'whatsapp');
            setIsWhatsAppMetaPreviewOpen(false);
          }}
        />

        <PwaInstallBanner />

        <IrisVoiceAssistantModal
          isOpen={isVoiceAssistantOpen}
          onClose={() => setIsVoiceAssistantOpen(false)}
          patients={patients}
          onTriggerOutreach={handleSendBulkMessage}
          onOpenFinance={handleOpenFinance}
          onOpenOutreachModal={handleOpenOutreach}
        />

        <AgendaConfirmacoesModal
          isOpen={isAgendaOpen}
          onClose={() => setIsAgendaOpen(false)}
          patients={patients}
          onUpdatePatient={handleUpdateSinglePatient}
          onAddNewPatient={handleUpdateSinglePatient}
        />

        <MobileDownloadModal
          isOpen={isMobileDownloadOpen}
          onClose={() => setIsMobileDownloadOpen(false)}
        />

        <PwaConfigHelper
          isOpen={isPwaHelperOpen}
          onClose={() => setIsPwaHelperOpen(false)}
        />

        {/* BLOQUINHO DE NOTAS MODAL - Relação de Clientes com busca por Nome e CPF */}
        <PatientListModal
          isOpen={isPatientListOpen}
          onClose={() => setIsPatientListOpen(false)}
          patients={patients}
          onSelectPatient={(id) => {
            setSelectedId(id);
          }}
          onAddNewPatient={() => setShowAddModal(true)}
        />

        {/* RELOGINHO MODAL - Pacientes Agendados para a Semana (Confirmados) */}
        <WeeklyConfirmedAgendaModal
          isOpen={isWeeklyAgendaOpen}
          onClose={() => setIsWeeklyAgendaOpen(false)}
          patients={patients}
          onSelectPatient={(id) => {
            setSelectedId(id);
          }}
          onOpenWhatsAppPreview={() => setIsWhatsAppMetaPreviewOpen(true)}
        />

        {/* OPÇÕES DE VOZ DA IRIS MODAL */}
        <IrisVoiceSettingsModal
          isOpen={isVoiceSettingsOpen}
          onClose={() => setIsVoiceSettingsOpen(false)}
        />

        {/* SINCRONIZAÇÃO OFFLINE INDEXEDDB PWA */}
        <OfflineSyncModal
          isOpen={isOfflineSyncOpen}
          onClose={() => setIsOfflineSyncOpen(false)}
          patients={patients}
        />

        {/* PAINEL DE DESEMPENHO DA EQUIPE & TAXA DE CONFIRMAÇÃO */}
        <TeamPerformanceModal
          isOpen={isTeamPerformanceOpen}
          onClose={() => setIsTeamPerformanceOpen(false)}
        />

        {/* ANÁLISE IA DE EXAMES (OCT, CAMPO VISUAL, TONOMETRIA) */}
        <AiExamAnalysisModal
          isOpen={isAiExamOpen}
          onClose={() => setIsAiExamOpen(false)}
          patients={patients}
          onAddExamToPatient={handleAddExamToPatient}
        />

        {/* SISTEMA DE AUTENTICAÇÃO E CONTROLE DE ACESSO (RBAC) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          allUsers={allUsers}
          onAddNewUserByAdmin={handleAddNewUserByAdmin}
          auditLogs={auditLogs}
        />

        {/* PORTAL DO PACIENTE (PERFIL PACIENTE) */}
        <PatientPortalModal
          isOpen={isPatientPortalOpen}
          onClose={() => setIsPatientPortalOpen(false)}
          currentUser={currentUser}
          patientData={selectedPatient}
        />

        {/* Global Loading Spinner overlay */}
        {globalLoading && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/40 backdrop-blur-xs flex items-center justify-center">
            <div className="bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-200">
              <div className="w-6 h-6 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-black text-slate-800 tracking-tight">Processando dados com segurança...</span>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 max-w-sm ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-rose-500 text-white border-rose-400'
              }`}
            >
              <div className="text-xs font-bold leading-normal">{toastMessage.text}</div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
