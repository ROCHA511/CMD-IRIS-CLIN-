import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  X, 
  User, 
  Phone, 
  Calendar, 
  ChevronRight, 
  Plus, 
  ShieldCheck, 
  CreditCard, 
  Sparkles,
  ClipboardList,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { Patient } from '../types';

interface PatientListModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onAddNewPatient?: () => void;
}

export default function PatientListModal({
  isOpen,
  onClose,
  patients,
  onSelectPatient,
  onAddNewPatient
}: PatientListModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  if (!isOpen) return null;

  // Filter patients by Name or CPF
  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = p.name.toLowerCase().includes(q);
    const cpfMatch = p.cpf ? p.cpf.toLowerCase().includes(q) : false;
    const phoneMatch = p.phone ? p.phone.toLowerCase().includes(q) : false;
    const matchesSearch = q === '' || nameMatch || cpfMatch || phoneMatch;

    const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePatientClick = (id: string) => {
    onSelectPatient(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* MODAL HEADER - Bloquinho de Notas / Relação de Clientes */}
        <header className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 p-0.5 shadow-lg flex items-center justify-center text-slate-950 font-bold shrink-0">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Relação de Clientes</h2>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                    {patients.length} Cadastrados
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300">Toque em qualquer paciente para abrir o prontuário</p>
              </div>
            </div>

            {/* Mobile Close X Button */}
            <button
              onClick={onClose}
              className="sm:hidden p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
              title="Fechar Bloquinho de Notas"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            {onAddNewPatient && (
              <button
                onClick={() => {
                  onClose();
                  onAddNewPatient();
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Paciente</span>
              </button>
            )}

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

        {/* SEARCH QUADRO - Digitar por Nome ou CPF */}
        <div className="p-4 bg-slate-100/90 border-b border-slate-200 shrink-0 space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-amber-600" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o Nome ou CPF do paciente para buscar na relação..."
              className="w-full pl-10 pr-10 py-3 bg-white border-2 border-amber-500/30 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* STATUS QUICK FILTERS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1">Filtrar:</span>
            {['Todos', 'Ativo', 'Exame Vencido', 'Aguardando Medicação', 'Em Pós-Operatório'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-xl font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-slate-900 text-amber-400 shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* PATIENTS GRID / LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-3">
          {filteredPatients.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800">Nenhum paciente encontrado</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Não encontramos nenhum registro referente à busca "{searchQuery}". Verifique o nome ou CPF digitado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPatients.map((patient) => {
                return (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientClick(patient.id)}
                    className="p-4 bg-white hover:bg-amber-50/50 rounded-2xl border border-slate-200 hover:border-amber-400/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar */}
                      <img
                        src={patient.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                        alt={patient.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-100 group-hover:border-amber-400 shadow-xs shrink-0"
                      />

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-900 truncate">
                            {patient.name}
                          </h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                            patient.appointmentStatus === 'Confirmado'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {patient.appointmentStatus || 'Agendado'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 font-medium">
                          <span className="font-mono text-slate-700 font-semibold">CPF: {patient.cpf || 'Não Informado'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {patient.phone}
                          </span>
                        </div>

                        {patient.lastExamDate && (
                          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-600" />
                            Último Exame: <span className="font-bold text-slate-600">{patient.lastExamDate}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pl-2 shrink-0 flex items-center gap-1 text-amber-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
                      <span className="hidden sm:inline text-[11px]">Ver Ficha</span>
                      <ChevronRight className="w-5 h-5 text-amber-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <footer className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold shrink-0">
          <div className="flex items-center gap-2 text-slate-700">
            <ClipboardList className="w-4 h-4 text-amber-600" />
            <span>Mostrando {filteredPatients.length} de {patients.length} pacientes</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            Fechar Relação
          </button>
        </footer>

      </div>
    </div>
  );
}
