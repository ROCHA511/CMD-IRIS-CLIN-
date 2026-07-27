import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  FileText, 
  Download, 
  Clock, 
  User as UserIcon, 
  Eye, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Stethoscope,
  Activity,
  ChevronRight,
  ShieldCheck,
  Building2,
  Printer
} from 'lucide-react';
import { User, Patient, PatientDocument } from '../types';

interface PatientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  patientData?: Patient;
}

export default function PatientPortalModal({
  isOpen,
  onClose,
  currentUser,
  patientData
}: PatientPortalModalProps) {
  const [activeTab, setActiveTab] = useState<'consultas' | 'exames' | 'receitas' | 'perfil'>('consultas');
  
  // Agendamento State
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShift, setSelectedShift] = useState<'Manhã' | 'Tarde'>('Manhã');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Profile Edit State
  const [nome, setNome] = useState(currentUser?.nome || 'João da Silva');
  const [email, setEmail] = useState(currentUser?.email || 'joao.silva@gmail.com');
  const [telefone, setTelefone] = useState(currentUser?.telefone || '(71) 98765-4321');
  const [cpf, setCpf] = useState(currentUser?.cpf || '987.654.321-00');
  const [profileSaved, setProfileSaved] = useState(false);

  if (!isOpen) return null;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      alert(`Consulta solicitada com sucesso para ${selectedDate} (${selectedShift})! A recepção da Íris Clin confirmará em breve.`);
    }, 1200);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const sampleDocuments: PatientDocument[] = [
    {
      id: 'doc_1',
      type: 'receita',
      title: 'Receita de Lentes de Contato & Óculos',
      category: 'Receita Médica',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
      date: '20/07/2026',
      doctorName: 'Dr. Augusto Faro (CRM/BA 81.047)',
      notes: 'Esférico OD: -1.50, OE: -1.50. Adição: 0.00. Lentes Antirreflexo + BlueControl.'
    },
    {
      id: 'doc_2',
      type: 'exame',
      title: 'Topografia Ocular Computadorizada',
      category: 'Exame Diagnóstico',
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
      date: '15/07/2026',
      doctorName: 'Dr. Augusto Faro',
      notes: 'Curvatura corneana regular dentro dos padrões anatômicos normais.'
    },
    {
      id: 'doc_3',
      type: 'outro',
      title: 'Laudo Oftalmológico Completo',
      category: 'Laudo Médico',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
      date: '10/06/2026',
      doctorName: 'Dr. Augusto Faro',
      notes: 'Pressão intraocular 14 mmHg AO. Fundo de olho preservado.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <header className="px-6 py-4 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-sky-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-400/20 border border-sky-400/40 text-sky-300 flex items-center justify-center font-black">
              <UserIcon className="w-6 h-6 text-sky-300" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>PORTAL DO PACIENTE</span>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-extrabold">
                  ÍRIS CLIN
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Olá, <strong className="text-white">{currentUser?.nome || 'Paciente'}</strong>! Acompanhe suas consultas, laudos e receitas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* NAVIGATION TABS */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('consultas')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'consultas' ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Minhas Consultas &amp; Agendar</span>
          </button>

          <button
            onClick={() => setActiveTab('exames')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'exames' ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Exames &amp; Laudos</span>
          </button>

          <button
            onClick={() => setActiveTab('receitas')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'receitas' ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Receitas Médicas</span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'perfil' ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Meus Dados Pessoais</span>
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">

          {/* TAB 1: CONSULTAS & AGENDAMENTO */}
          {activeTab === 'consultas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* AGENDAR NOVA CONSULTA */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sky-900 border-b border-slate-100 pb-3">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <h3 className="font-black text-sm">Agendar Nova Consulta</h3>
                </div>

                {bookingSuccess && (
                  <div className="p-3 bg-emerald-100 text-emerald-900 text-xs font-black rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Solicitação de agendamento enviada!</span>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-black text-slate-700 uppercase">Data Desejada</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 mt-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-black text-slate-700 uppercase">Turno de Preferência</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedShift('Manhã')}
                        className={`py-2 px-3 rounded-xl font-black border transition-all ${
                          selectedShift === 'Manhã' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Manhã (a partir das 06:30)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedShift('Tarde')}
                        className={`py-2 px-3 rounded-xl font-black border transition-all ${
                          selectedShift === 'Tarde' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Tarde
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-black text-slate-700 uppercase">Médico Preferencial</label>
                    <div className="p-3 bg-slate-100 rounded-xl font-bold text-slate-800 flex items-center gap-2 mt-1">
                      <Stethoscope className="w-4 h-4 text-sky-600" />
                      <span>Dr. Augusto Faro (Oftalmologia / Refração)</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl shadow-md cursor-pointer transition-all uppercase"
                  >
                    SOLICITAR AGENDAMENTO
                  </button>
                </form>
              </div>

              {/* HISTÓRICO DE CONSULTAS */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-sm">Minhas Consultas Agendadas</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-sky-900">Consulta de Rotina &amp; Grau</span>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md">
                        CONFIRMADO
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-bold">Data: Hoje, 25/07/2026 • Turno: Manhã (07:30)</p>
                    <p className="text-[11px] text-slate-500">Médico: Dr. Augusto Faro • Chegada por Ordem de Senha</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 opacity-80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">Mapeamento de Retina &amp; Refração</span>
                      <span className="text-[10px] font-black bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                        CONCLUÍDO
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-bold">Data: 10/06/2026</p>
                    <p className="text-[11px] text-slate-500">Médico: Dr. Augusto Faro</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EXAMES & LAUDOS */}
          {activeTab === 'exames' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm">Documentos, Exames &amp; Laudos Médicos Oculares</h3>
                <span className="text-xs text-slate-500 font-bold">Disponíveis para visualização e download em PDF</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleDocuments.filter(d => d.type === 'exame' || d.type === 'outro').map(doc => (
                  <div key={doc.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                          {doc.category}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm mt-1">{doc.title}</h4>
                        <p className="text-[11px] text-slate-500">Emitido em: {doc.date} • {doc.doctorName}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      "{doc.notes}"
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => alert(`Baixando PDF de ${doc.title}...`)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar PDF</span>
                      </button>

                      <button
                        onClick={() => window.open(doc.imageUrl, '_blank')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RECEITAS MÉDICAS */}
          {activeTab === 'receitas' && (
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 text-sm">Receitas de Grau &amp; Prescrições de Lentes</h3>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-base">Receita Ocular Vigente</h4>
                    <p className="text-xs text-slate-500">Emitida em 20/07/2026 por Dr. Augusto Faro</p>
                  </div>
                  <button
                    onClick={() => alert('Baixando PDF da Receita Ocular...')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Receita PDF</span>
                  </button>
                </div>

                {/* OPTICAL MATRIX TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-black">
                        <th className="p-2 text-left rounded-tl-xl">OLHO</th>
                        <th className="p-2">ESFÉRICO (SPH)</th>
                        <th className="p-2">CILÍNDRICO (CYL)</th>
                        <th className="p-2">EIXO</th>
                        <th className="p-2 rounded-tr-xl">DNP (mm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-bold text-slate-800">
                      <tr>
                        <td className="p-2.5 text-left font-black text-sky-900 bg-sky-50">OD (Direito)</td>
                        <td className="p-2.5">-1.50</td>
                        <td className="p-2.5">-0.50</td>
                        <td className="p-2.5">90°</td>
                        <td className="p-2.5">32.0</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-left font-black text-indigo-900 bg-indigo-50">OE (Esquerdo)</td>
                        <td className="p-2.5">-1.50</td>
                        <td className="p-2.5">-0.50</td>
                        <td className="p-2.5">90°</td>
                        <td className="p-2.5">32.0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl">
                  Tratamentos recomendados: Lentes com Filtro Antirreflexo Premium + Proteção BlueControl contra luz de telas.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEUS DADOS PESSOAIS */}
          {activeTab === 'perfil' && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
              <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">
                Atualizar Dados Cadastrais
              </h3>

              {profileSaved && (
                <div className="p-3 bg-emerald-100 text-emerald-900 text-xs font-black rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Seus dados foram atualizados com sucesso!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="font-black text-slate-700 uppercase">Nome Completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-black text-slate-700 uppercase">CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-black text-slate-700 uppercase">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-black text-slate-700 uppercase">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase rounded-xl cursor-pointer"
                >
                  SALVAR ALTERAÇÕES
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
