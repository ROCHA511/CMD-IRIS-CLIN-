import React, { useState } from 'react';
import { 
  Smartphone, 
  Copy, 
  Check, 
  QrCode, 
  Download, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Share2, 
  Sparkles, 
  Apple, 
  Globe
} from 'lucide-react';

interface MobileDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDownloadModal({ isOpen, onClose }: MobileDownloadModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use current window URL or shared URL fallback
  const appUrl = window.location.origin.includes('localhost') || window.location.origin.includes('3000')
    ? 'https://ais-pre-nl3ss3kzcjcv4v6hrosgk6-248777919228.us-east5.run.app'
    : window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(appUrl)}&color=0f172a&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        
        {/* MODAL HEADER */}
        <header className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 p-0.5 shadow-lg flex items-center justify-center text-slate-950 font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Acessar &amp; Baixar no Celular</h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  PWA MOBILE
                </span>
              </div>
              <p className="text-xs text-slate-300">Acesse o sistema ÍrisClin pelo navegador do celular ou instale como App na tela inicial</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* MODAL BODY */}
        <main className="p-6 space-y-5 bg-slate-50/60 overflow-y-auto max-h-[80vh]">
          
          {/* SYSTEM PREVIEW IMAGE BANNER */}
          <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 shadow-xl group bg-[#21c2cc]">
            <img 
              src="/irisclin-official-banner.svg" 
              alt="ÍrisClin SISTEMA WEB - Logotipo Oficial" 
              className="w-full h-48 object-contain py-2 bg-gradient-to-r from-[#41d8e0] via-[#21c2cc] to-[#19abb4] transition-all duration-500 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            <div className="bg-slate-900/90 border-t border-cyan-400/30 p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-cyan-500/30 text-cyan-200 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-cyan-400/40">
                  ÍrisClin • SISTEMA WEB
                </span>
                <h4 className="text-xs font-black text-white mt-1">Gestão Oftalmológica &amp; Agendamento WhatsApp Meta</h4>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-1 rounded-full font-mono font-bold shrink-0">
                Identidade Oficial
              </span>
            </div>
          </div>

          {/* SECTION 1: DIRECT LINK & COPY BUTTON */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>Link Direto de Acesso Mobile</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">Ativo em Tempo Real</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 text-xs font-mono font-bold bg-slate-100/80 border border-slate-200 text-slate-800 px-3 py-2 rounded-xl focus:outline-none select-all"
              />
              
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white hover:scale-[1.02]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 2: SCAN QR CODE */}
          <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-center gap-5">
            <div className="p-2 bg-white rounded-2xl shadow-xl shrink-0">
              <img
                src={qrCodeUrl}
                alt="QR Code Acesso Mobile"
                className="w-36 h-36 rounded-xl object-contain"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                <QrCode className="w-3 h-3" />
                <span>Escanear com a Câmera</span>
              </div>
              <h4 className="text-sm font-black text-white">Abra a Câmera do seu Celular</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aponte a câmera do seu smartphone (Android ou iPhone) para o QR Code acima para abrir o sistema da ÍrisClin instantaneamente sem precisar digitar nada!
              </p>
            </div>
          </div>

          {/* SECTION 3: INSTRUCTIONS TO INSTALL AS APP (ANDROID & IOS) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>Como Baixar e Adicionar à Tela de Início no Celular</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Android Guide */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    🤖
                  </div>
                  <h5 className="text-xs font-extrabold text-slate-900">Android (Chrome / Edge)</h5>
                </div>
                <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside font-medium leading-tight">
                  <li>Abra o link no <strong>Google Chrome</strong>.</li>
                  <li>Toque nos <strong>3 pontinhos</strong> (menu do canto superior).</li>
                  <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                </ol>
              </div>

              {/* iOS Guide */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                    <Apple className="w-3.5 h-3.5" />
                  </div>
                  <h5 className="text-xs font-extrabold text-slate-900">iPhone / iPad (Safari)</h5>
                </div>
                <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside font-medium leading-tight">
                  <li>Abra o link no navegador <strong>Safari</strong>.</li>
                  <li>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta).</li>
                  <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
                </ol>
              </div>

            </div>
          </div>

        </main>

        {/* MODAL FOOTER */}
        <footer className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            <span>Acesso Criptografado &amp; Protegido</span>
          </div>

          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
          >
            <span>Abrir numa Nova Aba</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-300" />
          </a>
        </footer>

      </div>
    </div>
  );
}
