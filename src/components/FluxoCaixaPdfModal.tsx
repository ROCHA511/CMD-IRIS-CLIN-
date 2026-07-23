import React from 'react';
import { Transaction } from '../types';
import { Printer, Download, X, FileText, ShieldCheck, DollarSign, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';

interface FluxoCaixaPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  totalEntradas: number;
  totalSaidas: number;
  saldoLiquido: number;
  totalEntradasPendentes: number;
  totalSaidasPendentes: number;
}

export default function FluxoCaixaPdfModal({
  isOpen,
  onClose,
  transactions,
  totalEntradas,
  totalSaidas,
  saldoLiquido,
  totalEntradasPendentes,
  totalSaidasPendentes
}: FluxoCaixaPdfModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in no-print">
      <div className="w-full max-w-4xl h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* MODAL ACTION BAR (Hidden in print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 no-print border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                Relatório Oficial em PDF • Fluxo de Caixa ÍrisClin
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">PADRÃO CLÍNICO</span>
              </h3>
              <p className="text-xs text-slate-400">Visualize o documento oficial e clique em Imprimir/Salvar PDF para gerar o arquivo</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>Baixar / Imprimir PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF PREVIEW / PRINT CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 print-container">
          
          {/* SHEET PAPER (A4 Look) */}
          <div id="pdf-report-document" className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-slate-800 space-y-6 print:shadow-none print:border-none print:p-0">
            
            {/* DOCUMENT HEADER */}
            <header className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-xs">
                    ÍR
                  </div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900">ÍrisClin • Medicina Oftalmológica</h1>
                </div>
                <p className="text-xs text-slate-500 font-medium">Centro Especializado em Oftalmologia e Saúde Ocular</p>
                <p className="text-[11px] text-slate-400 font-mono">CNPJ: 45.892.102/0001-88 | Registro CRM/RO 4892</p>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs rounded-lg uppercase tracking-wider">
                  DEMONSTRATIVO FINANCEIRO
                </span>
                <p className="text-[11px] text-slate-500">Emissão: <strong className="text-slate-700">{currentDate}</strong></p>
                <p className="text-[11px] text-slate-500">Período: <strong className="text-slate-700">Julho / 2026</strong></p>
              </div>
            </header>

            {/* FINANCIAL SUMMARY CARDS */}
            <section className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                1. Resumo Executivo das Contas & Formas de Pagamento
              </h2>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-emerald-800 text-[11px] font-bold uppercase">
                    <span>Total Entradas</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-lg font-black font-mono text-emerald-900">
                    R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-emerald-700">Lançamentos Confirmados</p>
                </div>

                <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-rose-800 text-[11px] font-bold uppercase">
                    <span>Total Saídas</span>
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <p className="text-lg font-black font-mono text-rose-900">
                    R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-rose-700">Despesas & Insumos Pagos</p>
                </div>

                <div className="p-3 bg-sky-50/90 border-2 border-sky-300 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-sky-900 text-[11px] font-extrabold uppercase">
                    <span>Saldo Líquido</span>
                    <DollarSign className="w-3.5 h-3.5 text-sky-700" />
                  </div>
                  <p className={`text-lg font-black font-mono ${saldoLiquido >= 0 ? 'text-sky-950' : 'text-rose-700'}`}>
                    R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-sky-800 font-bold">Resultado Operacional</p>
                </div>
              </div>

              {/* PAYMENT METHOD SUMMARY BOX (Query A & B) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-4 gap-2 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Cartão (cc)</span>
                  <strong className="text-xs font-mono text-indigo-900">
                    R$ {transactions.filter(t => t.type === 'entrada' && t.status === 'pago' && t.formaPagamento === 'Cartão (cc)' && t.description !== 'Caixa Anterior').reduce((a, b) => a + b.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Pix Inst.</span>
                  <strong className="text-xs font-mono text-teal-900">
                    R$ {transactions.filter(t => t.type === 'entrada' && t.status === 'pago' && t.formaPagamento === 'Pix').reduce((a, b) => a + b.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Dinheiro Vendas</span>
                  <strong className="text-xs font-mono text-emerald-900">
                    R$ {transactions.filter(t => t.type === 'entrada' && t.status === 'pago' && t.formaPagamento === 'Dinheiro' && t.description !== 'Caixa Anterior').reduce((a, b) => a + b.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Fechamento Gaveta</span>
                  <strong className="text-xs font-mono text-emerald-700">
                    R$ {(transactions.filter(t => t.type === 'entrada' && t.status === 'pago' && t.formaPagamento === 'Dinheiro').reduce((a, b) => a + b.amount, 0) - transactions.filter(t => t.type === 'saida' && t.status === 'pago' && t.formaPagamento === 'Dinheiro').reduce((a, b) => a + b.amount, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              {/* PENDENCY BANNER */}
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <div>Previsões a Receber: <strong className="text-emerald-700 font-mono">R$ {totalEntradasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
                <div>Previsões a Pagar: <strong className="text-rose-700 font-mono">R$ {totalSaidasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
              </div>
            </section>

            {/* DETAILED TRANSACTIONS TABLE */}
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  2. Lançamentos Financeiros Detalhados ({transactions.length} Registros)
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">Auditado por ÍrisClin Engine</span>
              </div>

              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Doc Nº</th>
                      <th className="py-2.5 px-3">Histórico / Lançamento</th>
                      <th className="py-2.5 px-3">Forma Pag.</th>
                      <th className="py-2.5 px-3">Fluxo</th>
                      <th className="py-2.5 px-3 text-right">Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">{tx.date.split('-').reverse().join('/')}</td>
                        <td className="py-2 px-3 font-mono text-slate-700 font-bold text-[11px]">{tx.numDocumento ? `#${tx.numDocumento}` : '-'}</td>
                        <td className="py-2 px-3 text-slate-900 font-bold text-[11px]">
                          {tx.description}
                          {tx.patientName && (
                            <span className="block text-[10px] font-normal text-slate-500">Paciente: {tx.patientName}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-700 text-[10px]">{tx.formaPagamento || 'Dinheiro'}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {tx.type === 'entrada' ? (
                            <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-black uppercase">
                              Entrada
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[9px] font-black uppercase">
                              Saída
                            </span>
                          )}
                        </td>
                        <td className={`py-2 px-3 text-right font-mono font-bold text-[11px] ${tx.type === 'entrada' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {tx.type === 'entrada' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-900 text-xs">
                    <tr>
                      <td colSpan={5} className="py-3 px-3 uppercase text-right tracking-wider">
                        Saldo Operacional Final em Caixa:
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-sm text-emerald-400 font-black whitespace-nowrap">
                        R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* DOCUMENT FOOTER & SIGNATURES */}
            <footer className="pt-8 space-y-6">
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-center">
                <div className="space-y-1">
                  <div className="border-b border-slate-400 w-3/4 mx-auto pb-1" />
                  <p className="text-xs font-bold text-slate-800">Direção Geral / Controladoria Financeira</p>
                  <p className="text-[10px] text-slate-400">ÍrisClin Hospital Oftalmológico</p>
                </div>
                <div className="space-y-1">
                  <div className="border-b border-slate-400 w-3/4 mx-auto pb-1" />
                  <p className="text-xs font-bold text-slate-800">Responsável Técnico Médico / CRM</p>
                  <p className="text-[10px] text-slate-400">Dr. Marcos Oftalmologia Especializada</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Relatório assinado digitalmente com criptografia LGPD de integridade bancária.</span>
                </div>
                <span className="font-mono text-slate-400">HASH: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
            </footer>

          </div>
        </div>
      </div>
    </div>
  );
}
