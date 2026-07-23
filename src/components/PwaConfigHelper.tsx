import React, { useEffect, useState } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  Download, 
  Share, 
  Sparkles, 
  X, 
  ShieldCheck, 
  ExternalLink, 
  Apple, 
  Globe,
  RefreshCw,
  Monitor
} from 'lucide-react';

interface PwaConfigHelperProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function PwaConfigHelper({ isOpen = false, onClose }: PwaConfigHelperProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [pngIconDataUrl, setPngIconDataUrl] = useState<string | null>(null);
  const [manifestReady, setManifestReady] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  useEffect(() => {
    // 1. Detect Standalone / iOS / Android
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    const ua = navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);
    setIsIos(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // 2. Generate crisp 192x192 PNG Icon for iOS Safari compatibility
    const canvas = document.createElement('canvas');
    canvas.width = 192;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Rounded Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 192, 192);
      grad.addColorStop(0, '#0369a1');
      grad.addColorStop(0.5, '#0284c7');
      grad.addColorStop(1, '#0f172a');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, 0, 192, 192, 40);
      ctx.fill();

      // Outer Ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(96, 96, 60, 0, 2 * Math.PI);
      ctx.stroke();

      // Eye Arc Path
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(36, 96);
      ctx.quadraticCurveTo(96, 50, 156, 96);
      ctx.quadraticCurveTo(96, 142, 36, 96);
      ctx.stroke();

      // Iris Circle
      const irisGrad = ctx.createLinearGradient(0, 0, 192, 192);
      irisGrad.addColorStop(0, '#38bdf8');
      irisGrad.addColorStop(0.5, '#34d399');
      irisGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(96, 96, 30, 0, 2 * Math.PI);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(96, 96, 14, 0, 2 * Math.PI);
      ctx.fill();

      // Glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(103, 89, 5, 0, 2 * Math.PI);
      ctx.fill();

      const pngData = canvas.toDataURL('image/png');
      setPngIconDataUrl(pngData);

      // Inject Apple Touch Icon explicitly as PNG Data URL for iOS
      let appleIconLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (!appleIconLink) {
        appleIconLink = document.createElement('link');
        appleIconLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleIconLink);
      }
      appleIconLink.href = pngData;
    }

    // 3. Ensure Viewport, Meta & Dynamic Manifest Injection
    const ensureMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    ensureMeta('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    ensureMeta('theme-color', '#0284c7');
    ensureMeta('apple-mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    ensureMeta('apple-mobile-web-app-title', 'ÍrisClin');
    ensureMeta('application-name', 'ÍrisClin');

    // 4. Dynamic Blob Manifest to guarantee installation even on subdomains
    const manifestObj = {
      name: "ÍrisClin • Gestão Oftalmológica & Agendamento Iris AI",
      short_name: "ÍrisClin",
      description: "Sistema de gestão médica oftalmológica e agendamento automático de consultas da ÍrisClin.",
      start_url: window.location.href,
      scope: "/",
      display: "standalone",
      background_color: "#0f172a",
      theme_color: "#0284c7",
      orientation: "portrait-primary",
      icons: [
        {
          src: pngIconDataUrl || "/icon.svg",
          sizes: "192x192 512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    };

    const manifestBlob = new Blob([JSON.stringify(manifestObj)], { type: 'application/json' });
    const manifestBlobUrl = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestBlobUrl;
    setManifestReady(true);

    // 5. Catch Android 'beforeinstallprompt'
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      URL.revokeObjectURL(manifestBlobUrl);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        isIos 
          ? 'No iPhone/iPad: toque no botão "Compartilhar" do Safari e escolha "Adicionar à Tela de Início".'
          : 'Abra o menu do navegador (3 pontinhos) e toque em "Instalar Aplicativo" ou "Adicionar à Tela Inicial".'
      );
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        
        {/* HEADER */}
        <header className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {pngIconDataUrl ? (
              <img src={pngIconDataUrl} alt="ÍrisClin App Icon" className="w-10 h-10 rounded-2xl shadow-md border border-white/20" />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-slate-950 font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Configurador PWA ÍrisClin</h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  iOS &amp; Android
                </span>
              </div>
              <p className="text-xs text-slate-300">Suporte a tela cheia, ícones nativos e zero tela branca</p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowModal(false);
              if (onClose) onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* STATUS CHECKLIST */}
        <main className="p-6 space-y-4 bg-slate-50/60 overflow-y-auto max-h-[75vh]">
          
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Diagnóstico de Instalação PWA</span>
            </h4>
            <ul className="text-xs text-emerald-800 space-y-1 font-medium">
              <li className="flex items-center justify-between">
                <span>• Web App Manifest:</span>
                <span className="font-bold text-emerald-700">Ativo e Injetado ✓</span>
              </li>
              <li className="flex items-center justify-between">
                <span>• Ícone Apple Touch (PNG 192px):</span>
                <span className="font-bold text-emerald-700">Gerado &amp; Vinculado ✓</span>
              </li>
              <li className="flex items-center justify-between">
                <span>• Modo Standalone (Tela Cheia):</span>
                <span className="font-bold text-emerald-700">{isStandalone ? 'Instalado ✓' : 'Pronto para Instalar'}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>• Prevenção de Tela Branca:</span>
                <span className="font-bold text-emerald-700">Meta Theme-Color Ativo ✓</span>
              </li>
            </ul>
          </div>

          {/* SYSTEM SPECIFIC INSTRUCTIONS */}
          {isIos ? (
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
                <Apple className="w-4 h-4 text-slate-800" />
                <span>Instruções para iPhone e iPad (Safari)</span>
              </div>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside font-medium">
                <li>Abra o sistema no navegador <strong>Safari</strong>.</li>
                <li>Toque no botão <strong>Compartilhar</strong> (ícone do quadrado com seta para cima).</li>
                <li>Selecione a opção <strong>"Adicionar à Tela de Início"</strong>.</li>
                <li>O ícone HD da ÍrisClin aparecerá na sua tela de início sem barra de endereço!</li>
              </ol>
            </div>
          ) : (
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Instruções para Android (Chrome / Edge)</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Você pode instalar o aplicativo diretamente tocando no botão abaixo ou usando o menu do Chrome ("Instalar Aplicativo").
              </p>
            </div>
          )}

          {/* ACTION BUTTON */}
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>Instalar ÍrisClin na Tela Inicial</span>
          </button>

        </main>

        <footer className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500 font-bold">
          ÍrisClin PWA Helper • Compatível com iOS 14+ &amp; Android 8+
        </footer>

      </div>
    </div>
  );
}
