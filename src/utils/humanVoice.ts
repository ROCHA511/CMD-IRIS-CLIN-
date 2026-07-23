/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Human-like Voice & Speech Engine for Íris AI Assistant
 */

export type VoiceProfileId = 'animada' | 'acolhedora' | 'executiva' | 'rapida' | 'natural';

export interface VoiceProfileInfo {
  id: VoiceProfileId;
  label: string;
  description: string;
  badge: string;
  defaultPitch: number;
  defaultRate: number;
  icon: string;
}

export interface VoiceSettings {
  profile: VoiceProfileId;
  pitch: number;
  rate: number;
  voiceURI?: string;
  voiceName?: string;
}

export const VOICE_PROFILES: VoiceProfileInfo[] = [
  {
    id: 'animada',
    label: 'Iris Animada & Empolgada',
    description: 'Voz alegre, vibrante e enérgica com tom expansivo e receptivo. Ideal para saudações e acolhimento empolgante.',
    badge: '✨ Mais Popular',
    defaultPitch: 1.18,
    defaultRate: 1.06,
    icon: 'Sparkles'
  },
  {
    id: 'acolhedora',
    label: 'Iris Humana & Acolhedora',
    description: 'Voz suave, calorosa e afetuosa com cadência calma e afável. Transmite segurança e cuidado médico.',
    badge: '💖 Empática',
    defaultPitch: 1.08,
    defaultRate: 0.92,
    icon: 'Heart'
  },
  {
    id: 'executiva',
    label: 'Iris Profissional & Elegante',
    description: 'Voz limpa, postura executiva e dicção impecável. Ideal para relatórios de caixa e confirmações formais.',
    badge: '💼 Executiva',
    defaultPitch: 1.02,
    defaultRate: 0.98,
    icon: 'Award'
  },
  {
    id: 'rapida',
    label: 'Iris Rápida & Dinâmica',
    description: 'Velocidade acelerada, objetiva e direta. Para quem precisa de respostas ágeis e alta produtividade no caixa.',
    badge: '⚡ Alta Velocidade',
    defaultPitch: 1.10,
    defaultRate: 1.18,
    icon: 'Zap'
  },
  {
    id: 'natural',
    label: 'Iris Natural Equilíbrio',
    description: 'Timbre balanceado e ritmo humano equilibrado para qualquer momento da clínica.',
    badge: '🌟 Padrão',
    defaultPitch: 1.06,
    defaultRate: 1.00,
    icon: 'Smile'
  }
];

const STORAGE_KEY = 'iris_voice_settings_v2';

// Default initial voice settings
export function getVoiceSettings(): VoiceSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.profile) {
        return parsed;
      }
    }
  } catch (e) {
    // LocalStorage fallback
  }

  return {
    profile: 'animada',
    pitch: 1.18,
    rate: 1.06
  };
}

export function saveVoiceSettings(settings: Partial<VoiceSettings>): VoiceSettings {
  const current = getVoiceSettings();
  const updated: VoiceSettings = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    // LocalStorage fallback
  }
  return updated;
}

// 1. Play Soft Audio Chime using Web Audio API
export function playSoftChime(type: 'start' | 'finish' | 'speak') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    
    if (type === 'start') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    } else if (type === 'finish') {
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.15); // C5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {
    // AudioContext blocked or not allowed prior to interaction
  }
}

// 2. Pre-process text to sound natural, warm, and human in Brazilian Portuguese
export function formatTextForHumanSpeech(text: string): string {
  if (!text) return '';

  let cleaned = text
    // Remove Markdown formatting
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*{1,3}/g, '')
    .replace(/_{1,3}/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/~{1,2}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    // Remove Emojis
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Humanize common terms, times, and abbreviations
    .replace(/\b06:30\b/g, 'seis horas e meia da manhã')
    .replace(/\b07:30\b/g, 'sete horas e meia da manhã')
    .replace(/\b08:00\b/g, 'oito horas da manhã')
    .replace(/\b12 MESES\b/gi, 'doze meses')
    .replace(/\b1 ANO\b/gi, 'um ano')
    .replace(/\bOD\b/g, 'olho direito')
    .replace(/\bOE\b/g, 'olho esquerdo')
    .replace(/\bESF\b/gi, 'esférico')
    .replace(/\bCIL\b/gi, 'cilíndrico')
    .replace(/\bEIXO\b/gi, 'eixo')
    .replace(/\bADD\b/gi, 'adição')
    .replace(/\bDNP\b/gi, 'distância nasopupilar')
    .replace(/\bCRM\b/gi, 'conselho regional de medicina')
    .replace(/\bPDF\b/gi, 'Pê Dê Éfe')
    .replace(/\bPIX\b/gi, 'Piks')
    .replace(/R\$\s?(\d+)[.,](\d{2})/g, '$1 reais e $2 centavos')
    .replace(/R\$\s?(\d+)/g, '$1 reais')
    .replace(/(\d+)\/(\d+)\/(\d{4})/, '$1 do $2 de $3')
    // Smooth out bullet lists to natural conversational pauses
    .replace(/^\s*[-*•]\s*/gm, '... ')
    .replace(/\n+/g, '... ');

  return cleaned.trim();
}

// 3. Get all available Portuguese voices installed on user device/browser
export function getAllPortugueseVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return [];

  return voices.filter(v => 
    v.lang.toLowerCase().includes('pt') || 
    v.lang.toLowerCase().includes('pt-br') || 
    v.lang.toLowerCase().includes('pt_br')
  );
}

// 4. Select best natural female Portuguese voice
export function getBestHumanFemaleVoice(targetURIorName?: string): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  if (targetURIorName) {
    const exactMatch = voices.find(v => v.voiceURI === targetURIorName || v.name === targetURIorName);
    if (exactMatch) return exactMatch;
  }

  const ptVoices = voices.filter(v => 
    v.lang.toLowerCase().includes('pt') || 
    v.lang.toLowerCase().includes('pt-br') ||
    v.lang.toLowerCase().includes('pt_br')
  );

  const preferredFemaleKeywords = [
    'google português do brasil', 'luciana', 'francisca', 'vitoria', 'vitória', 
    'heloisa', 'heloísa', 'leticia', 'letícia', 'maria', 'marcia', 'márcia', 
    'elsa', 'joana', 'camilla', 'fernanda', 'catherine', 'natural', 'neural', 
    'spoken', 'female', 'mulher', 'brazil', 'br'
  ];

  for (const nameKeyword of preferredFemaleKeywords) {
    const match = ptVoices.find(v => v.name.toLowerCase().includes(nameKeyword));
    if (match) return match;
  }

  const googlePtBr = ptVoices.find(v => v.name.toLowerCase().includes('google'));
  if (googlePtBr) return googlePtBr;

  return ptVoices[0] || voices[0] || null;
}

// 5. Main Speak Function with Custom Settings & Voice Profiles
export function speakHumanVoice(
  text: string, 
  onStart?: () => void, 
  onEnd?: () => void,
  customSettings?: Partial<VoiceSettings>
): boolean {
  if (!('speechSynthesis' in window)) return false;

  window.speechSynthesis.cancel(); // Stop overlapping speech

  const humanText = formatTextForHumanSpeech(text);
  if (!humanText) return false;

  const savedSettings = getVoiceSettings();
  const settings: VoiceSettings = { ...savedSettings, ...customSettings };

  const utterance = new SpeechSynthesisUtterance(humanText);
  utterance.lang = 'pt-BR';

  const femaleVoice = getBestHumanFemaleVoice(settings.voiceURI || settings.voiceName);
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  // Pitch & Speed Modulation
  utterance.pitch = settings.pitch || 1.18;
  utterance.rate = settings.rate || 1.06;
  utterance.volume = 1.0;

  utterance.onstart = () => {
    playSoftChime('speak');
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}
