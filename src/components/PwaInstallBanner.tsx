import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-80 bg-slate-900/95 text-white p-4 rounded-2xl border border-sky-500/40 shadow-2xl backdrop-blur-md animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 font-bold shadow-md">
          <Smartphone className="w-5 h-5 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-extrabold text-white">Instalar ÍrisClin como App (PWA)</h4>
            <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">PWA</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            Acesse a clínica direto da tela inicial no celular ou PC com suporte offline e acesso rápido.
          </p>
        </div>

        <button
          onClick={() => setShowBanner(false)}
          className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Atendimento Seguro LGPD</span>
        </div>

        <button
          onClick={handleInstallClick}
          className="px-4 py-1.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar Agora</span>
        </button>
      </div>
    </div>
  );
}
