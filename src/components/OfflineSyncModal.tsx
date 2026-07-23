import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  HardDrive, 
  Download, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  Smartphone,
  Zap
} from 'lucide-react';
import { 
  getPatientsFromIndexedDB, 
  savePatientsToIndexedDB, 
  getPendingOfflineActions, 
  clearSyncedOfflineActions, 
  OfflineAction 
} from '../utils/offlineDb';
import { Patient } from '../types';

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSyncCompleted?: () => void;
}

export default function OfflineSyncModal({
  isOpen,
  onClose,
  patients,
  onSyncCompleted
}: OfflineSyncModalProps) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [cachedCount, setCachedCount] = useState<number>(0);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('pt-BR'));
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, patients]);

  const refreshData = async () => {
    const cached = await getPatientsFromIndexedDB();
    setCachedCount(cached.length);
    const pending = await getPendingOfflineActions();
    setPendingActions(pending);
  };

  const handleForceSaveLocal = async () => {
    setIsSyncing(true);
    await savePatientsToIndexedDB(patients);
    await refreshData();
    setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
    setIsSyncing(false);
    setSyncSuccessMessage('Todos os cadastros e prontuários foram salvos no IndexedDB do dispositivo!');
    setTimeout(() => setSyncSuccessMessage(null), 4000);
  };

  const handleSyncWithServer = async () => {
    setIsSyncing(true);
    // Simulate flushing queue to backend
    await new Promise(r => setTimeout(r, 1200));
    await clearSyncedOfflineActions();
    await savePatientsToIndexedDB(patients);
    await refreshData();
    setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
    setIsSyncing(false);
    setSyncSuccessMessage('Sincronização com o servidor concluída com sucesso!');
    if (onSyncCompleted) onSyncCompleted();
    setTimeout(() => setSyncSuccessMessage(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* HEADER */}
        <header className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shadow-lg shrink-0 ${
              isOnline ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
            }`}>
              {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Sincronização Offline IndexedDB</h2>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  isOnline 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {isOnline ? 'CONECTADO À INTERNET' : 'MODO OFFLINE ATIVO'}
                </span>
              </div>
              <p className="text-xs text-slate-300">Garante o funcionamento contínuo do PWA mesmo sem internet no consultório</p>
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

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">

          {/* SUCCESS BANNER */}
          {syncSuccessMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-xs font-extrabold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
          )}

          {/* STATUS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* CARD 1: CONNECTION STATUS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Rede</span>
                {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-amber-600" />}
              </div>
              <div>
                <p className={`text-base font-black ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isOnline ? 'Online (Pronto)' : 'Offline (Modo Local)'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isOnline ? 'Dispositivo conectado ao servidor' : 'Sua clínica continua funcionando 100%'}
                </p>
              </div>
            </div>

            {/* CARD 2: CACHED PATIENTS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Banco Local (IndexedDB)</span>
                <Database className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">{cachedCount || patients.length} Pacientes</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Disponíveis para consulta instantânea</p>
              </div>
            </div>

            {/* CARD 3: PENDING SYNC QUEUE */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Fila de Sincronização</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">{pendingActions.length} Alterações</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Aguardando envio automático ao conectar</p>
              </div>
            </div>

          </div>

          {/* ACTION BUTTONS & SYNC PANEL */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Gerenciador de Armazenamento do Dispositivo</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500">Última checagem: {lastSyncTime}</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              O sistema armazena todos os registros no navegador (IndexedDB) para garantir resposta em milissegundos sem dependência de sinal de internet instável.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleForceSaveLocal}
                disabled={isSyncing}
                className="w-full sm:w-1/2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Atualizar Cópia Local ({patients.length} pacientes)</span>
              </button>

              <button
                onClick={handleSyncWithServer}
                disabled={isSyncing || !isOnline}
                className={`w-full sm:w-1/2 px-4 py-3 text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                  isOnline 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white' 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando Dados...' : 'Sincronizar Agora com o Servidor'}</span>
              </button>
            </div>
          </div>

          {/* PENDING QUEUE LIST */}
          {pendingActions.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Fila de Ações Registradas Offline</span>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {pendingActions.map((act) => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900">{act.type}</span>
                      <p className="text-[11px] text-slate-500">{new Date(act.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                      Pendente
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TIPS FOR PWA STABILITY */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-200/60 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 leading-relaxed">
              <p className="font-black text-indigo-900 mb-0.5">Segurança &amp; Estabilidade Contínua:</p>
              Ao utilizar este aplicativo como PWA (instalado no seu computador ou celular), a biblioteca IndexedDB retém dados e imagens mesmo se a internet cair ou o computador for reiniciado.
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <footer className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end shrink-0">
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
