import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  X, 
  User, 
  Phone, 
  ChevronRight, 
  MessageSquare, 
  Sparkles,
  Search,
  Filter,
  Check,
  Building2,
  List,
  ArrowLeft
} from 'lucide-react';
import { Patient } from '../types';

interface WeeklyConfirmedAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onOpenWhatsAppPreview?: () => void;
}

export default function WeeklyConfirmedAgendaModal({
  isOpen,
  onClose,
  patients,
  onSelectPatient,
  onOpenWhatsAppPreview
}: WeeklyConfirmedAgendaModalProps) {
  const [selectedDayTab, setSelectedDayTab] = useState<string>('Segunda');

  if (!isOpen) return null;

  // Filter patients that are confirmed or scheduled for the week
  const confirmedPatients = patients.filter(p => p.appointmentStatus === 'Confirmado');
  const allScheduledPatients = patients;

  // Mock days of week for schedule
  const weekDays = [
    { key: 'Segunda', label: 'Segunda-Feira', dateStr: '20/07/2026' },
    { key: 'Terça', label: 'Terça-Feira', dateStr: '21/07/2026' },
    { key: 'Quarta', label: 'Quarta-Feira', dateStr: '22/07/2026' },
    { key: 'Quinta', label: 'Quinta-Feira', dateStr: '23/07/2026' },
    { key: 'Sexta', label: 'Sexta-Feira', dateStr: '24/07/2026' },
    { key: 'Sábado', label: 'Sábado', dateStr: '25/07/2026' },
  ];

  const handlePatientClick = (id: string) => {
    onSelectPatient(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* MODAL HEADER - RELOGINHO WEEKLY CONFIRMED AGENDA */}
        <header className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-teal-400 to-emerald-500 p-0.5 shadow-lg flex items-center justify-center text-slate-950 font-bold shrink-0">
                <Clock className="w-5 h-5 text-slate-950 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Agenda Semanal • Confirmados</h2>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    {confirmedPatients.length} CONFIRMADOS
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300">Relação completa de horários e senhas por ordem de chegada</p>
              </div>
            </div>

            {/* Mobile Close X Button */}
            <button
              onClick={onClose}
              className="sm:hidden p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
              title="Fechar Agenda Semanal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md min-h-[40px]"
              title="Voltar ao Sistema Principal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Sistema</span>
            </button>
          </div>
        </header>

        {/* DAYS OF WEEK NAVIGATION TABS */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-2">
          {weekDays.map((day) => (
            <button
              key={day.key}
              onClick={() => setSelectedDayTab(day.key)}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[44px] ${
                selectedDayTab === day.key
                  ? 'bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{day.label}</span>
              <span className="text-[10px] opacity-80 font-mono">({day.dateStr})</span>
            </button>
          ))}
        </div>

        {/* CONTENT AREA: LIST OF CONFIRMED PATIENTS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Atendimentos da Manhã: Ordem de chegada a partir das 06:30 h</span>
            </div>
            <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono text-[10px]">
              Turno Ativo
            </span>
          </div>

          {confirmedPatients.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-dashed border-slate-300">
              <Clock className="w-10 h-10 text-slate-400 mb-2" />
              <h4 className="text-sm font-extrabold text-slate-800">Nenhum agendamento confirmado</h4>
              <p className="text-xs text-slate-500 mt-1">
                Não há agendamentos confirmados para esta data específica.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {confirmedPatients.map((patient, index) => (
                <div
                  key={patient.id}
                  onClick={() => handlePatientClick(patient.id)}
                  className="p-4 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200 hover:border-sky-400 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      #{index + 1}
                    </div>

                    <img
                      src={patient.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={patient.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-100 group-hover:border-sky-400 shrink-0"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-sky-900 truncate">
                          {patient.name}
                        </h4>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3 text-emerald-600" />
                          CONFIRMADO
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500 font-medium">
                        <span className="font-mono text-slate-700 font-semibold">CPF: {patient.cpf || 'Não Informado'}</span>
                        <span>•</span>
                        <span>Tel: {patient.phone}</span>
                        <span>•</span>
                        <span className="text-teal-700 font-bold">Procedimento: Consulta Oftalmológica</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                    <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-xl font-mono">
                      06:30h (Chegada)
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePatientClick(patient.id);
                      }}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <span>Abrir Ficha</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold shrink-0">
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Exibindo {confirmedPatients.length} pacientes confirmados na semana</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            Voltar ao Sistema
          </button>
        </footer>

      </div>
    </div>
  );
}
