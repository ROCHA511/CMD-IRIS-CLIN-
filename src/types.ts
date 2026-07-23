/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OpticalMetrics {
  sph: string;  // Esférico (Spherical)
  cyl: string;  // Cilíndrico (Cylinder)
  axis: string; // Eixo (Axis)
  add: string;  // Adição (Addition)
  pd: string;   // DNP (Pupillary Distance)
}

export interface PatientOpticalData {
  od: OpticalMetrics; // Olho Direito (Right Eye)
  oe: OpticalMetrics; // Olho Esquerdo (Left Eye)
}

export interface LensFeatures {
  antiReflexo: boolean;
  blueControl: boolean;
  materialArmacao: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  iconType: 'prescription' | 'dilation' | 'completed' | 'calendar' | 'registration';
  status?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'admin' | 'patient' | 'system' | 'copilot';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface PatientDocument {
  id: string;
  type: 'receita' | 'exame' | 'outro';
  title: string;
  imageUrl: string;
  category: string; // e.g. "Receita Médica", "Topografia Ocular", "Retinografia", "Campimetria", "OCT Macular", "Laudo"
  date: string;
  notes?: string;
  doctorName?: string;
}

export interface Patient {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastActiveTime: string;
  status: 'Orçamento' | 'Em Laboratório' | 'Para Retirada' | 'Sem Pendências' | 'Exame Vencido';
  avatarColor: string;
  online: boolean;
  opticalData: PatientOpticalData;
  lensFeatures: LensFeatures;
  timeline: TimelineEvent[];
  chatHistory: ChatMessage[];
  aiSuggestions: string[];
  documents?: PatientDocument[];
  phone?: string;
  email?: string;
  address?: string;
  cpf?: string;
  lastExamDate?: string;
  
  // Agendamento & Agenda por Ordem de Chegada
  appointmentDate?: string; // Ex: '2026-07-22'
  appointmentShift?: 'Manhã (a partir das 06:30)' | 'Tarde';
  appointmentStatus?: 'Confirmado' | 'Pendente / Não Respondeu' | 'Cancelado';
  arrivalOrderNumber?: number; // Senha por Ordem de Chegada (1, 2, 3...)
  appointmentNotes?: string;
  
  // IRIS AI Permanent Memory Fields
  age?: number;
  profession?: string;
  city?: string;
  previousGlasses?: string;
  preferredPayment?: string;
  birthday?: string;
  dependents?: string[];
  doctorInCharge?: string;
  surgeries?: string;
  eyeDiseases?: string;
  allergies?: string;
  crmStage?: 'Lead' | 'Orçamento' | 'Fechamento' | 'Pós-Venda';
  purchaseProbability?: number; // 0 - 100
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'entrada' | 'saida';
  category: string;
  date: string;
  status: 'pago' | 'pendente';
  patientId?: string;
  patientName?: string;
  numDocumento?: string;
  formaPagamento?: 'Dinheiro' | 'Pix' | 'Cartão (cc)' | 'Bancário / Depósito';
  formaPagamentoId?: number; // 1: Dinheiro, 2: Pix, 3: Cartão (cc), 4: Bancário / Depósito
}

