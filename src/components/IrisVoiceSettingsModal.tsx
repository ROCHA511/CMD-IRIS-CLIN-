import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  Sparkles, 
  Heart, 
  Award, 
  Zap, 
  Smile, 
  Play, 
  Check, 
  Sliders, 
  Bot,
  Radio,
  Music,
  CheckCircle2
} from 'lucide-react';
import { 
  VoiceProfileId, 
  VoiceSettings, 
  VOICE_PROFILES, 
  getVoiceSettings, 
  saveVoiceSettings, 
  speakHumanVoice, 
  getAllPortugueseVoices,
  getBestHumanFemaleVoice
} from '../utils/humanVoice';

interface IrisVoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IrisVoiceSettingsModal({
  isOpen,
  onClose
}: IrisVoiceSettingsModalProps) {
  const [settings, setSettings] = useState<VoiceSettings>(getVoiceSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getVoiceSettings());
      
      const loadVoices = () => {
        const voices = getAllPortugueseVoices();
        setAvailableVoices(voices);
      };

      loadVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProfileSelect = (profileId: VoiceProfileId) => {
    const profile = VOICE_PROFILES.find(p => p.id === profileId);
    if (!profile) return;

    const updated: VoiceSettings = {
      ...settings,
      profile: profileId,
      pitch: profile.defaultPitch,
      rate: profile.defaultRate
    };

    setSettings(updated);
    saveVoiceSettings(updated);

    // Play sample immediately upon selecting profile
    handlePlaySample(updated);
  };

  const handlePitchChange = (newPitch: number) => {
    const updated = { ...settings, pitch: newPitch };
    setSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleRateChange = (newRate: number) => {
    const updated = { ...settings, rate: newRate };
    setSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleVoiceChange = (voiceURI: string) => {
    const matchedVoice = availableVoices.find(v => v.voiceURI === voiceURI || v.name === voiceURI);
    const updated = { 
      ...settings, 
      voiceURI: matchedVoice?.voiceURI || voiceURI,
      voiceName: matchedVoice?.name || voiceURI 
    };
    setSettings(updated);
    saveVoiceSettings(updated);
    handlePlaySample(updated);
  };

  const handlePlaySample = (currentSettings = settings) => {
    setIsPlayingSample(true);
    const sampleText = currentSettings.profile === 'animada'
      ? 'Olá! Eu sou a Íris, sua assistente animada e empolgada! Estou super pronta para ajudar no atendimento da clínica!'
      : currentSettings.profile === 'acolhedora'
      ? 'Olá! Eu sou a Íris, sua assistente acolhedora. Estou aqui com todo carinho para cuidar da sua agenda e clientes.'
      : currentSettings.profile === 'executiva'
      ? 'Olá. Sou a Íris, assistente executiva. Sistema pronto para gestão financeira e confirmação de consultas.'
      : currentSettings.profile === 'rapida'
      ? 'Olá! Sou a Íris em alta velocidade. Pronta para caixa rápido e disparos acelerados no WhatsApp!'
      : 'Olá! Sou a Íris, sua assistente virtual oficial da clínica ÍrisClin. Como posso te ajudar hoje?';

    speakHumanVoice(
      sampleText,
      () => setIsPlayingSample(true),
      () => setIsPlayingSample(false),
      currentSettings
    );
  };

  const getIconForProfile = (id: VoiceProfileId) => {
    switch (id) {
      case 'animada': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'acolhedora': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'executiva': return <Award className="w-5 h-5 text-indigo-500" />;
      case 'rapida': return <Zap className="w-5 h-5 text-sky-500" />;
      default: return <Smile className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* HEADER */}
        <header className="sticky top-0 z-10 px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 p-0.5 shadow-lg flex items-center justify-center text-slate-950 font-bold shrink-0">
              <Volume2 className="w-5 h-5 text-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">Opções de Voz Humana da Iris</h2>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold font-mono">
                  SINTETIZADOR 2026
                </span>
              </div>
              <p className="text-xs text-slate-300">Escolha o tom, velocidade e voz feminina humana mais alegre e animada para a clínica</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            title="Fechar Configurações de Voz"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* MODAL BODY */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 bg-slate-50/60">
          
          {/* TEST VOICE BUTTON BANNER */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Testar Voz Atual em Tempo Real</h3>
                <p className="text-[11px] text-slate-600">Ouça como a Iris falará com seus pacientes e atendentes</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handlePlaySample()}
              disabled={isPlayingSample}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 shrink-0 ${
                isPlayingSample
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black'
              }`}
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isPlayingSample ? 'Reproduzindo Voz...' : 'Ouvir Amostra de Voz'}</span>
            </button>
          </div>

          {/* PROFILE SELECTION GRID */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>1. Estilo &amp; Personalidade de Voz da Iris</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VOICE_PROFILES.map((profile) => {
                const isSelected = settings.profile === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleProfileSelect(profile.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-400/50 shadow-md'
                        : 'bg-white hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {getIconForProfile(profile.id)}
                          <span className="text-xs font-black text-slate-900">{profile.label}</span>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isSelected ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {profile.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                        {profile.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] font-bold pt-2 border-t border-slate-200/60 text-slate-500">
                      <span>Tom: {(profile.defaultPitch).toFixed(2)}x</span>
                      <span>Velocidade: {(profile.defaultRate).toFixed(2)}x</span>
                      {isSelected && (
                        <span className="text-amber-700 font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selecionado
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SLIDERS FOR FINE TUNING */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>2. Ajuste Fino de Velocidade e Tom (Alegria &amp; Animação)</span>
            </h3>

            {/* SPEED / RATE SLIDER */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Velocidade da Fala:</span>
                <span className="font-black font-mono text-amber-600">{settings.rate.toFixed(2)}x</span>
              </div>
              <input 
                type="range"
                min="0.80"
                max="1.35"
                step="0.03"
                value={settings.rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-extrabold text-slate-400">
                <span>0.80x (Calma / Suave)</span>
                <span>1.06x (Ideal Animada)</span>
                <span>1.35x (Acelerada)</span>
              </div>
            </div>

            {/* PITCH / TOM SLIDER */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Tom da Voz (Grave ↔ Alegre/Agudo):</span>
                <span className="font-black font-mono text-amber-600">{settings.pitch.toFixed(2)}x</span>
              </div>
              <input 
                type="range"
                min="0.85"
                max="1.35"
                step="0.03"
                value={settings.pitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-extrabold text-slate-400">
                <span>0.85x (Grave)</span>
                <span>1.18x (Alegre &amp; Empolgada)</span>
                <span>1.35x (Agudo)</span>
              </div>
            </div>
          </div>

          {/* SYSTEM VOICE SELECTION */}
          {availableVoices.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>3. Vozes Sintetizadas Instaladas no seu Dispositivo/Navegador</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                O sistema seleciona automaticamente a melhor voz feminina em português (Google, Luciana, Francisca, Vitória, etc.). Você também pode fixar uma voz específica:
              </p>

              <select
                value={settings.voiceURI || ''}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="w-full mt-2 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="">✨ Automático (Melhor Voz Feminina Humana)</option>
                {availableVoices.map((voice) => (
                  <option key={voice.voiceURI || voice.name} value={voice.voiceURI || voice.name}>
                    {voice.name} ({voice.lang}) {voice.default ? '• [Padrão do Sistema]' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            As preferências de voz são salvas automaticamente.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => handlePlaySample()}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-extrabold rounded-xl transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 text-amber-600" />
              <span>Ouvir Teste</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Concluir e Salvar</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
