import React, { useState } from 'react';
import { 
  X, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Bot, 
  Award, 
  Filter, 
  Download, 
  BarChart3, 
  Sparkles,
  PhoneCall,
  CalendarCheck
} from 'lucide-react';

interface TeamPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TeamMemberStats {
  id: string;
  name: string;
  role: string;
  avatar: string;
  appointmentsTotal: number;
  confirmedCount: number;
  confirmationRate: number;
  avgResponseMinutes: number;
  revenueGenerated: number;
  isAiBot?: boolean;
}

export default function TeamPerformanceModal({
  isOpen,
  onClose
}: TeamPerformanceModalProps) {
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes'>('semana');

  if (!isOpen) return null;

  const teamData: TeamMemberStats[] = [
    {
      id: 'iris-ai',
      name: 'Íris (IA Assistente Virtual)',
      role: 'Atendimento & Pré-Consulta Automatizado',
      avatar: '🤖',
      appointmentsTotal: 184,
      confirmedCount: 177,
      confirmationRate: 96.2,
      avgResponseMinutes: 0.1,
      revenueGenerated: 26550,
      isAiBot: true
    },
    {
      id: 'ana-silva',
      name: 'Ana Silva',
      role: 'Recepcionista Principal',
      avatar: '👩‍💼',
      appointmentsTotal: 94,
      confirmedCount: 86,
      confirmationRate: 91.5,
      avgResponseMinutes: 3.2,
      revenueGenerated: 12900
    },
    {
      id: 'juliana-lima',
      name: 'Juliana Lima',
      role: 'Secretária de Agendamentos',
      avatar: '👩‍⚕️',
      appointmentsTotal: 78,
      confirmedCount: 73,
      confirmationRate: 93.6,
      avgResponseMinutes: 4.0,
      revenueGenerated: 10950
    },
    {
      id: 'carlos-eduardo',
      name: 'Carlos Eduardo',
      role: 'Atendente de Caixa & Ótica',
      avatar: '👨‍💼',
      appointmentsTotal: 62,
      confirmedCount: 54,
      confirmationRate: 87.1,
      avgResponseMinutes: 5.4,
      revenueGenerated: 8100
    }
  ];

  const totalAppointments = teamData.reduce((acc, curr) => acc + curr.appointmentsTotal, 0);
  const totalConfirmed = teamData.reduce((acc, curr) => acc + curr.confirmedCount, 0);
  const overallRate = ((totalConfirmed / totalAppointments) * 100).toFixed(1);
  const totalRevenue = teamData.reduce((acc, curr) => acc + curr.revenueGenerated, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* HEADER */}
        <header className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Desempenho da Equipe &amp; Taxa de Confirmação</h2>
                <span className="text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                  MÉTRICAS DA CLÍNICA
                </span>
              </div>
              <p className="text-xs text-slate-300">Acompanhamento em tempo real das taxas de resposta e agendamentos confirmados</p>
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

        {/* CONTROLS BAR */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setPeriod('hoje')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                period === 'hoje' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriod('semana')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                period === 'semana' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriod('mes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                period === 'mes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Este Mês
            </button>
          </div>

          <div className="text-xs font-extrabold text-slate-600 flex items-center gap-2">
            <span>Meta de Confirmação: <strong className="text-emerald-600 font-black">90%</strong></span>
            <span>• Status Geral: <strong className="text-emerald-600 font-black">Acima da Meta (+3.2%)</strong></span>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">

          {/* TOP METRICS SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-extrabold uppercase">Taxa de Confirmação</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{overallRate}%</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +4.2% em relação à semana passada
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-extrabold uppercase">Consultas Agendadas</span>
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{totalConfirmed} / {totalAppointments}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {totalAppointments - totalConfirmed} pendentes / reagendados
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-extrabold uppercase">Tempo de Resposta</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">2.1 min</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Média geral com auxílio da Íris Bot
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-extrabold uppercase">Receita Confirmada</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                R$ {totalRevenue.toLocaleString('pt-BR')}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Estimativa de receita garantida
              </p>
            </div>

          </div>

          {/* TEAM MEMBERS DETAILED TABLE / CARDS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Desempenho Individual por Atendente &amp; IA</span>
              </h3>
              <span className="text-xs font-extrabold text-slate-500">Ordenado por % de Eficiência</span>
            </div>

            <div className="space-y-3">
              {teamData.map((member) => (
                <div 
                  key={member.id} 
                  className={`p-4 rounded-2xl border transition-all ${
                    member.isAiBot 
                      ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-amber-300 ring-1 ring-amber-400/40' 
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* MEMBER INFO */}
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                        member.isAiBot ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-white border border-slate-200'
                      }`}>
                        {member.avatar}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{member.name}</h4>
                          {member.isAiBot && (
                            <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3 fill-slate-950" /> IA Co-piloto
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{member.role}</p>
                      </div>
                    </div>

                    {/* METRICS NUMBERS */}
                    <div className="grid grid-cols-3 gap-4 text-left sm:text-right">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Confirmados</p>
                        <p className="text-sm font-black text-slate-900">{member.confirmedCount} / {member.appointmentsTotal}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Tempo Resposta</p>
                        <p className="text-sm font-black text-slate-900">{member.avgResponseMinutes} min</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Taxa Confirmação</p>
                        <p className="text-sm font-black text-emerald-600">{member.confirmationRate}%</p>
                      </div>
                    </div>

                  </div>

                  {/* PROGRESS BAR */}
                  <div className="mt-3 space-y-1">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          member.confirmationRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${member.confirmationRate}%` }}
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* AUTOMATION INSIGHT BANNER */}
          <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl flex items-start gap-3 shadow-md">
            <Award className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="text-amber-300 font-extrabold block text-sm mb-0.5">Destaque de Eficiência Operacional:</strong>
              A inclusão do lembrete automático de WhatsApp com a Íris reduziu o absenteísmo na clínica em <strong>38%</strong> neste mês. As rotas por ordem de chegada com lembrete às 06:30 da manhã aumentaram o preenchimento de vagas da manhã para 98%.
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <footer className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 hidden sm:inline font-bold">Relatório exportável em PDF e Excel</span>
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
