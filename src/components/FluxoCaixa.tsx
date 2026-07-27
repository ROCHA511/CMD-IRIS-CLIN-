import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  User, 
  Download, 
  X, 
  RefreshCw,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CreditCard,
  QrCode,
  Banknote,
  Building2,
  Receipt,
  ArrowLeft,
  Lock,
  Unlock,
  Power
} from 'lucide-react';
import { Patient, Transaction } from '../types';
import FluxoCaixaPdfModal from './FluxoCaixaPdfModal';

interface FluxoCaixaProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onUpdateRevenue?: (newRevenue: number) => void;
}

// REAL CLINIC DATASET - 21/07/2026
const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 'tx-21-0', date: '2026-07-21', numDocumento: '', description: 'Caixa Anterior', amount: 786.45, type: 'entrada', category: 'Saldo Inicial', status: 'pago', formaPagamento: 'Dinheiro', formaPagamentoId: 1 },
  { id: 'tx-21-1', date: '2026-07-21', numDocumento: '1894', description: 'Vilma Conceição d. S', amount: 100.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Dinheiro', formaPagamentoId: 1 },
  { id: 'tx-21-2', date: '2026-07-21', numDocumento: '1895', description: 'Nataly Souza Sales', amount: 600.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-3', date: '2026-07-21', numDocumento: '2290', description: 'Maria Jose Con. dos Santos', amount: 1070.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-4', date: '2026-07-21', numDocumento: '1897', description: 'Nilza de Jesus Fontes', amount: 750.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-5', date: '2026-07-21', numDocumento: '1898', description: 'Lucinete Souza de Conc', amount: 400.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-6', date: '2026-07-21', numDocumento: '1899', description: 'Jose Nivaldo da Conc', amount: 1100.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-7', date: '2026-07-21', numDocumento: '1900', description: 'Alessandra d Conceição S.', amount: 350.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Pix', formaPagamentoId: 2 },
  { id: 'tx-21-8', date: '2026-07-21', numDocumento: '2293', description: 'Renilza Conceição d. S.', amount: 1330.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-9', date: '2026-07-21', numDocumento: '1992', description: 'Almirene de Jesus Sant', amount: 200.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Pix', formaPagamentoId: 2 },
  { id: 'tx-21-10', date: '2026-07-21', numDocumento: '1903', description: 'Irenilde de Jesus Fer', amount: 500.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Pix', formaPagamentoId: 2 },
  { id: 'tx-21-11', date: '2026-07-21', numDocumento: '1904', description: 'Maria Raimunda J. d. S.', amount: 500.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-12', date: '2026-07-21', numDocumento: '1905', description: 'Celiandra Nery d. S.', amount: 150.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-13', date: '2026-07-21', numDocumento: '1905', description: 'Celiandra Nery d. S.', amount: 800.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-14', date: '2026-07-21', numDocumento: '1906', description: 'Sandra Conceição d. Pl', amount: 100.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Dinheiro', formaPagamentoId: 1 },
  { id: 'tx-21-15', date: '2026-07-21', numDocumento: '2296', description: 'Ronaldo Silva d. Conc', amount: 670.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-16', date: '2026-07-21', numDocumento: '1907', description: 'Karoline dos Santos R.', amount: 780.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-17', date: '2026-07-21', numDocumento: '1908', description: 'Dailane dos Santos Nasc', amount: 200.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-18', date: '2026-07-21', numDocumento: '2298', description: 'Wilson Conceição d. J.', amount: 600.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-19', date: '2026-07-21', numDocumento: '1911', description: 'Edneia Gomes dos Santos', amount: 400.00, type: 'entrada', category: 'Vendas', status: 'pago', formaPagamento: 'Cartão (cc)', formaPagamentoId: 3 },
  { id: 'tx-21-20', date: '2026-07-21', numDocumento: '', description: 'Despesa Café', amount: 24.20, type: 'saida', category: 'Despesas', status: 'pago', formaPagamento: 'Dinheiro', formaPagamentoId: 1 },
  { id: 'tx-21-21', date: '2026-07-21', numDocumento: '', description: 'Depósito Efetuado (Ontem)', amount: 600.00, type: 'saida', category: 'Bancário', status: 'pago', formaPagamento: 'Dinheiro', formaPagamentoId: 1 }
];

export default function FluxoCaixa({ isOpen, onClose, patients, onUpdateRevenue }: FluxoCaixaProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('irisclin_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return DEFAULT_TRANSACTIONS;
      }
    }
    return DEFAULT_TRANSACTIONS;
  });

  // Cash Register Open/Close state
  const [isCaixaAberto, setIsCaixaAberto] = useState<boolean>(() => {
    const saved = localStorage.getItem('irisclin_caixa_aberto');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [caixaAbertoHora, setCaixaAbertoHora] = useState<string>(() => {
    return localStorage.getItem('irisclin_caixa_aberto_hora') || 'Hoje, 08:00';
  });

  const [caixaFechadoHora, setCaixaFechadoHora] = useState<string>(() => {
    return localStorage.getItem('irisclin_caixa_fechado_hora') || '';
  });

  // Easy Quick Form states
  const [numDocumento, setNumDocumento] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'entrada' | 'saida'>('entrada');
  const [category, setCategory] = useState('Vendas');
  const [formaPagamento, setFormaPagamento] = useState<'Dinheiro' | 'Pix' | 'Cartão (cc)' | 'Bancário / Depósito'>('Cartão (cc)');
  const [status, setStatus] = useState<'pago' | 'pendente'>('pago');
  const [txDate, setTxDate] = useState('2026-07-21');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [paymentFilter, setPaymentFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pago' | 'pendente'>('todos');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('irisclin_transactions', JSON.stringify(transactions));
    localStorage.setItem('irisclin_caixa_aberto', JSON.stringify(isCaixaAberto));
    localStorage.setItem('irisclin_caixa_aberto_hora', caixaAbertoHora);
    localStorage.setItem('irisclin_caixa_fechado_hora', caixaFechadoHora);
    
    // Sync total paid 'entradas' to main dashboard
    if (onUpdateRevenue) {
      const todayPaidEntradas = transactions
        .filter(t => t.type === 'entrada' && t.status === 'pago')
        .reduce((sum, t) => sum + t.amount, 0);
      onUpdateRevenue(todayPaidEntradas);
    }
  }, [transactions, isCaixaAberto, caixaAbertoHora, caixaFechadoHora, onUpdateRevenue]);

  if (!isOpen) return null;

  // CÁLCULOS DO CAIXA (RELATIONAL QUERIES EQUIVALENT)
  const totalEntradasRealizadas = transactions
    .filter(t => t.type === 'entrada' && t.status === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaidasRealizadas = transactions
    .filter(t => t.type === 'saida' && t.status === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  const saldoLiquido = totalEntradasRealizadas - totalSaidasRealizadas;

  const totalEntradasPendentes = transactions
    .filter(t => t.type === 'entrada' && t.status === 'pendente')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaidasPendentes = transactions
    .filter(t => t.type === 'saida' && t.status === 'pendente')
    .reduce((acc, t) => acc + t.amount, 0);

  // QUERY A: Total Faturamento por Meio de Pagamento (Excluindo 'Caixa Anterior')
  const faturamentoVendas = transactions.filter(t => t.type === 'entrada' && t.status === 'pago' && t.description !== 'Caixa Anterior');
  
  const totalCartao = faturamentoVendas.filter(t => t.formaPagamento === 'Cartão (cc)').reduce((a, b) => a + b.amount, 0);
  const totalPix = faturamentoVendas.filter(t => t.formaPagamento === 'Pix').reduce((a, b) => a + b.amount, 0);
  const totalDinheiroVendas = faturamentoVendas.filter(t => t.formaPagamento === 'Dinheiro').reduce((a, b) => a + b.amount, 0);
  const totalBancario = faturamentoVendas.filter(t => t.formaPagamento === 'Bancário / Depósito').reduce((a, b) => a + b.amount, 0);

  // QUERY B: Fechamento Final em Dinheiro na Gaveta
  // (Entradas em Dinheiro) - (Saídas em Dinheiro)
  const entradasDinheiroComCaixa = transactions
    .filter(t => t.type === 'entrada' && t.status === 'pago' && t.formaPagamento === 'Dinheiro')
    .reduce((a, b) => a + b.amount, 0);

  const saidasDinheiro = transactions
    .filter(t => t.type === 'saida' && t.status === 'pago' && t.formaPagamento === 'Dinheiro')
    .reduce((a, b) => a + b.amount, 0);

  const saldoDinheiroGaveta = entradasDinheiroComCaixa - saidasDinheiro;

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.numDocumento && t.numDocumento.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (t.patientName && t.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'todos' || t.type === typeFilter;
    const matchesPayment = paymentFilter === 'todos' || t.formaPagamento === paymentFilter;
    const matchesStatus = statusFilter === 'todos' || t.status === statusFilter;

    return matchesSearch && matchesType && matchesPayment && matchesStatus;
  });

  const getFormaPagamentoId = (forma: string): number => {
    switch (forma) {
      case 'Dinheiro': return 1;
      case 'Pix': return 2;
      case 'Cartão (cc)': return 3;
      case 'Bancário / Depósito': return 4;
      default: return 1;
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCaixaAberto) {
      if (confirm('O Caixa está FECHADO para lançamentos. Deseja ABRIR O CAIXA ZERADO agora?')) {
        handleAbrirCaixaZerado();
      }
      return;
    }

    if (!description.trim() || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    let patientName = '';
    if (selectedPatientId) {
      const pat = patients.find(p => p.id === selectedPatientId);
      if (pat) patientName = pat.name;
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      numDocumento: numDocumento.trim() || undefined,
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
      date: txDate,
      status,
      formaPagamento,
      formaPagamentoId: getFormaPagamentoId(formaPagamento),
      patientId: selectedPatientId || undefined,
      patientName: patientName || undefined
    };

    setTransactions(prev => [newTx, ...prev]);

    // Reset Form
    setNumDocumento('');
    setDescription('');
    setAmount('');
    setSelectedPatientId('');
    setStatus('pago');
  };

  const handleAbrirCaixaZerado = () => {
    const hasTransactions = transactions.length > 0;
    const confirmMsg = hasTransactions 
      ? 'Deseja ABRIR UM NOVO CAIXA ZERADO para o dia de hoje?\n\nOs lançamentos do caixa anterior serão encerrados/zerados para dar início às operações do novo dia.'
      : 'Deseja ABRIR O CAIXA ZERADO com R$ 0,00 aguardando os lançamentos do dia?';

    if (confirm(confirmMsg)) {
      const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const todayStr = new Date().toISOString().split('T')[0];

      setTransactions([]);
      setIsCaixaAberto(true);
      setCaixaAbertoHora(`Hoje às ${nowTime}`);
      setCaixaFechadoHora('');
      setTxDate(todayStr);

      alert(`✅ CAIXA ABERTO COM SUCESSO!\n\n• Status: Aberto com valores ZERADOS (R$ 0,00)\n• Horário de Abertura: ${nowTime}\n• Aprovado para novos lançamentos diários.`);
    }
  };

  const handleFecharCaixaDia = () => {
    if (!isCaixaAberto) {
      alert('O caixa já se encontra FECHADO.');
      return;
    }

    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const totalLiquidoStr = saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const dineroGavetaStr = saldoDinheiroGaveta.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    const confirmMsg = `🔒 CONFIRMAÇÃO DE FECHAMENTO DE CAIXA DO DIA\n\nResumo Final das Operações:\n• Total de Movimentações: ${transactions.length}\n• Saldo Líquido do Dia: R$ ${totalLiquidoStr}\n• Dinheiro em Gaveta: R$ ${dineroGavetaStr}\n• Total Recebido em Cartão: R$ ${totalCartao.toFixed(2)}\n• Total Recebido em Pix: R$ ${totalPix.toFixed(2)}\n\nDeseja encerrar e fechar o caixa agora?`;

    if (confirm(confirmMsg)) {
      setIsCaixaAberto(false);
      setCaixaFechadoHora(`Hoje às ${nowTime}`);
      alert(`🔒 CAIXA FECHADO COM SUCESSO!\n\n• Horário de Encerramento: ${nowTime}\n• Saldo Líquido Final: R$ ${totalLiquidoStr}\n\nO caixa foi encerrado para novas entradas. Clique em "Abrir Caixa (Zerado)" quando for iniciar o próximo dia de trabalho.`);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Deseja realmente excluir este lançamento do caixa?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Deseja recarregar o lançamento padrão do caixa com os dados reais do dia 21/07/2026?')) {
      setTransactions(DEFAULT_TRANSACTIONS);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-6xl h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* HEADER */}
        <header className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                    Caixa &amp; Financeiro
                  </h2>
                  {isCaixaAberto ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-extrabold font-mono flex items-center gap-1 shadow-xs">
                      <Unlock className="w-3 h-3 text-emerald-400" /> ABERTO ({caixaAbertoHora})
                    </span>
                  ) : (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-extrabold font-mono flex items-center gap-1 shadow-xs">
                      <Lock className="w-3 h-3 text-rose-400" /> FECHADO ({caixaFechadoHora || 'Encerrado'})
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300">Lançamento de entradas e saídas com fechamento por Pix, Cartão e Dinheiro</p>
              </div>
            </div>

            {/* Mobile Close X Button */}
            <button
              onClick={onClose}
              className="sm:hidden p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
              title="Sair / Fechar Caixa"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
            
            {/* BOTÃO ABRIR CAIXA ZERADO */}
            <button
              onClick={handleAbrirCaixaZerado}
              className="px-3.5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 border border-emerald-300/60 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105 shrink-0 min-h-[40px]"
              title="Abrir um novo caixa zerado (R$ 0,00) para iniciar as movimentações do dia"
            >
              <Unlock className="w-4 h-4 text-slate-950" />
              <span>Abrir Caixa (Zerado)</span>
            </button>

            {/* BOTÃO FECHAR CAIXA DO DIA */}
            <button
              onClick={handleFecharCaixaDia}
              className={`px-3.5 py-2 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 min-h-[40px] ${
                isCaixaAberto
                  ? 'bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 hover:from-rose-500 hover:to-amber-600 text-white border border-rose-400/40 hover:scale-105'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 opacity-60 cursor-not-allowed'
              }`}
              title="Encerrar o caixa e consolidar o fechamento do dia"
            >
              <Lock className="w-4 h-4" />
              <span>Fechar Caixa</span>
            </button>

            <button 
              onClick={handleResetToDefaults}
              className="px-2.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-1 transition-all cursor-pointer shrink-0 min-h-[40px]"
              title="Carregar modelo de dados do dia 21/07/2026"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Modelo 21/07</span>
            </button>

            <button 
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 min-h-[40px]"
              title="Gerar Relatório PDF com Demonstrativo de Formas de Pagamento"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-200" />
              <span>Relatório PDF</span>
            </button>

            <button 
              onClick={onClose}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 min-h-[40px]"
              title="Retornar para o Sistema Principal ÍrisClin"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Sistema</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">
          
          {/* LEFT SIDEBAR: QUICK FORM & REAL-TIME QUERIES */}
          <section className="w-full lg:w-96 border-r border-slate-200 bg-white p-5 flex flex-col gap-4 overflow-y-auto shrink-0">
            
            {/* GAVETA CLOSING METRIC BANNER (QUERY B) */}
            <div className="p-4 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl shadow-md border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" /> Fechamento Dinheiro na Gaveta
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded">AUTO-QUERY</span>
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black font-mono text-emerald-300">
                  R$ {saldoDinheiroGaveta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <span className="text-[10px] text-slate-300 font-medium">Líquido na caixa</span>
              </div>

              <div className="text-[10px] text-slate-300 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span>Entradas Dinheiro: <strong className="text-emerald-400">R$ {entradasDinheiroComCaixa.toFixed(2)}</strong></span>
                <span>Saídas: <strong className="text-rose-400">R$ {saidasDinheiro.toFixed(2)}</strong></span>
              </div>
            </div>

            {/* BREAKDOWN BY PAYMENT METHOD (QUERY A) */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2.5">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Totais por Meio de Pagamento</span>
                <span className="text-[10px] text-slate-400 font-normal">Exclui Caixa Anterior</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                
                {/* Cartão */}
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5 shadow-xs">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700">
                    <CreditCard className="w-3 h-3 text-indigo-600" />
                    <span>Cartão (cc)</span>
                  </div>
                  <p className="text-sm font-black font-mono text-slate-900">
                    R$ {totalCartao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Pix */}
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5 shadow-xs">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-teal-700">
                    <QrCode className="w-3 h-3 text-teal-600" />
                    <span>Pix Inst.</span>
                  </div>
                  <p className="text-sm font-black font-mono text-slate-900">
                    R$ {totalPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Dinheiro (Vendas) */}
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5 shadow-xs">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <Banknote className="w-3 h-3 text-emerald-600" />
                    <span>Dinheiro Vendas</span>
                  </div>
                  <p className="text-sm font-black font-mono text-slate-900">
                    R$ {totalDinheiroVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Bancário */}
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5 shadow-xs">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-sky-700">
                    <Building2 className="w-3 h-3 text-sky-600" />
                    <span>Bancário / Dep.</span>
                  </div>
                  <p className="text-sm font-black font-mono text-slate-900">
                    R$ {totalBancario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

              </div>
            </div>

            <div className="h-px bg-slate-200" />

            {/* EASY QUICK ENTRY FORM */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Novo Lançamento Rápido</span>
                </span>
                {!isCaixaAberto && (
                  <span className="text-[10px] text-rose-600 font-extrabold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Caixa Fechado
                  </span>
                )}
              </h3>

              {!isCaixaAberto && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-xl text-xs font-medium space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 font-black text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Caixa Encerrado para o Dia</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    O caixa se encontra fechado. Para cadastrar novos lançamentos de vendas ou despesas, clique no botão para abrir com saldo zerado.
                  </p>
                  <button
                    type="button"
                    onClick={handleAbrirCaixaZerado}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Abrir Caixa Agora (Zerado)</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleAddTransaction} className="space-y-2.5">
                
                {/* Tipo de Fluxo (Entrada x Saída) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType('entrada');
                      setCategory('Vendas');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      type === 'entrada'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Entrada (Venda)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setType('saida');
                      setCategory('Despesas');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      type === 'saida'
                        ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Saída (Despesa)</span>
                  </button>
                </div>

                {/* Número do Documento / Recibo */}
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-0.5">Nº Documento / Recibo (Opcional)</label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ex: 1912, 2299, OS-40..."
                      value={numDocumento}
                      onChange={(e) => setNumDocumento(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Histórico / Descrição */}
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-0.5">Histórico / Descrição *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Nome do Cliente ou Histórico do Gasto..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-800"
                  />
                </div>

                {/* Valor + Forma de Pagamento */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-0.5">Valor (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono font-black text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-0.5">Forma Pagamento</label>
                    <select
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value as any)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold text-slate-800"
                    >
                      <option value="Cartão (cc)">💳 Cartão (cc)</option>
                      <option value="Pix">⚡ Pix Inst.</option>
                      <option value="Dinheiro">💵 Dinheiro</option>
                      <option value="Bancário / Depósito">🏦 Bancário</option>
                    </select>
                  </div>
                </div>

                {/* Data e Situação */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-0.5">Data Movimento</label>
                    <input
                      type="date"
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-0.5">Situação</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      <option value="pago">🟢 Pago / Recebido</option>
                      <option value="pendente">🟡 Pendente</option>
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-3 hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Confirmar Lançamento no Caixa</span>
                </button>
              </form>
            </div>

          </section>

          {/* RIGHT SIDE: MOVIMENTO DE CAIXA TABLE */}
          <main className="flex-1 flex flex-col overflow-hidden">
            
            {/* SEARCH AND FILTERS TOOLBAR */}
            <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
              
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar documento, nome ou histórico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1 text-slate-500 text-xs font-bold pr-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  Filtrar por:
                </div>
                
                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="text-xs p-1.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700"
                >
                  <option value="todos">Todos Fluxos</option>
                  <option value="entrada">📈 Entradas</option>
                  <option value="saida">📉 Saídas</option>
                </select>

                {/* Payment Method Filter */}
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="text-xs p-1.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700"
                >
                  <option value="todos">Todas Formas Pag.</option>
                  <option value="Dinheiro">💵 Dinheiro</option>
                  <option value="Pix">⚡ Pix</option>
                  <option value="Cartão (cc)">💳 Cartão (cc)</option>
                  <option value="Bancário / Depósito">🏦 Bancário</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-xs p-1.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700"
                >
                  <option value="todos">Todos Status</option>
                  <option value="pago">🟢 Pago/Recebido</option>
                  <option value="pendente">🟡 Pendente</option>
                </select>
              </div>

            </div>

            {/* TABLE OF MOVIMENTO_CAIXA */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredTransactions.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                  Nenhum registro localizado para os filtros informados.
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">
                        <th className="py-3 px-3">Data</th>
                        <th className="py-3 px-3">Doc.</th>
                        <th className="py-3 px-4">Histórico / Descrição</th>
                        <th className="py-3 px-3">Forma Pagamento</th>
                        <th className="py-3 px-3">Fluxo</th>
                        <th className="py-3 px-4 text-right">Valor (R$)</th>
                        <th className="py-3 px-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredTransactions.map((t) => {
                        const isEntrada = t.type === 'entrada';
                        const paymentMethod = t.formaPagamento || 'Dinheiro';

                        return (
                          <tr key={t.id} className="hover:bg-slate-50/80 transition-all">
                            
                            {/* Data */}
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              {t.date.split('-').reverse().join('/')}
                            </td>

                            {/* Doc */}
                            <td className="py-3 px-3 font-mono font-bold text-slate-700 text-[11px] whitespace-nowrap">
                              {t.numDocumento ? `#${t.numDocumento}` : '-'}
                            </td>

                            {/* Histórico */}
                            <td className="py-3 px-4 font-bold text-slate-900">
                              <p>{t.description}</p>
                              {t.patientName && (
                                <span className="text-[10px] font-normal text-slate-500 block">
                                  Paciente: {t.patientName}
                                </span>
                              )}
                            </td>

                            {/* Forma Pagamento */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                paymentMethod === 'Cartão (cc)' 
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                  : paymentMethod === 'Pix'
                                  ? 'bg-teal-50 border-teal-200 text-teal-700'
                                  : paymentMethod === 'Dinheiro'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                  : 'bg-sky-50 border-sky-200 text-sky-800'
                              }`}>
                                {paymentMethod === 'Cartão (cc)' && <CreditCard className="w-2.5 h-2.5" />}
                                {paymentMethod === 'Pix' && <QrCode className="w-2.5 h-2.5" />}
                                {paymentMethod === 'Dinheiro' && <Banknote className="w-2.5 h-2.5" />}
                                {paymentMethod === 'Bancário / Depósito' && <Building2 className="w-2.5 h-2.5" />}
                                {paymentMethod}
                              </span>
                            </td>

                            {/* Fluxo */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 font-black text-[9px] px-2 py-0.5 rounded uppercase ${
                                isEntrada ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {isEntrada ? 'ENTRADA' : 'SAÍDA'}
                              </span>
                            </td>

                            {/* Valor */}
                            <td className={`py-3 px-4 text-right font-black font-mono text-sm ${
                              isEntrada ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              {isEntrada ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Ações */}
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleDeleteTransaction(t.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                                title="Excluir lançamento"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* FOOTER STATS */}
            <footer className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] font-bold text-slate-600 shrink-0 gap-2">
              <div className="flex items-center gap-4">
                <span>Total Registros: <strong>{filteredTransactions.length}</strong></span>
                <span>Faturamento Total do Dia: <strong className="text-emerald-700 font-mono">R$ {totalEntradasRealizadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sky-800 font-mono">
                  ÍrisClin Financial Control
                </span>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-102"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao Sistema</span>
                </button>
              </div>
            </footer>

          </main>

        </div>

        {/* PDF EXPORT MODAL */}
        <FluxoCaixaPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          transactions={filteredTransactions}
          totalEntradas={totalEntradasRealizadas}
          totalSaidas={totalSaidasRealizadas}
          saldoLiquido={saldoLiquido}
          totalEntradasPendentes={totalEntradasPendentes}
          totalSaidasPendentes={totalSaidasPendentes}
        />

      </div>
    </div>
  );
}
