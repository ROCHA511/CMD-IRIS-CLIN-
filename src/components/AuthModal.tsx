import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User as UserIcon, 
  KeyRound, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Stethoscope, 
  UserCheck, 
  Sparkles, 
  Database, 
  LogOut, 
  ArrowRight,
  Eye,
  EyeOff,
  Search,
  PlusCircle,
  FileText,
  Activity
} from 'lucide-react';
import { User, UserRole, AuditLog } from '../types';

// Pre-registered system users required by business logic
export const PRESET_USERS: User[] = [
  {
    id: 'usr_admin_1',
    nome: 'Dioenne Rocha',
    email: 'dioenne@irisclin.com.br',
    perfil: 'ADMIN',
    telefone: '(71) 99988-1122',
    cpf: '123.456.789-00',
    ativo: true,
    ultimo_login: 'Hoje, 08:15',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_admin_2',
    nome: 'Marly Lima Rocha',
    email: 'marly@irisclin.com.br',
    perfil: 'ADMIN',
    telefone: '(71) 99988-3344',
    cpf: '234.567.890-11',
    ativo: true,
    ultimo_login: 'Ontem, 17:40',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_med_1',
    nome: 'Dr. Augusto Faro',
    email: 'augusto@irisclin.com.br',
    perfil: 'MEDICO',
    telefone: '(71) 98877-5566',
    cpf: '345.678.901-22',
    ativo: true,
    ultimo_login: 'Hoje, 07:50',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_rec_1',
    nome: 'Ainoã',
    email: 'ainoa@irisclin.com.br',
    perfil: 'RECEPCIONISTA',
    telefone: '(71) 99111-2233',
    ativo: true,
    ultimo_login: 'Hoje, 08:00'
  },
  {
    id: 'usr_rec_2',
    nome: 'Deize',
    email: 'deize@irisclin.com.br',
    perfil: 'RECEPCIONISTA',
    telefone: '(71) 99111-3344',
    ativo: true,
    ultimo_login: 'Ontem, 18:00'
  },
  {
    id: 'usr_rec_3',
    nome: 'Tailane',
    email: 'tailane@irisclin.com.br',
    perfil: 'RECEPCIONISTA',
    telefone: '(71) 99111-4455',
    ativo: true,
    ultimo_login: '23/07/2026'
  },
  {
    id: 'usr_rec_4',
    nome: 'Vanessa',
    email: 'vanessa@irisclin.com.br',
    perfil: 'RECEPCIONISTA',
    telefone: '(71) 99111-5566',
    ativo: true,
    ultimo_login: '22/07/2026'
  },
  {
    id: 'usr_rec_5',
    nome: 'Diane',
    email: 'diane@irisclin.com.br',
    perfil: 'RECEPCIONISTA',
    telefone: '(71) 99111-6677',
    ativo: true,
    ultimo_login: '20/07/2026'
  },
  {
    id: 'usr_pac_1',
    nome: 'João da Silva',
    email: 'joao.silva@gmail.com',
    perfil: 'PACIENTE',
    telefone: '(71) 98765-4321',
    cpf: '987.654.321-00',
    ativo: true,
    ultimo_login: 'Hoje, 09:30'
  }
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  allUsers: User[];
  onAddNewUserByAdmin: (newUser: User) => void;
  auditLogs: AuditLog[];
}

type AuthViewMode = 'login' | 'register' | 'forgot' | 'admin_users' | 'audit_logs';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  allUsers,
  onAddNewUserByAdmin,
  auditLogs
}: AuthModalProps) {
  const [viewMode, setViewMode] = useState<AuthViewMode>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Register State
  const [regNome, setRegNome] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regDataNasc, setRegDataNasc] = useState('');
  const [regTelefone, setRegTelefone] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regConfirmSenha, setRegConfirmSenha] = useState('');
  const [regPerfil, setRegPerfil] = useState<'PACIENTE' | 'MEDICO'>('PACIENTE');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Admin New User State
  const [adminUserPerfil, setAdminUserPerfil] = useState<UserRole>('RECEPCIONISTA');
  const [adminUserNome, setAdminUserNome] = useState('');
  const [adminUserEmail, setAdminUserEmail] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginAttempts >= 5) {
      setLoginError('Sua conta foi temporariamente bloqueada por 5 tentativas incorretas consecutivas. Tente novamente mais tarde.');
      return;
    }

    // Match against user email or pre-configured preset accounts
    const foundUser = allUsers.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() ||
           u.nome.toLowerCase() === email.trim().toLowerCase()
    );

    if (foundUser) {
      onLoginSuccess(foundUser);
      setLoginAttempts(0);
      onClose();
    } else {
      setLoginAttempts(prev => prev + 1);
      setLoginError(`Credenciais inválidas. (${5 - (loginAttempts + 1)} tentativas restantes)`);
    }
  };

  const handlePresetQuickLogin = (presetUser: User) => {
    onLoginSuccess(presetUser);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regSenha !== regConfirmSenha) {
      setRegError('As senhas digitadas não conferem.');
      return;
    }

    if (!regNome || !regEmail || !regSenha) {
      setRegError('Preencha os campos obrigatórios (*).');
      return;
    }

    const newUser: User = {
      id: `usr_new_${Date.now()}`,
      nome: regNome,
      email: regEmail,
      perfil: regPerfil,
      telefone: regTelefone,
      whatsapp: regWhatsapp,
      cpf: regCpf,
      data_nascimento: regDataNasc,
      ativo: true,
      ultimo_login: 'Primeiro acesso',
      created_at: new Date().toLocaleDateString('pt-BR')
    };

    onAddNewUserByAdmin(newUser);
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      onLoginSuccess(newUser);
      onClose();
    }, 1500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  const handleAdminCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUserNome || !adminUserEmail) return;

    const createdUser: User = {
      id: `usr_adm_created_${Date.now()}`,
      nome: adminUserNome,
      email: adminUserEmail,
      perfil: adminUserPerfil,
      ativo: true,
      ultimo_login: 'Nunca',
      created_at: new Date().toLocaleDateString('pt-BR')
    };

    onAddNewUserByAdmin(createdUser);
    setAdminUserNome('');
    setAdminUserEmail('');
    alert(`Usuário ${adminUserNome} (${adminUserPerfil}) cadastrado com sucesso!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <header className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>ÍRIS CLIN</span>
                <span className="text-[10px] bg-sky-400/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full font-extrabold">
                  RBAC AUTH SYSTEM
                </span>
              </h2>
              <p className="text-xs text-slate-300">Autenticação Segura &amp; Controle de Acesso por Perfil</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* LOGGED IN STATUS BAR */}
        {currentUser && (
          <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Conectado como: <strong className="text-white font-extrabold">{currentUser.nome}</strong></span>
              <span className="text-[10px] font-black bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-md uppercase">
                {currentUser.perfil}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentUser.perfil === 'ADMIN' && (
                <>
                  <button
                    onClick={() => setViewMode('admin_users')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                      viewMode === 'admin_users' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Gerenciar Usuários
                  </button>
                  <button
                    onClick={() => setViewMode('audit_logs')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                      viewMode === 'audit_logs' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Auditoria
                  </button>
                </>
              )}

              <button
                onClick={onLogout}
                className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        )}

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">

          {/* VIEW 1: LOGIN */}
          {viewMode === 'login' && (
            <div className="max-w-md mx-auto space-y-6">
              
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Acessar a Plataforma</h3>
                <p className="text-xs text-slate-500">Informe seu e-mail e senha para entrar no seu painel</p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">E-mail</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@irisclin.com.br"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setViewMode('forgot')}
                    className="text-sky-700 hover:text-sky-900 hover:underline cursor-pointer"
                  >
                    Esqueci minha senha
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('register')}
                    className="text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
                  >
                    Criar conta
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                >
                  ENTRAR NA PLATAFORMA
                </button>
              </form>

              {/* SSO BUTTONS */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-wider">Ou acesse com SSO Corporativo</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePresetQuickLogin(PRESET_USERS[0])}
                    className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <span>Entrar com Google</span>
                  </button>

                  <button
                    onClick={() => handlePresetQuickLogin(PRESET_USERS[2])}
                    className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <span>Entrar com Microsoft</span>
                  </button>
                </div>
              </div>

              {/* QUICK ACCESSIBLE PRESET ACCOUNTS (DEMO) */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> ACESSO RÁPIDO AOS USUÁRIOS PRÉ-CADASTRADOS
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-[10px] text-slate-400 font-bold">Administradores:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_USERS.filter(u => u.perfil === 'ADMIN').map(u => (
                      <button
                        key={u.id}
                        onClick={() => handlePresetQuickLogin(u)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-sky-600 text-white font-bold text-[11px] rounded-lg border border-slate-700 transition-all cursor-pointer"
                      >
                        {u.nome} (ADMIN)
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold mt-2">Médico:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_USERS.filter(u => u.perfil === 'MEDICO').map(u => (
                      <button
                        key={u.id}
                        onClick={() => handlePresetQuickLogin(u)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-600 text-white font-bold text-[11px] rounded-lg border border-slate-700 transition-all cursor-pointer"
                      >
                        {u.nome} (MÉDICO)
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold mt-2">Recepcionistas:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_USERS.filter(u => u.perfil === 'RECEPCIONISTA').map(u => (
                      <button
                        key={u.id}
                        onClick={() => handlePresetQuickLogin(u)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600 text-white font-bold text-[11px] rounded-lg border border-slate-700 transition-all cursor-pointer"
                      >
                        {u.nome}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VIEW 2: REGISTER ("CRIAR CONTA") */}
          {viewMode === 'register' && (
            <div className="max-w-lg mx-auto space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Cadastro de Novo Usuário</h3>
                  <p className="text-xs text-slate-500">Cadastro público restrito a Pacientes e Médicos</p>
                </div>
                <button
                  onClick={() => setViewMode('login')}
                  className="text-xs font-bold text-sky-700 hover:underline"
                >
                  Voltar ao Login
                </button>
              </div>

              {regSuccess && (
                <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Conta criada com sucesso! Redirecionando...</span>
                </div>
              )}

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl">
                  {regError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-black text-slate-700 uppercase">Tipo de Usuário</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setRegPerfil('PACIENTE')}
                      className={`py-2 px-3 rounded-xl font-black border transition-all ${
                        regPerfil === 'PACIENTE' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      Paciente
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegPerfil('MEDICO')}
                      className={`py-2 px-3 rounded-xl font-black border transition-all ${
                        regPerfil === 'MEDICO' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      Médico
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Recepcionistas e Administradores só podem ser cadastrados por um Administrador.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-black text-slate-700 uppercase">Nome Completo *</label>
                    <input
                      type="text"
                      value={regNome}
                      onChange={(e) => setRegNome(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-black text-slate-700 uppercase">CPF</label>
                    <input
                      type="text"
                      value={regCpf}
                      onChange={(e) => setRegCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-black text-slate-700 uppercase">Nascimento</label>
                    <input
                      type="date"
                      value={regDataNasc}
                      onChange={(e) => setRegDataNasc(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-black text-slate-700 uppercase">Telefone</label>
                    <input
                      type="text"
                      value={regTelefone}
                      onChange={(e) => setRegTelefone(e.target.value)}
                      placeholder="(71) 90000-0000"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-black text-slate-700 uppercase">WhatsApp</label>
                    <input
                      type="text"
                      value={regWhatsapp}
                      onChange={(e) => setRegWhatsapp(e.target.value)}
                      placeholder="(71) 90000-0000"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-black text-slate-700 uppercase">E-mail *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-black text-slate-700 uppercase">Senha *</label>
                    <input
                      type="password"
                      value={regSenha}
                      onChange={(e) => setRegSenha(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-black text-slate-700 uppercase">Confirmar Senha *</label>
                    <input
                      type="password"
                      value={regConfirmSenha}
                      onChange={(e) => setRegConfirmSenha(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase rounded-xl shadow-md cursor-pointer transition-all mt-2"
                >
                  FINALIZAR CADASTRO
                </button>
              </form>

            </div>
          )}

          {/* VIEW 3: FORGOT PASSWORD */}
          {viewMode === 'forgot' && (
            <div className="max-w-md mx-auto space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Recuperação de Senha</h3>
                  <p className="text-xs text-slate-500">Enviaremos um link de validação válido por 30 minutos</p>
                </div>
                <button onClick={() => setViewMode('login')} className="font-bold text-sky-700 hover:underline">
                  Voltar
                </button>
              </div>

              {forgotSent ? (
                <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold rounded-2xl space-y-2">
                  <p className="font-black text-sm">Link enviado com sucesso!</p>
                  <p>Verifique sua caixa de entrada para redefinir a senha. O link expira em 30 minutos.</p>
                  <button
                    onClick={() => setViewMode('login')}
                    className="mt-2 px-4 py-2 bg-emerald-700 text-white font-black rounded-xl cursor-pointer"
                  >
                    Ir para Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="font-black text-slate-700 uppercase">Informe seu e-mail cadastrado</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seu.email@irisclin.com.br"
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-black uppercase rounded-xl cursor-pointer"
                  >
                    ENVIAR LINK DE RECUPERAÇÃO
                  </button>
                </form>
              )}
            </div>
          )}

          {/* VIEW 4: ADMIN USER MANAGEMENT (`usuarios` Table) */}
          {viewMode === 'admin_users' && currentUser?.perfil === 'ADMIN' && (
            <div className="space-y-6 text-xs">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Gestão de Usuários e Permissões (ADMIN)</h3>
                  <p className="text-xs text-slate-500">Cadastre Recepcionistas, Administradores, Médicos e altere permissões</p>
                </div>
                <button onClick={() => setViewMode('login')} className="font-bold text-sky-700 hover:underline">
                  Fechar Painel
                </button>
              </div>

              {/* CREATE USER FORM FOR ADMIN */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-indigo-600" />
                  <span>Cadastrar Novo Colaborador</span>
                </h4>

                <form onSubmit={handleAdminCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-black text-slate-700 uppercase">Perfil / Função</label>
                    <select
                      value={adminUserPerfil}
                      onChange={(e) => setAdminUserPerfil(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="RECEPCIONISTA">RECEPCIONISTA</option>
                      <option value="ADMIN">ADMINISTRADOR</option>
                      <option value="MEDICO">MÉDICO</option>
                      <option value="PACIENTE">PACIENTE</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-black text-slate-700 uppercase">Nome Completo</label>
                    <input
                      type="text"
                      value={adminUserNome}
                      onChange={(e) => setAdminUserNome(e.target.value)}
                      placeholder="Ex: Tailane Silva"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-black text-slate-700 uppercase">E-mail</label>
                    <input
                      type="email"
                      value={adminUserEmail}
                      onChange={(e) => setAdminUserEmail(e.target.value)}
                      placeholder="tailane@irisclin.com.br"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl cursor-pointer"
                    >
                      Salvar Usuário na Tabela
                    </button>
                  </div>
                </form>
              </div>

              {/* USERS LIST TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-3 bg-slate-100 font-black text-slate-900 border-b border-slate-200 flex justify-between items-center">
                  <span>Tabela de Usuários Registrados ({allUsers.length})</span>
                </div>

                <div className="divide-y divide-slate-200">
                  {allUsers.map(u => (
                    <div key={u.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-black">{u.nome}</strong>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                            u.perfil === 'ADMIN' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                            u.perfil === 'MEDICO' ? 'bg-cyan-100 text-cyan-900 border-cyan-300' :
                            u.perfil === 'RECEPCIONISTA' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' :
                            'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                            {u.perfil}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{u.email} • Último login: {u.ultimo_login || 'Recente'}</p>
                      </div>

                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        ATIVO
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* VIEW 5: AUDIT LOGS */}
          {viewMode === 'audit_logs' && currentUser?.perfil === 'ADMIN' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Trilha de Auditoria &amp; Logs LGPD</h3>
                  <p className="text-xs text-slate-500">Registro de ações, logins, horários, IP e dispositivos de acesso</p>
                </div>
                <button onClick={() => setViewMode('login')} className="font-bold text-sky-700 hover:underline">
                  Fechar
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="divide-y divide-slate-200">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-3 space-y-1 hover:bg-slate-50">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-indigo-900 font-black">{log.usuario_nome} ({log.perfil})</span>
                        <span className="text-slate-400 font-mono text-[11px]">{log.horario}</span>
                      </div>
                      <p className="text-slate-800 font-bold">{log.acao}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>IP: {log.ip}</span>
                        <span>• Dispositivo: {log.dispositivo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
