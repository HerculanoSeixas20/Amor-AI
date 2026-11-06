import React, { useState, useEffect } from "react";
import { 
  Heart, Mail, Lock, User, Sparkles, ShieldCheck, Eye, EyeOff, ArrowRight, Check, 
  AlertCircle, Clock, Key, Sun, Moon, Shield
} from "lucide-react";
import { apiRequest, ApiError } from "../lib/apiClient";
import { 
  isSupabaseConfigured, 
  signUpWithSupabase, 
  signInWithSupabase, 
  syncRuntimeSupabaseConfig 
} from "../lib/supabase";

interface LoginProps {
  onLoginSuccess: (email: string, name: string, plan: "Free" | "Premium") => void;
}

function cleanNameFallback(email: string): string {
  if (!email) return "Utilizador";
  const prefix = email.split("@")[0] || "Utilizador";
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

// Destaques rotativos sobre a plataforma Amor IA
const FEATURE_HIGHLIGHTS = [
  {
    title: "3 Dias de Avaliação Gratuita",
    desc: "Acesso total e irrestrito a todos os motores de inteligência relacional durante 72 horas para transformar o seu relacionamento.",
    tag: "TESTE GRÁTIS"
  },
  {
    title: "Diagnósticos de Conversas Reais",
    desc: "Submeta mensagens e conversas para analisar o nível de interesse, compatibilidade afetiva e intenção emocional oculta.",
    tag: "PSICOLOGIA IA"
  },
  {
    title: "Simulador de Diálogos & Encontros",
    desc: "Treine abordagens, respostas difíceis e conversas delicadas com o simulador comportamental antes de falar com o parceiro.",
    tag: "SIMULADOR"
  },
  {
    title: "Plano de Reconquista & Conexão",
    desc: "Estratégias personalizadas passo a passo para reacender a atração, superar crises de comunicação e fortalecer a união.",
    tag: "RELACIONAMENTOS"
  }
];

export default function Login({ onLoginSuccess }: LoginProps) {
  // Modo de formulário: "signin" (Iniciar Sessão), "signup" (Criar Conta), ou "forgot" (Recuperar Palavra-passe)
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  
  // Campos do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Controlo de visibilidade e feedback
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para Recuperação de Palavra-passe
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  // Tema: escuro ou claro
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("amor_ia_theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    syncRuntimeSupabaseConfig().catch(() => {});
    const saved = localStorage.getItem("amor_ia_theme");
    if (saved === "light") {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "light") {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
    }
    localStorage.setItem("amor_ia_theme", nextTheme);
  };

  // Carrossel rotativo de funcionalidades
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % FEATURE_HIGHLIGHTS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Atalho limpo para preencher conta do administrador
  const handleAdminPreset = () => {
    setEmail("chillplaces9@gmail.com");
    setMode("signin");
    setError(null);
    setMessage("E-mail de administrador preenchido. Digite a sua palavra-passe para entrar.");
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    setMessage(null);

    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail) {
      setError("Por favor, introduza o seu endereço de e-mail.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Por favor, introduza um e-mail válido (exemplo: utilizador@dominio.com).");
      return;
    }

    // 1. FLUXO: RECUPERAR PALAVRA-PASSE
    if (mode === "forgot") {
      setIsLoading(true);
      try {
        if (!isCodeSent) {
          const data = await apiRequest<{ success: boolean; simulatedCode?: string; message?: string }>("/api/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email: cleanEmail })
          });
          setIsLoading(false);
          if (data.success) {
            setIsCodeSent(true);
            setSimulatedCode(data.simulatedCode || null);
            setMessage("Código de segurança temporário gerado para verificação.");
          }
        } else {
          if (!recoveryCode.trim() || !newPassword.trim()) {
            setIsLoading(false);
            setError("Por favor, introduza o código de verificação de 6 dígitos e a nova palavra-passe.");
            return;
          }
          if (newPassword.trim().length < 6) {
            setIsLoading(false);
            setError("A nova palavra-passe deve conter pelo menos 6 caracteres.");
            return;
          }

          const data = await apiRequest<{ success: boolean; user?: any }>("/api/reset-password", {
            method: "POST",
            body: JSON.stringify({ 
              email: cleanEmail, 
              code: recoveryCode.trim(), 
              newPassword: newPassword.trim() 
            })
          });
          setIsLoading(false);
          if (data.success && data.user) {
            setMessage("Palavra-passe atualizada com sucesso! A iniciar sessão...");
            setTimeout(() => {
              onLoginSuccess(data.user.email, data.user.name, data.user.plan);
            }, 800);
          }
        }
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || "Erro ao conectar ao serviço de recuperação.");
      }
      return;
    }

    // Validação da palavra-passe para Login e Registo
    const cleanPassword = password.trim();
    if (!cleanPassword) {
      setError("Por favor, introduza a sua palavra-passe.");
      return;
    }

    // 2. FLUXO: CRIAR CONTA (REGISTO COM 3 DIAS GRÁTIS)
    if (mode === "signup") {
      const cleanName = name.trim();
      if (!cleanName) {
        setError("Por favor, introduza o seu nome completo.");
        return;
      }
      if (cleanPassword.length < 6) {
        setError("A palavra-passe deve conter pelo menos 6 caracteres.");
        return;
      }

      setIsLoading(true);

      // Prioridade 1: Se o Supabase estiver configurado, utilizar supabase.auth.signUp()
      if (isSupabaseConfigured()) {
        try {
          const sbRes = await signUpWithSupabase({
            email: cleanEmail,
            password: cleanPassword,
            fullName: cleanName
          });

          if (!sbRes.success) {
            setIsLoading(false);
            if (sbRes.code === "ACCOUNT_EXISTS") {
              setMode("signin");
              setMessage(sbRes.message || "Este e-mail já possui uma conta criada. Digite a sua palavra-passe para entrar.");
            } else {
              setError(sbRes.message || "Não foi possível concluir o registo no Supabase.");
            }
            return;
          }

          // Se a confirmação de e-mail estiver ativa no Supabase
          if (sbRes.emailConfirmationRequired) {
            setIsLoading(false);
            setMessage("Conta criada no Supabase com sucesso! Enviámos uma mensagem para " + cleanEmail + ". Por favor, confirme o e-mail antes de aceder.");
            setMode("signin");
            return;
          }

          // Sincronizar criação no backend para ativar auditoria e período de 3 dias
          try {
            await apiRequest<{ success: boolean; user?: any }>("/api/register-user", {
              method: "POST",
              body: JSON.stringify({ 
                email: cleanEmail, 
                name: cleanName, 
                password: cleanPassword,
                isRegistration: true,
                supabaseUid: sbRes.user?.id
              })
            });
          } catch (syncErr) {
            console.warn("Aviso ao sincronizar registo Supabase com o backend:", syncErr);
          }

          setIsLoading(false);
          setMessage("Conta criada com sucesso! 3 dias de teste gratuito ativados.");
          setTimeout(() => {
            onLoginSuccess(cleanEmail, cleanName, "Free");
          }, 500);
          return;
        } catch (err: any) {
          setIsLoading(false);
          setError(err.message || "Erro inesperado ao registar com o Supabase.");
          return;
        }
      }

      // Prioridade 2: Backend Express integrado se o Supabase não estiver configurado
      try {
        const data = await apiRequest<{ success: boolean; user?: any }>("/api/register-user", {
          method: "POST",
          body: JSON.stringify({ 
            email: cleanEmail, 
            name: cleanName, 
            password: cleanPassword,
            isRegistration: true
          })
        });

        setIsLoading(false);
        if (data.success && data.user) {
          setMessage("Conta criada com sucesso! 3 dias de teste gratuito ativados.");
          setTimeout(() => {
            onLoginSuccess(data.user.email, data.user.name, data.user.plan);
          }, 500);
        } else {
          setError("Não foi possível criar a conta. Tente novamente.");
        }
      } catch (err: any) {
        setIsLoading(false);
        if (err instanceof ApiError && (err.code === "ACCOUNT_EXISTS" || err.status === 409)) {
          setMode("signin");
          setMessage("Este e-mail já possui uma conta criada. Digite a sua palavra-passe para entrar.");
        } else {
          setError(err.message || "Não foi possível concluir o registo. Verifique os dados inseridos.");
        }
      }
      return;
    }

    // 3. FLUXO: INICIAR SESSÃO (LOGIN DIRETO)
    setIsLoading(true);

    // Prioridade 1: Se o Supabase estiver configurado, utilizar supabase.auth.signInWithPassword()
    if (isSupabaseConfigured()) {
      try {
        const sbRes = await signInWithSupabase({
          email: cleanEmail,
          password: cleanPassword
        });

        if (!sbRes.success) {
          setIsLoading(false);
          setError(sbRes.message || "Credenciais inválidas no Supabase.");
          return;
        }

        // Sincronizar com o backend para obter plano e registo de sessão
        let userPlan: "Free" | "Premium" = cleanEmail === "chillplaces9@gmail.com" ? "Premium" : "Free";
        let userName = sbRes.user?.name || cleanNameFallback(cleanEmail);

        try {
          const syncData = await apiRequest<{ success: boolean; user?: any; plan?: "Free" | "Premium" }>("/api/login", {
            method: "POST",
            body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
          });
          if (syncData?.user?.plan) {
            userPlan = syncData.user.plan;
          }
          if (syncData?.user?.name) {
            userName = syncData.user.name;
          }
        } catch (syncErr) {
          console.warn("Aviso ao sincronizar login Supabase com o backend:", syncErr);
        }

        setIsLoading(false);
        onLoginSuccess(cleanEmail, userName, userPlan);
        return;
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || "Erro inesperado ao iniciar sessão no Supabase.");
        return;
      }
    }

    // Prioridade 2: Backend Express integrado se o Supabase não estiver configurado
    try {
      const data = await apiRequest<{ success: boolean; user?: any }>("/api/login", {
        method: "POST",
        body: JSON.stringify({ 
          email: cleanEmail, 
          password: cleanPassword 
        })
      });

      setIsLoading(false);
      if (data.success && data.user) {
        onLoginSuccess(data.user.email, data.user.name, data.user.plan);
      } else {
        setError("Credenciais inválidas. Verifique os dados inseridos.");
      }
    } catch (err: any) {
      setIsLoading(false);
      if (err instanceof ApiError && err.status === 401) {
        setError("Palavra-passe incorreta. Se esqueceu a sua palavra-passe, clique em 'Esqueceu-se?' abaixo.");
      } else {
        setError(err.message || "Não foi possível iniciar sessão. Verifique os dados e tente novamente.");
      }
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#050507] text-slate-100 flex items-center justify-center relative overflow-hidden font-sans p-4 sm:p-6">
      
      {/* Botão de alternar tema (Canto Superior Direito) */}
      <div className="fixed top-5 right-5 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
          title={theme === "dark" ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Tema Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Tema Escuro</span>
            </>
          )}
        </button>
      </div>

      {/* Luzes de ambiente sutis */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-[#FF3B30]/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-[#06B6D4]/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Cartão Principal do Login */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 rounded-[2.5rem] border border-slate-900 bg-slate-950/80 backdrop-blur-3xl overflow-hidden shadow-2xl relative z-10 transition-all">
        
        {/* Coluna Esquerda: Marca & Destaques de Valor (Desktop) */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#140b0d] via-[#10080a] to-[#070609] p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-900/80 flex flex-col justify-between relative overflow-hidden">
          
          <div className="space-y-6 relative z-10">
            {/* Logótipo Amor IA */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9E1B1B] via-[#FF3B30] to-rose-400 flex items-center justify-center shadow-lg shadow-[#FF3B30]/25 text-white">
                <Heart className="w-6 h-6 fill-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white font-display flex items-center gap-2">
                  AMOR IA
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30 uppercase font-bold">
                    PRO
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Inteligência Relacional Avançada
                </p>
              </div>
            </div>

            {/* Selo de 3 Dias Grátis */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF3B30]/15 via-rose-500/10 to-transparent border border-[#FF3B30]/25 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-[#FF3B30] font-black text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>3 Dias de Teste Gratuito</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Novos utilizadores usufruem de <strong>72 horas de acesso completo</strong> a todas as funcionalidades inteligentes sem custos.
              </p>
            </div>

            {/* Destaque Rotativo */}
            <div className="min-h-[140px] p-5 rounded-2xl bg-slate-900/40 border border-slate-900 text-xs space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                  {FEATURE_HIGHLIGHTS[tipIndex].tag}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h3 className="font-bold text-white text-sm">
                {FEATURE_HIGHLIGHTS[tipIndex].title}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {FEATURE_HIGHLIGHTS[tipIndex].desc}
              </p>
            </div>
          </div>

          {/* Rodapé da Coluna Esquerda */}
          <div className="relative z-10 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-900/60 pt-5 mt-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Encriptação de Ponta a Ponta
            </span>
            <span className="text-slate-400 font-bold">
              Angola & Internacional
            </span>
          </div>
        </div>

        {/* Coluna Direita: Formulário de Autenticação */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-[#07070B]/50 relative">
          
          <div className="w-full max-w-md mx-auto space-y-6">
            
            {/* Cabeçalho do Formulário */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF3B30] px-3 py-1 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 inline-block">
                  {mode === "signin" ? "Acesso à Plataforma" : mode === "signup" ? "Novo Registo" : "Recuperação"}
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
                {mode === "forgot" 
                  ? "Recuperar Palavra-passe" 
                  : mode === "signup" 
                    ? "Criar Conta Gratuita" 
                    : "Iniciar Sessão"}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {mode === "forgot"
                  ? "Introduza o seu e-mail para receber um código de recuperação seguro."
                  : mode === "signup"
                    ? "Cadastre a sua conta e receba imediatamente 3 dias de teste gratuito ilimitado."
                    : "Aceda à sua conta com o seu endereço de e-mail e palavra-passe."}
              </p>
            </div>

            {/* Alternador de Abas (Iniciar Sessão vs Criar Conta) */}
            {mode !== "forgot" && (
              <div className="grid grid-cols-2 p-1.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setMessage(null);
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    mode === "signin"
                      ? "bg-[#FF3B30] text-white shadow-md shadow-[#FF3B30]/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-850/50"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Iniciar Sessão</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setMessage(null);
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    mode === "signup"
                      ? "bg-[#FF3B30] text-white shadow-md shadow-[#FF3B30]/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-850/50"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Criar Conta (3 Dias)</span>
                </button>
              </div>
            )}

            {/* Mensagens de Sucesso e Erro */}
            {message && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in shadow-sm">
                <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="leading-relaxed">{message}</span>
              </div>
            )}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* FORMULÁRIO DE RECUPERAÇÃO DE PALAVRA-PASSE */}
            {mode === "forgot" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isCodeSent ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Endereço de E-mail
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-[#FF3B30]/60 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-semibold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 bg-[#FF3B30] hover:bg-[#FF4D4D] text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF3B30]/20 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          A processar...
                        </span>
                      ) : (
                        <>
                          <span>Enviar Código de Recuperação</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {simulatedCode && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-1">
                        <span className="font-bold text-[10px] uppercase tracking-wide block text-amber-400">
                          Código de Recuperação (Verificação)
                        </span>
                        <p className="text-slate-300">
                          Código gerado para <strong className="text-white">{email}</strong>:{" "}
                          <span className="font-mono font-black text-sm tracking-widest text-amber-400 px-2 py-0.5 bg-slate-950 rounded border border-amber-500/30">
                            {simulatedCode}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Código de 6 Dígitos
                      </label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={recoveryCode}
                          onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-[#FF3B30]/60 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-mono font-bold tracking-widest text-center"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Nova Palavra-passe
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres..."
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-[#FF3B30]/60 rounded-2xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 bg-[#FF3B30] hover:bg-[#FF4D4D] text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF3B30]/20 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          A redefinir...
                        </span>
                      ) : (
                        <>
                          <span>Atualizar Palavra-passe e Entrar</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setIsCodeSent(false);
                    setRecoveryCode("");
                    setSimulatedCode(null);
                    setError(null);
                    setMessage(null);
                  }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors pt-2 block font-semibold hover:underline cursor-pointer"
                >
                  Voltar ao ecrã de início de sessão
                </button>
              </form>
            ) : (
              /* FORMULÁRIO PRINCIPAL: INICIAR SESSÃO OU CRIAR CONTA */
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Nome completo (Apenas em Criar Conta) */}
                {mode === "signup" && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Carlos Silva"
                        className="w-full bg-slate-950/60 border border-slate-800 focus:border-[#FF3B30]/60 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* Endereço de E-mail */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Endereço de E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-[#FF3B30]/60 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Palavra-passe */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Palavra-passe
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setError(null);
                          setMessage(null);
                        }}
                        className="text-xs font-bold text-[#FF3B30] hover:text-[#FF4D4D] transition-colors hover:underline cursor-pointer"
                      >
                        Esqueceu-se?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite a sua palavra-passe..."
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-[#FF3B30]/60 rounded-2xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Botão Principal de Ação */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 mt-2 bg-[#FF3B30] hover:bg-[#FF4D4D] text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-[#FF3B30]/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      A autenticar...
                    </span>
                  ) : (
                    <>
                      <span>{mode === "signup" ? "Registar Conta e Iniciar 3 Dias Grátis" : "Iniciar Sessão"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Alternador de Modo no Rodapé */}
                <div className="text-center pt-2">
                  {mode === "signup" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setError(null);
                        setMessage(null);
                      }}
                      className="text-xs text-slate-400 hover:text-white transition-colors font-semibold hover:underline cursor-pointer"
                    >
                      Já tem uma conta de acesso? <strong className="text-white">Iniciar Sessão</strong>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setError(null);
                        setMessage(null);
                      }}
                      className="text-xs text-slate-400 hover:text-white transition-colors font-semibold hover:underline cursor-pointer"
                    >
                      Ainda não tem conta? <strong className="text-[#FF3B30]">Criar conta com 3 dias de teste gratuito</strong>
                    </button>
                  )}
                </div>

                {/* Atalho discreto para Administrador */}
                <div className="pt-3 border-t border-slate-900/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    Acesso Seguro
                  </span>
                  <button
                    type="button"
                    onClick={handleAdminPreset}
                    className="text-slate-500 hover:text-cyan-400 font-mono transition-colors cursor-pointer text-[10px]"
                    title="Preencher credencial de administrador"
                  >
                    Painel Admin (chillplaces9@gmail.com)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
