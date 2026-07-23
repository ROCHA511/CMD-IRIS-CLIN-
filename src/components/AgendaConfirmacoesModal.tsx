import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  UserX, 
  Phone, 
  MessageSquare, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Search, 
  Filter, 
  Hash, 
  Sparkles, 
  Send, 
  PhoneCall,
  UserPlus,
  FileText,
  BadgeCheck,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { Patient } from '../types';

interface AgendaConfirmacoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onUpdatePatient: (updatedPatient: Patient) => void;
  onAddNewPatient?: (newPatient: Patient) => void;
}

export default function AgendaConfirmacoesModal({
  isOpen,
  onClose,
  patients,
  onUpdatePatient,
  onAddNewPatient
}: AgendaConfirmacoesModalProps) {
  const [selectedDate, setSelectedDate] = useState('2026-07-22');
  const [activeTab, setActiveTab] = useState<'confirmados' | 'pendentes' | 'novo'>('confirmados');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states for "Marcar Consulta / Agendar Novo"
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDate, setNewDate] = useState('2026-07-22');
  const [newShift, setNewShift] = useState<'Manhã (a partir das 06:30)' | 'Tarde'>('Manhã (a partir das 06:30)');
  const [newNotes, setNewNotes] = useState('');
  const [autoConfirm, setAutoConfirm] = useState(true);

  if (!isOpen) return null;

  // Filter patients for the selected appointment date (or default match)
  const datePatients = patients.filter(p => {
    // Match date if specified, or if empty treat as today's agenda for demo
    const pDate = p.appointmentDate || '2026-07-22';
    return pDate === selectedDate;
  });

  // Confirmed patients sorted by arrival order number
  const confirmedPatients = datePatients
    .filter(p => p.appointmentStatus === 'Confirmado')
    .sort((a, b) => (a.arrivalOrderNumber || 99) - (b.arrivalOrderNumber || 99));

  // Pending patients (awaiting response/call)
  const pendingPatients = datePatients
    .filter(p => p.appointmentStatus !== 'Confirmado');

  // Search filter
  const filterBySearch = (list: Patient[]) => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(p => 
      p.name.toLowerCase().includes(term) || 
      (p.phone && p.phone.toLowerCase().includes(term)) ||
      (p.appointmentNotes && p.appointmentNotes.toLowerCase().includes(term))
    );
  };

  const filteredConfirmed = filterBySearch(confirmedPatients);
  const filteredPending = filterBySearch(pendingPatients);

  // Quick Action: Confirm a pending patient ("Marcar Consulta")
  const handleConfirmPatient = (patient: Patient) => {
    // Calculate next order number for this date
    const currentMaxOrder = confirmedPatients.reduce((max, p) => Math.max(max, p.arrivalOrderNumber || 0), 0);
    const nextOrder = currentMaxOrder + 1;

    const updated: Patient = {
      ...patient,
      appointmentDate: selectedDate,
      appointmentShift: 'Manhã (a partir das 06:30)',
      appointmentStatus: 'Confirmado',
      arrivalOrderNumber: nextOrder,
      appointmentNotes: `Confirmado no sistema via 'Marcar Consulta'. Senha #${nextOrder} por Ordem de Chegada no turno da manhã (a partir das 06:30).`,
      timeline: [
        {
          id: `t-conf-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Consulta Confirmada (#${nextOrder} na Fila - Manhã 06:30)`,
          iconType: 'calendar',
          status: 'done'
        },
        ...patient.timeline
      ]
    };

    onUpdatePatient(updated);
  };

  // Quick Action: Unconfirm / Move back to pending
  const handleUnconfirmPatient = (patient: Patient) => {
    const updated: Patient = {
      ...patient,
      appointmentStatus: 'Pendente / Não Respondeu',
      arrivalOrderNumber: undefined,
      appointmentNotes: 'Aguardando nova confirmação.'
    };
    onUpdatePatient(updated);
  };

  // Handle Form Submission: Create or Marcar Consulta for New Patient
  const handleCreateAndBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    // Next order number
    const currentMaxOrder = confirmedPatients.reduce((max, p) => Math.max(max, p.arrivalOrderNumber || 0), 0);
    const nextOrder = autoConfirm ? currentMaxOrder + 1 : undefined;

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      lastMessage: 'Agendamento cadastrado no sistema.',
      lastActiveTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Orçamento',
      avatarColor: 'bg-emerald-100 text-emerald-800',
      online: true,
      appointmentDate: newDate,
      appointmentShift: newShift,
      appointmentStatus: autoConfirm ? 'Confirmado' : 'Pendente / Não Respondeu',
      arrivalOrderNumber: nextOrder,
      appointmentNotes: newNotes.trim() || (autoConfirm ? `Confirmado para o Turno da Manhã a partir das 06:30 por ordem de chegada. Senha #${nextOrder}.` : 'Pendente de resposta.'),
      opticalData: {
        od: { sph: '0.00', cyl: '0.00', axis: '0', add: '0.00', pd: '32.0/32.0' },
        oe: { sph: '0.00', cyl: '0.00', axis: '0', add: '0.00', pd: '32.0/32.0' }
      },
      lensFeatures: { antiReflexo: true, blueControl: true, materialArmacao: 'Padrão' },
      timeline: [
        {
          id: `t-init-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: autoConfirm ? `Consulta Lançada & Confirmada (#${nextOrder} Ordem de Chegada)` : 'Agendamento Lançado (Pendente)',
          iconType: 'calendar',
          status: 'done'
        }
      ],
      chatHistory: [
        {
          id: `c-init-${Date.now()}`,
          sender: 'copilot',
          senderName: 'Iris AI',
          content: `Olá, ${newName}! Sua consulta foi registrada no sistema da ÍrisClin para o dia ${newDate.split('-').reverse().join('/')} no turno da manhã (a partir das 06:30 por ordem de chegada).${autoConfirm ? ` Sua senha de atendimento é #${nextOrder}!` : ''}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      aiSuggestions: ['Enviar lembrete de localização e orientações da consulta.'],
      age: 40,
      city: 'Itabuna - BA'
    };

    if (onAddNewPatient) {
      onAddNewPatient(newPatient);
    } else {
      onUpdatePatient(newPatient);
    }

    // Reset Form
    setNewName('');
    setNewPhone('');
    setNewNotes('');
    setActiveTab(autoConfirm ? 'confirmados' : 'pendentes');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-5xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* MODAL HEADER */}
        <header className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg flex items-center justify-center text-slate-950 shrink-0">
                <Calendar className="w-5 h-5 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-tight">Agenda &amp; Gestão de Consultas</h2>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold font-mono">
                    ÍRIS AI AGENDA
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300">Controle de Confirmados (Ordem de Chegada) e Pendentes</p>
              </div>
            </div>

            {/* Mobile Exit Button */}
            <button
              onClick={onClose}
              className="sm:hidden p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
              title="Fechar Agenda"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
            {/* Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-2 rounded-xl text-xs font-bold text-white shrink-0 min-h-[40px]">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-emerald-300 font-mono font-bold focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 min-h-[40px]"
              title="Voltar ao Sistema Principal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Sistema</span>
            </button>
          </div>
        </header>

        {/* RULE BANNER: MANHÃ A PARTIR DAS 06:30 POR ORDEM DE CHEGADA */}
        <div className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-emerald-50 border-b border-amber-200/80 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
            <span>
              <strong>Regra Rígida de Atendimento:</strong> Consultas da manhã iniciam às <strong>06:30 por ordem de chegada</strong>.
              Proibido prometer horário fixo. A senha (#1, #2, #3) é gerada automaticamente no momento da confirmação.
            </span>
          </div>

          <div className="flex items-center gap-3 font-bold font-mono text-[11px] shrink-0">
            <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              🟢 {confirmedPatients.length} Confirmados
            </span>
            <span className="text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
              🟡 {pendingPatients.length} Pendentes para Ligar
            </span>
          </div>
        </div>

        {/* TABS & SEARCH BAR */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setActiveTab('confirmados')}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                activeTab === 'confirmados'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Confirmados ({confirmedPatients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pendentes')}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                activeTab === 'pendentes'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserX className="w-4 h-4" />
              <span>Pendentes ({pendingPatients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('novo')}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                activeTab === 'novo'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Marcar Consulta (Novo)</span>
            </button>
          </div>

          {/* Search Bar */}
          {activeTab !== 'novo' && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>
          )}

        </div>

        {/* TAB CONTENTS */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100/60">
          
          {/* TAB 1: PACIENTES CONFIRMADOS (ORDEM DE CHEGADA) */}
          {activeTab === 'confirmados' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-emerald-600" />
                    <span>Lista de Pacientes Confirmados • Turno da Manhã (06:30)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Ordenados rigorosamente pela Senha de Ordem de Chegada atribuída na confirmação</p>
                </div>

                <span className="text-xs text-slate-500 font-medium">
                  {filteredConfirmed.length} paciente(s) nesta lista
                </span>
              </div>

              {filteredConfirmed.length === 0 ? (
                <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">Nenhum paciente na lista de confirmados para esta data.</p>
                  <p className="text-xs text-slate-400">Vá para a aba "Pendentes para Ligar" e clique em "Marcar Consulta" para mover o paciente para cá com senha por ordem de chegada!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredConfirmed.map((p) => {
                    const cleanPhone = (p.phone || '73999998888').replace(/\D/g, '');
                    const orderNum = p.arrivalOrderNumber || 1;

                    return (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden">
                        
                        {/* Order Number Badge */}
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white font-mono font-black text-xs px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span>SENHA #{orderNum}</span>
                        </div>

                        {/* Patient info */}
                        <div className="flex items-start gap-3 pt-2">
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500/30 shrink-0"
                          />
                          <div className="pr-16">
                            <h4 className="text-sm font-black text-slate-900">{p.name}</h4>
                            <p className="text-xs font-mono font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{p.phone || '(73) 99999-0000'}</span>
                            </p>
                            <span className="inline-block text-[10px] bg-slate-100 font-semibold text-slate-600 px-2 py-0.5 rounded-full mt-1">
                              ⏰ Manhã (a partir das 06:30 por ordem de chegada)
                            </span>
                          </div>
                        </div>

                        {/* Notes / Lançamento no sistema */}
                        {p.appointmentNotes && (
                          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-700">
                            <strong>Nota Lançada:</strong> {p.appointmentNotes}
                          </div>
                        )}

                        {/* Action buttons: Direct Call & WhatsApp */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                              title="Ligar diretamente do telefone"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ligar</span>
                            </a>

                            <a
                              href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(p.name)}!%20Confirmamos%20sua%20consulta%20na%20%C3%8DrisClin%20para%20hoje%20no%20turno%20da%20manh%C3%A3%20a%20partir%20das%2006:30.%20Sua%20senha%20de%20chegada%20%C3%A9%20%23${orderNum}!`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                              <span>WhatsApp</span>
                            </a>
                          </div>

                          <button
                            onClick={() => handleUnconfirmPatient(p)}
                            className="text-[10px] text-slate-400 hover:text-amber-600 underline cursor-pointer"
                          >
                            Voltar para Pendentes
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PACIENTES PENDENTES / QUE NÃO RESPONDERAM (AGUARDANDO LIGAÇÃO) */}
          {activeTab === 'pendentes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('confirmados')}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer self-start transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-700" />
                  <span>Voltar para Pacientes Confirmados</span>
                </button>

                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-amber-600" />
                    <span>Lista de Pacientes Pendentes / Que Não Responderam</span>
                  </h3>
                  <p className="text-xs text-slate-500">Acesse o número fácil para ligar, tirar dúvidas e finalizar a confirmação para a consulta!</p>
                </div>

                <span className="text-xs text-slate-500 font-medium">
                  {filteredPending.length} paciente(s) aguardando contato
                </span>
              </div>

              {filteredPending.length === 0 ? (
                <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Excelente! Não há pacientes pendentes de confirmação nesta data.</p>
                  <p className="text-xs text-slate-400">Todos os agendamentos já foram confirmados ou você pode cadastrar um novo no botão acima.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredPending.map((p) => {
                    const cleanPhone = (p.phone || '73999998888').replace(/\D/g, '');

                    return (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative">
                        
                        <div className="flex items-start gap-3">
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400/40 shrink-0"
                          />
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{p.name}</h4>
                            <p className="text-xs font-mono font-black text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block mt-0.5">
                              📞 {p.phone || '(73) 99999-0000'}
                            </p>
                            <span className="block text-[10px] text-slate-500 font-semibold mt-1">
                              Status: <span className="text-amber-700 font-bold">Aguardando Resposta / Ligação</span>
                            </span>
                          </div>
                        </div>

                        {/* Quick Action: Confirm Button "Marcar Consulta" */}
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
                          <p className="text-[11px] text-amber-900 font-medium">
                            Ligue para o cliente e clique abaixo para lançar no sistema e atribuir a próxima senha de chegada:
                          </p>

                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>Ligar Agora</span>
                            </a>

                            <button
                              onClick={() => handleConfirmPatient(p)}
                              className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Marcar Consulta</span>
                            </button>
                          </div>
                        </div>

                        {/* WhatsApp Reminder Direct */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                          <span>Envie lembrete direto no WhatsApp:</span>
                          <a
                            href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(p.name)}!%20Aqui%20%C3%A9%20a%20%C3%8Dris%20da%20%C3%8DrisClin.%20Gostar%C3%ADamos%20de%20confirmar%20sua%20consulta%20para%20o%20turno%20da%20manh%C3%A3%20a%20partir%20das%2006:30%20por%20ordem%20de%20chegada.%20Podemos%20confirmar%3F`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3 text-teal-600" />
                            <span>Enviar Mensagem</span>
                          </a>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FORMULÁRIO MARCAR CONSULTA (NOVO LANÇAMENTO DIRETO) */}
          {activeTab === 'novo' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-600" />
                    <span>Novo Agendamento &amp; Lançamento no Sistema</span>
                  </h3>
                  <p className="text-xs text-slate-500">Cadastre o paciente e lance na agenda com geração automática da senha por ordem de chegada</p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('confirmados')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-700" />
                  <span>Voltar</span>
                </button>
              </div>

              <form onSubmit={handleCreateAndBook} className="space-y-3.5">
                
                {/* Nome do Paciente */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Nome Completo do Paciente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria das Graças Santos"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800"
                  />
                </div>

                {/* Telefone / WhatsApp */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: (73) 99876-5432"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold text-slate-800"
                  />
                </div>

                {/* Data e Turno */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">Data da Consulta</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">Turno de Atendimento</label>
                    <select
                      value={newShift}
                      onChange={(e) => setNewShift(e.target.value as any)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      <option value="Manhã (a partir das 06:30)">☀️ Manhã (A partir das 06:30)</option>
                      <option value="Tarde">🌤️ Tarde</option>
                    </select>
                  </div>
                </div>

                {/* Observações / Notas do Agendamento */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Observações no Prontuário / Sistema</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Dificuldade de enxergar de perto. Pediu confirmação antecipada."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-800"
                  />
                </div>

                {/* Auto Confirm Checkbox */}
                <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoconfirm"
                      checked={autoConfirm}
                      onChange={(e) => setAutoConfirm(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="autoconfirm" className="text-xs font-bold text-indigo-950 cursor-pointer">
                      Confirmar Imediatamente e Atribuir Senha de Chegada
                    </label>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-mono font-bold">Marcar Consulta</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Finalizar Lançamento &amp; Marcar Consulta</span>
                </button>

              </form>
            </div>
          )}

        </main>

        {/* MODAL FOOTER */}
        <footer className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold shrink-0">
          <div className="flex items-center gap-3">
            <span>Data Selecionada: <strong className="font-mono text-slate-900">{selectedDate.split('-').reverse().join('/')}</strong></span>
            <span>Total na Agenda: <strong>{datePatients.length}</strong></span>
          </div>

          <span className="text-slate-500 text-[11px]">
            ÍrisClin Intelligent Agenda • Atendimento por Ordem de Chegada
          </span>
        </footer>

      </div>
    </div>
  );
}
