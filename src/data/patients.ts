/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'João da Silva',
    phone: '(73) 99812-3456',
    cpf: '123.456.789-00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'Bom dia Iris, confirmo minha consulta para hoje!',
    lastActiveTime: '10:32 AM',
    status: 'Orçamento',
    avatarColor: 'bg-amber-100 text-amber-700',
    online: true,
    appointmentDate: '2026-07-22',
    appointmentShift: 'Manhã (a partir das 06:30)',
    appointmentStatus: 'Confirmado',
    arrivalOrderNumber: 1,
    appointmentNotes: 'Confirmado via Íris AI. Chegada prevista às 06:30.',
    opticalData: {
      od: { sph: '-2.00', cyl: '-0.50', axis: '90', add: '+1.50', pd: '32.5/33.0' },
      oe: { sph: '-1.75', cyl: '-0.75', axis: '95', add: '+1.50', pd: '32.0/32.5' }
    },
    lensFeatures: {
      antiReflexo: true,
      blueControl: false,
      materialArmacao: 'Acetato Preto'
    },
    timeline: [
      { id: 't1-0', time: '07:10 AM', title: 'Consulta Confirmada (#1 Fila)', iconType: 'calendar', status: 'done' },
      { id: 't1-1', time: '10:28 AM', title: 'Orçamento Enviado', iconType: 'prescription', status: 'pending' },
      { id: 't1-2', time: '09:15 AM', title: 'Consulta Realizada', iconType: 'completed', status: 'done' }
    ],
    chatHistory: [
      { id: 'c1-1', sender: 'patient', senderName: 'João da Silva', content: 'Bom dia! Gostaria de saber o valor total da lente com o filtro de luz azul e antirreflexo.', timestamp: '10:30 AM' },
      { id: 'c1-2', sender: 'copilot', senderName: 'Iris AI', content: 'Olá, seu João! Que bom falar com o senhor novamente. 😊 Confirmamos sua consulta para hoje no turno da manhã a partir das 06:30 por ordem de chegada. Sua posição na fila é a senha #1!', timestamp: '10:32 AM' }
    ],
    aiSuggestions: [
      'Oferecer Lente Digital Blue-Control para alívio de fadiga ocular.',
      'Sugerir armação leve de Acetato para melhor conforto nasal.'
    ],
    age: 48,
    profession: 'Engenheiro Civil',
    city: 'Itabuna - BA',
    previousGlasses: 'Multifocal Zeiss 1.60',
    preferredPayment: 'PIX ou Cartão de Crédito (3x)',
    birthday: '12 de Outubro',
    dependents: ['Marina da Silva (Filha)'],
    doctorInCharge: 'Dr. Augusto Faro',
    surgeries: 'Nenhuma cirurgia ocular prévia',
    eyeDiseases: 'Início de Presbiopia e Olho Seco leve',
    allergies: 'Sem alergias oculares registradas',
    crmStage: 'Orçamento',
    purchaseProbability: 85
  },
  {
    id: '2',
    name: 'Beatriz de Souza',
    phone: '(73) 98845-9012',
    cpf: '987.654.321-11',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'Sim, pode confirmar para o turno da manhã.',
    lastActiveTime: '08:15 AM',
    status: 'Em Laboratório',
    avatarColor: 'bg-blue-100 text-blue-700',
    online: true,
    appointmentDate: '2026-07-22',
    appointmentShift: 'Manhã (a partir das 06:30)',
    appointmentStatus: 'Confirmado',
    arrivalOrderNumber: 2,
    appointmentNotes: 'Confirmou presença no turno da manhã. Atendimento por ordem de chegada.',
    opticalData: {
      od: { sph: '-3.50', cyl: '-1.25', axis: '180', add: '+2.00', pd: '31.0/31.5' },
      oe: { sph: '-3.75', cyl: '-1.00', axis: '175', add: '+2.00', pd: '31.5/31.0' }
    },
    lensFeatures: {
      antiReflexo: true,
      blueControl: true,
      materialArmacao: 'Metal Titanium'
    },
    timeline: [
      { id: 't2-0', time: '08:15 AM', title: 'Consulta Confirmada (#2 Fila)', iconType: 'calendar', status: 'done' },
      { id: 't2-1', time: '10:20 AM', title: 'Enviado ao Laboratório', iconType: 'registration', status: 'done' }
    ],
    chatHistory: [
      { id: 'c2-1', sender: 'patient', senderName: 'Beatriz de Souza', content: 'Bom dia! O atendimento da manhã começa às 06:30, né?', timestamp: '08:10 AM' },
      { id: 'c2-2', sender: 'copilot', senderName: 'Iris AI', content: 'Olá, dona Bia! Isso mesmo! As consultas da manhã iniciam às 06:30 por ordem de chegada. Posso confirmar seu agendamento como a senha #2?', timestamp: '08:12 AM' }
    ],
    aiSuggestions: [
      'Priorizar corte ultrafino (Alto Índice 1.67) devido à dioptria alta.',
      'Informar sobre o período de adaptação natural de lentes multifocais.'
    ],
    age: 52,
    profession: 'Professora Universitária',
    city: 'Ilhéus - BA',
    previousGlasses: 'Multifocal Varilux Comfort',
    preferredPayment: 'Cartão de Crédito parcelado (6x)',
    birthday: '24 de Fevereiro',
    dependents: ['Lucas de Souza (Filho)'],
    doctorInCharge: 'Dr. Roberto Santos',
    surgeries: 'Nenhuma',
    eyeDiseases: 'Astigmatismo miópico composto e presbiopia',
    allergies: 'Sensibilidade a conservantes de colírio',
    crmStage: 'Fechamento',
    purchaseProbability: 100
  },
  {
    id: '3',
    name: 'Vilma Conceição d. S',
    phone: '(73) 99123-8877',
    cpf: '456.789.123-22',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'Ainda não respondi a mensagem de confirmação.',
    lastActiveTime: 'Ontem',
    status: 'Exame Vencido',
    avatarColor: 'bg-rose-100 text-rose-700',
    online: false,
    appointmentDate: '2026-07-22',
    appointmentShift: 'Manhã (a partir das 06:30)',
    appointmentStatus: 'Pendente / Não Respondeu',
    appointmentNotes: 'Aguardando ligação/confirmação para definir ordem de chegada.',
    opticalData: {
      od: { sph: '+1.50', cyl: '-0.75', axis: '45', add: '+1.25', pd: '33.0/33.0' },
      oe: { sph: '+1.25', cyl: '-0.50', axis: '50', add: '+1.25', pd: '33.5/32.5' }
    },
    lensFeatures: {
      antiReflexo: true,
      blueControl: false,
      materialArmacao: 'Acetato Marrom'
    },
    timeline: [
      { id: 't3-1', time: 'Ontem', title: 'Lembrete Enviado via WhatsApp', iconType: 'calendar', status: 'pending' }
    ],
    chatHistory: [
      { id: 'c3-1', sender: 'copilot', senderName: 'Iris AI', content: 'Olá Dona Vilma! Seu exame de vista completou 12 meses. Gostaria de agendar para hoje no turno da manhã a partir das 06:30 por ordem de chegada?', timestamp: 'Ontem' }
    ],
    aiSuggestions: [
      'Ligar urgentemente para confirmar vaga no turno da manhã.'
    ],
    age: 61,
    profession: 'Aposentada',
    city: 'Itabuna - BA',
    previousGlasses: 'Multifocal básico',
    doctorInCharge: 'Dr. Augusto Faro',
    eyeDiseases: 'Presbiopia e Catarata inicial',
    crmStage: 'Lead',
    purchaseProbability: 60
  },
  {
    id: '4',
    name: 'Ronaldo Silva d. Conc',
    phone: '(73) 98111-2233',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'Gostaria de agendar para o turno da manhã.',
    lastActiveTime: '09:00 AM',
    status: 'Orçamento',
    avatarColor: 'bg-purple-100 text-purple-700',
    online: true,
    appointmentDate: '2026-07-22',
    appointmentShift: 'Manhã (a partir das 06:30)',
    appointmentStatus: 'Pendente / Não Respondeu',
    appointmentNotes: 'Solicitou informações. Falta confirmar por WhatsApp ou ligação.',
    opticalData: {
      od: { sph: '-1.00', cyl: '0.00', axis: '0', add: '0.00', pd: '32.0/32.0' },
      oe: { sph: '-1.00', cyl: '0.00', axis: '0', add: '0.00', pd: '32.0/32.0' }
    },
    lensFeatures: {
      antiReflexo: true,
      blueControl: true,
      materialArmacao: 'Metal Esportivo'
    },
    timeline: [],
    chatHistory: [],
    aiSuggestions: ['Ligar para confirmar presença.'],
    age: 42,
    profession: 'Motorista de Aplicativo',
    city: 'Itabuna - BA',
    doctorInCharge: 'Dra. Julia Martins',
    crmStage: 'Lead',
    purchaseProbability: 75
  }
];
