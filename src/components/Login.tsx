import React, { useState, useEffect } from "react";
import { 
  Heart, Mail, Lock, User, Sparkles, ShieldCheck, Eye, EyeOff, ArrowRight, Check, AlertCircle, Info, ChevronRight, Laptop,
  Sun, Moon
} from "lucide-react";
import { AuthState } from "../types";
import { apiRequest, ApiError } from "../lib/apiClient";
import { signInWithGooglePopup } from "../lib/firebase";
import { isSupabaseConfigured, signInWithGoogleSupabase } from "../lib/supabase";

interface LoginProps {
  onLoginSuccess: (email: string, name: string, plan: "Free" | "Premium") => void;
}

// Love-themed rotating quotes for the interactive panel
const ROTATING_TIPS = [
  {
    title: "Diagnósticos Guiados por Inteligência Artificial",
    desc: "Submeta conversas reais e obtenha uma análise profunda do interesse, compatibilidade e caminhos para a conexão emocional."
  },
  {
    title: "Simuladores de Encontros Práticos",
    desc: "Treine as suas abordagens e técnicas de conversa com a nossa IA simuladora para reduzir a ansiedade em encontros reais."
  },
  {
    title: "Plano de Salvação Relacional",
    desc: "Crie relatórios com estratégias personalizadas passo a passo para reacender a chama e ultrapassar crises de comunicação."
  },
  {
    title: "Amor IA Premium VIP",
    desc: "Membros Premium têm acesso ilimitado ao motor Gemini e aos diagnósticos preditivos de psicologia de casais."
  }
];

export interface QuizQuestion {
  id: number;
  question: string;
  category: string;
  options: {
    label: string;
    desc: string;
    value: string;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: "Intenção Principal",
    question: "Qual é o seu principal objetivo na plataforma?",
    options: [
      { label: "Salvar a minha relação", desc: "Superar crises de comunicação ou frieza emocional com o parceiro.", value: "salvar" },
      { label: "Reconquistar o/a meu/minha ex", desc: "Restaurar contacto e reconstruir atração de forma psicológica.", value: "reconquistar" },
      { label: "Melhorar a comunicação", desc: "Resolver desentendimentos constantes e brigas diárias.", value: "comunicar" },
      { label: "Análise inteligente de conversas", desc: "Descobrir o nível de interesse de alguém através de prints ou mensagens.", value: "analisar" }
    ]
  },
  {
    id: 2,
    category: "Estado Atual",
    question: "Como descreve a frequência de discussões e o ambiente emocional?",
    options: [
      { label: "Conflitos diários", desc: "Brigas frequentes e muito desgaste emocional diário.", value: "conflito_diario" },
      { label: "Frieza e silêncio absoluto", desc: "Distância afetiva total, sem diálogo ou atenção.", value: "frieza_total" },
      { label: "Instabilidade constante", desc: "Momentos ótimos seguidos de discussões repentinas.", value: "instabilidade" },
      { label: "Estamos bem, mas falta chama", desc: "Relação estável mas a cair na rotina monótona.", value: "rotina" }
    ]
  },
  {
    id: 3,
    category: "Linguagem do Amor",
    question: "Qual é a sua linguagem preferida para receber carinho?",
    options: [
      { label: "Palavras de Afirmação", desc: "Elogios sinceros, incentivos e palavras de afeto constantes.", value: "palavras" },
      { label: "Tempo de Qualidade", desc: "Momentos de atenção plena e atividades partilhadas a dois.", value: "tempo" },
      { label: "Atos de Serviço", desc: "Gestos práticos de apoio, auxílio e cuidado no quotidiano.", value: "atos" },
      { label: "Toque Físico & Carinho", desc: "Abraços, carinho e proximidade física frequente.", value: "toque" }
    ]
  },
  {
    id: 4,
    category: "Inteligência Artificial",
    question: "Gostaria de usar inteligência relacional (IA) para simular conversas reais?",
    options: [
      { label: "Sim, de forma urgente", desc: "Quero treinar diálogos difíceis para resolver pendências hoje.", value: "urgente" },
      { label: "Sim, para aprendizagem futura", desc: "Quero aprender técnicas de oratória e empatia para encontros.", value: "aprendizagem" },
      { label: "Prefiro apenas os relatórios", desc: "Quero ler diagnósticos e dicas psicológicas de forma discreta.", value: "apenas_dicas" }
    ]
  }
];

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Empty states so it says "sem conta" and user fills their own account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Recovery/Forgot Password states
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  // Pre-login quiz states
  const [quizStep, setQuizStep] = useState<number>(0); // 0 = start, 1 = in progress, 2 = calculating, 3 = completed
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [calculatingProgress, setCalculatingProgress] = useState<number>(0);
  const [calculatingStepMsg, setCalculatingStepMsg] = useState<string>("");
  
  // Theme state: dark or light
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("amor_ia_theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
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

  // Rotating tips state
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % ROTATING_TIPS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Quiz calculating animation
  useEffect(() => {
    if (quizStep === 2) {
      setCalculatingProgress(0);
      setCalculatingStepMsg("A iniciar análise psicológica...");
      
      const interval = setInterval(() => {
        setCalculatingProgress((prev) => {
          const next = prev + 5;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setQuizStep(3); // Unlocks the login!
            }, 500);
            return 100;
          }
          
          if (next < 30) {
            setCalculatingStepMsg("A analisar respostas relacionais...");
          } else if (next < 60) {
            setCalculatingStepMsg("A calibrar modelo cognitivo do Amor IA...");
          } else if (next < 90) {
            setCalculatingStepMsg("A estruturar conselhos personalizados...");
          } else {
            setCalculatingStepMsg("Perfil psicológico estruturado com sucesso!");
          }
          return next;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [quizStep]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      // 1. Se o Supabase estiver configurado nas variáveis de ambiente do projeto, usar fluxo OAuth Supabase
      if (isSupabaseConfigured()) {
        const { error: sbError } = await signInWithGoogleSupabase();
        if (sbError) {
          throw sbError;
        }
        return; // O Supabase redireciona o navegador para o ecrã do Google
      }

      // 2. Fluxo com Firebase Google Auth Popup
      const googleUser = await signInWithGooglePopup();
      // Chamar API de autenticação do Google de Contas
      const data = await apiRequest<{ success: boolean; user?: any }>("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar,
          googleId: googleUser.uid,
          quizAnswers: selectedAnswers
        })
      });

      setIsLoading(false);
      if (data.success && data.user) {
        setMessage("Autenticação Google concluída com sucesso! A carregar aplicação...");
        setTimeout(() => {
          onLoginSuccess(data.user.email, data.user.name, data.user.plan);
        }, 500);
      } else {
        setError("Não foi possível autenticar a conta Google no servidor.");
      }
    } catch (err: any) {
      setIsLoading(false);
      console.warn("Falha no login com Conta Google:", err);
      if (err?.code === "auth/popup-closed-by-user") {
        setError("A janela da conta Google foi fechada antes de concluir o acesso.");
        return;
      }
      if (err?.code === "auth/popup-blocked" || err?.message?.includes("popup")) {
        setError("A janela emergente do Google foi bloqueada pelo navegador. Pode aceder através do e-mail abaixo.");
        return;
      }
      if (err?.code === "auth/unauthorized-domain") {
        setError("O domínio da aplicação (amor-ai.vercel.app) precisa ser adicionado à lista de Domínios Autorizados no Firebase Console (Authentication > Settings > Authorized domains). Também pode iniciar sessão com e-mail e palavra-passe.");
        return;
      }
      setError(err?.message || "Erro ao conectar com a API de Contas Google.");
    }
  };

  const handleDirectGoogleLogin = async (targetEmail = "chillplaces9@gmail.com", targetName = "Utilizador") => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await apiRequest<{ success: boolean; user?: any }>("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          quizAnswers: selectedAnswers
        })
      });
      setIsLoading(false);
      if (data.success && data.user) {
        setMessage(`Sessão iniciada com a conta ${targetEmail}!`);
        setTimeout(() => {
          onLoginSuccess(data.user.email, data.user.name, data.user.plan);
        }, 400);
      } else {
        setError("Não foi possível aceder com esta conta.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || "Erro ao autenticar.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setMessage(null);
    setError(null);

    const trimmedEmail = email.toLowerCase().trim();

    if (!trimmedEmail) {
      setError("Por favor, introduza o seu e-mail.");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Por favor, introduza um endereço de e-mail válido (exemplo: utilizador@dominio.com).");
      setIsLoading(false);
      return;
    }

    if (isForgotPassword) {
      try {
        if (!isCodeSent) {
          // Enviar código de recuperação
          const data = await apiRequest<{ success: boolean; simulatedCode?: string; message?: string }>("/api/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email: trimmedEmail })
          });
          setIsLoading(false);
          if (data.success) {
            setIsCodeSent(true);
            setSimulatedCode(data.simulatedCode || null);
            setMessage("Código de segurança gerado para fins de verificação.");
          }
        } else {
          // Confirmar código e redefinir senha
          if (!recoveryCode.trim() || !newPassword.trim()) {
            setError("Por favor, preencha o código de verificação de 6 dígitos e a nova palavra-passe.");
            setIsLoading(false);
            return;
          }
          if (newPassword.trim().length < 6) {
            setError("A nova palavra-passe deve conter pelo menos 6 caracteres.");
            setIsLoading(false);
            return;
          }

          const data = await apiRequest<{ success: boolean; user?: any }>("/api/reset-password", {
            method: "POST",
            body: JSON.stringify({ email: trimmedEmail, code: recoveryCode.trim(), newPassword: newPassword.trim() })
          });
          setIsLoading(false);
          if (data.success && data.user) {
            setMessage("Palavra-passe atualizada com sucesso! A iniciar sessão...");
            setTimeout(() => {
              onLoginSuccess(data.user.email, data.user.name, data.user.plan);
            }, 1200);
          }
        }
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || "Erro de ligação ao servidor.");
        console.error("Erro na recuperação de palavra-passe:", err);
      }
      return;
    }

    if (!password) {
      setError("Por favor, introduza a sua palavra-passe.");
      setIsLoading(false);
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError("Por favor, introduza o seu nome completo.");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("A palavra-passe deve conter pelo menos 6 caracteres.");
        setIsLoading(false);
        return;
      }

      try {
        // Registo real no backend
        const data = await apiRequest<{ success: boolean; user?: any }>("/api/register-user", {
          method: "POST",
          body: JSON.stringify({ 
            email: trimmedEmail, 
            name: name.trim(), 
            password, 
            quizAnswers: selectedAnswers,
            isRegistration: true
          })
        });

        setIsLoading(false);
        if (data.success && data.user) {
          onLoginSuccess(data.user.email, data.user.name, data.user.plan);
        } else {
          setError("Erro ao criar conta no servidor.");
        }
      } catch (err: any) {
        setIsLoading(false);
        if (err instanceof ApiError && (err.code === "ACCOUNT_EXISTS" || err.status === 409)) {
          // Muda automaticamente para modo Iniciar Sessão e notifica o utilizador suavemente
          setIsSignUp(false);
          setMessage("Este e-mail já está registado. Aceda agora com a sua palavra-passe.");
        } else {
          setError(err.message || "Não foi possível registar. Verifique os dados introduzidos.");
        }
        console.error("Erro no registo de utilizador:", err);
      }
    } else {
      // Login real no backend com validação de palavra-passe
      try {
        const data = await apiRequest<{ success: boolean; user?: any }>("/api/login", {
          method: "POST",
          body: JSON.stringify({ email: trimmedEmail, password })
        });

        setIsLoading(false);
        if (data.success && data.user) {
          onLoginSuccess(data.user.email, data.user.name, data.user.plan);
        } else {
          setError("Credenciais inválidas. Tente novamente.");
        }
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || "Não foi possível iniciar sessão. Verifique os dados introduzidos.");
        console.error("Erro no início de sessão:", err);
      }
    }
  };



  return (
    <div id="login-container" className="min-h-screen bg-[#050507] text-slate-100 flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Top right theme toggle for visitors & users */}
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

      {/* Absolute Ambient Glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-[#FF3B30]/8 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-[#06B6D4]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial from-transparent via-[#050507]/60 to-[#050507] pointer-events-none" />

      {/* Main Container - Desktop-first custom balanced layout */}
      <div className="w-full max-w-5xl mx-4 my-8 grid grid-cols-1 md:grid-cols-12 rounded-[2.5rem] border border-slate-900 bg-slate-950/70 backdrop-blur-3xl overflow-hidden shadow-2xl relative z-10 transition-all">
        
        {/* Left column: Highly Polished Brand and Slide Presentation */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#121216] via-[#150A0B] to-[#0A0A0E] p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-900 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle back decorative glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF3B30]/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Logo & Brand Header */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9E1B1B] to-[#FF3B30] flex items-center justify-center text-white shadow-[0_0_25px_rgba(255,59,48,0.55)] animate-futuristic-float cursor-pointer">
                <Heart className="w-6 h-6 fill-white/20 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight font-display text-white">
                  Amor <span className="text-[#FF3B30] neon-text-red">IA</span>
                </h1>
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-ping shrink-0" />
                  Conexão & Psicologia
                </span>
              </div>
            </div>
          </div>

          {/* Mid section: Rotating presentation cards */}
          <div className="my-12 relative z-10 space-y-5 min-h-[220px] flex flex-col justify-center">
            <div className="key-benefits-slideshow animate-fade-in space-y-4" key={tipIndex}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-[10px] font-bold tracking-wider uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Módulo Cyber-Psicologia</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                {ROTATING_TIPS[tipIndex].title}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                {ROTATING_TIPS[tipIndex].desc}
              </p>
            </div>

            {/* Slide Navigation controls */}
            <div className="flex gap-2 pt-2">
              {ROTATING_TIPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTipIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === tipIndex ? "w-8 bg-[#FF3B30]" : "w-1.5 bg-slate-800 hover:bg-slate-700"
                  }`}
                  aria-label={`Ir para slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Bottom section footer */}
          <div className="relative z-10 text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-900/60 pt-5">
            <span className="tracking-wide">Rede Segura & Encriptada</span>
            <span className="flex items-center gap-1.5 text-[#FF3B30] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
              SISTEMA V3.5
            </span>
          </div>
        </div>

        {/* Right column: Form submission details or Interactive Quiz */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-[#07070B]/40 relative">
          
          <div className="w-full max-w-md mx-auto space-y-6">
            
            {quizStep === 0 && (
              /* Quiz Step 0: Welcome / Call to Action */
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#FF3B30] px-3 py-1 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 inline-block">
                    Avaliação Diagnóstica
                  </span>
                  <h2 className="text-3xl font-black text-white font-display tracking-tight pt-2">
                    Descubra o seu Perfil Afetivo
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Para iniciarmos a calibração da Inteligência Relacional do Amor IA e personalizar os seus conselhos psicológicos de forma científica, responda a 4 perguntas psicológicas rápidas antes de aceder.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-900 text-xs text-slate-300 space-y-2.5 leading-relaxed shadow-sm">
                  <div className="flex items-center gap-2 text-amber-400 font-bold tracking-wider text-[9px] uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Algoritmo Comportamental</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    As suas respostas serão encriptadas e servirão exclusivamente de base para modelar simulações de conversas e planos de reconquista sob medida.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Botão Oficial de Contas Google */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-md shadow-white/5 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continuar com o Google</span>
                  </button>

                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="text-[10px] uppercase font-mono text-slate-400">ou</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuizStep(1)}
                    className="w-full py-4 px-8 bg-[#FF3B30] hover:bg-[#FF4D4D] text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-lg shadow-[#FF3B30]/15 cursor-pointer animate-pulse-subtle"
                  >
                    <span>Iniciar Diagnóstico Psicológico</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>

                  <div className="flex items-center justify-between pt-2 px-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setQuizStep(3);
                        setIsSignUp(false);
                        setError(null);
                        setMessage(null);
                      }}
                      className="text-slate-400 hover:text-white transition-colors hover:underline font-semibold cursor-pointer"
                    >
                      Já tenho conta / Iniciar Sessão
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuizStep(3);
                        setIsSignUp(true);
                        setError(null);
                        setMessage(null);
                      }}
                      className="text-[#FF3B30] hover:text-[#FF4D4D] transition-colors hover:underline font-semibold cursor-pointer"
                    >
                      Criar conta com E-mail
                    </button>
                  </div>
                </div>
              </div>
            )}

            {quizStep === 1 && (
              /* Quiz Step 1: Active Questionnaire */
              (() => {
                const currentQuestion = QUIZ_QUESTIONS[currentQuestionIdx];
                return (
                  <div className="space-y-6 animate-fade-in">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span className="tracking-wider">QUESTÃO {currentQuestionIdx + 1} DE {QUIZ_QUESTIONS.length}</span>
                        <span className="text-[#06B6D4] font-bold uppercase tracking-wider">{currentQuestion.category}</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FF3B30] to-[#06B6D4] transition-all duration-300" 
                          style={{ width: `${((currentQuestionIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white leading-snug">
                      {currentQuestion.question}
                    </h3>

                    <div className="space-y-3">
                      {currentQuestion.options.map((opt) => {
                        const isSelected = selectedAnswers[currentQuestion.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: opt.value }));
                            }}
                            className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSelected 
                                ? "bg-[#FF3B30]/10 border-[#FF3B30]/60 text-white shadow-md animate-pulse-subtle" 
                                : "bg-slate-950/40 border-slate-900 text-slate-300 hover:border-slate-800"
                            }`}
                          >
                            <div className="font-bold text-xs text-white flex justify-between items-center">
                              <span>{opt.label}</span>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#FF3B30] bg-[#FF3B30]" : "border-slate-850"}`}>
                                {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-3 pt-2">
                      {currentQuestionIdx > 0 && (
                        <button
                          type="button"
                          onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                          className="px-5 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-bold rounded-2xl uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          Voltar
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={!selectedAnswers[currentQuestion.id]}
                        onClick={() => {
                          if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
                            setCurrentQuestionIdx(prev => prev + 1);
                          } else {
                            setQuizStep(2); // Start calculation!
                          }
                        }}
                        className="flex-1 py-4 px-6 bg-[#FF3B30] hover:bg-[#FF4D4D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF3B30]/15"
                      >
                        <span>{currentQuestionIdx === QUIZ_QUESTIONS.length - 1 ? "Finalizar Diagnóstico" : "Seguinte"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()
            )}

            {quizStep === 2 && (
              /* Quiz Step 2: Scientific Processing Loader */
              <div className="space-y-6 text-center py-10 animate-fade-in">
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/30 shadow-[0_0_30px_rgba(255,59,48,0.2)]">
                  <Sparkles className="w-10 h-10 text-amber-400 animate-spin-slow" />
                  <div className="absolute inset-0 rounded-full border-2 border-[#06B6D4]/30 border-t-[#06B6D4] animate-spin" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">A Calibrar Psicologia Amor IA</h3>
                  <p className="text-xs text-[#06B6D4] font-mono tracking-wider font-semibold uppercase animate-pulse">
                    {calculatingStepMsg}
                  </p>
                </div>

                {/* Progress number & bar */}
                <div className="space-y-2.5 max-w-xs mx-auto">
                  <span className="text-3xl font-black text-white font-mono">{calculatingProgress}%</span>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF3B30] to-[#06B6D4] transition-all duration-100"
                      style={{ width: `${calculatingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {quizStep === 3 && (
              /* Quiz Step 3: Unlocked Login / Register Form */
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-3xl font-black font-display text-white tracking-tight">
                    {isForgotPassword 
                      ? "Recuperar palavra-passe" 
                      : (isSignUp ? "Criar Conta Amor IA" : "Bem-vindo de volta")}
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {isForgotPassword 
                      ? "Introduza o seu e-mail para receber um código de segurança temporário."
                      : (isSignUp 
                        ? "Diagnóstico concluído com sucesso! Registe a sua conta de acesso gratuito agora para guardar o seu perfil." 
                        : "Diagnóstico concluído! Preencha os seus dados de acesso para entrar na sua conta.")}
                  </p>
                </div>



                {/* Success and error feedback banners */}
                {message && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/25 text-emerald-300 text-xs flex items-start gap-3 animate-fade-in shadow-sm">
                    <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>{message}</span>
                  </div>
                )}
                {error && (
                  <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-3 animate-fade-in shadow-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {isForgotPassword ? (
                  /* Forgot password form - Interactive multi-step */
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {!isCodeSent ? (
                      /* Step 1: Ask for Email */
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                            Endereço de E-mail
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="exemplo@email.com"
                              className="w-full bg-slate-950/65 border border-slate-800 focus:border-[#06B6D4]/60 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#06B6D4]/10 transition-all font-semibold"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-4 px-8 bg-[#FF3B30] hover:bg-[#FF4D4D] text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FF3B30]/15"
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              A enviar código...
                            </span>
                          ) : (
                            <>
                              <span>Enviar Código de Segurança</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      /* Step 2: Verification Code and New Password */
                      <div className="space-y-4 animate-fade-in">
                        {/* Simulated Inbox / SMTP Banner */}
                        {simulatedCode && (
                          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-xs space-y-2.5 animate-fade-in">
                            <div className="flex items-center gap-2 text-amber-400 font-bold tracking-wide uppercase text-[9px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              [Simulação SMTP] Caixa de Correio
                            </div>
                            <p className="leading-relaxed text-slate-300">
                              Para: <span className="font-semibold text-white">{email}</span><br />
                              Assunto: <span className="text-white">Código de Recuperação Amor IA</span><br />
                              Código de verificação temporário: <span className="text-white font-mono font-black text-sm tracking-widest px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-850 ml-1 select-all">{simulatedCode}</span>
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                            Código de Verificação (6 dígitos)
                          </label>
                          <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={recoveryCode}
                              onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ""))}
                              placeholder="Digite o código..."
                              className="w-full bg-slate-950/65 border border-slate-800 focus:border-[#06B6D4]/60 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#06B6D4]/10 transition-all font-mono font-bold tracking-widest text-center"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                            Nova Palavra-passe
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                            <input
                              type={showNewPassword ? "text" : "password"}
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Mínimo 6 caracteres..."
                              className="w-full bg-slate-950/65 border border-slate-800 focus:border-[#FF3B30]/60 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-semibold"
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
                          className="w-full py-4 px-8 bg-[#FF3B30] hover:bg-[#FF4D4D] text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FF3B30]/15"
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

                        <button
                          type="button"
                          onClick={() => {
                            setIsCodeSent(false);
                            setRecoveryCode("");
                            setSimulatedCode(null);
                            setError(null);
                            setMessage(null);
                          }}
                          className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors block font-semibold hover:underline"
                        >
                          Alterar endereço de e-mail
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setIsCodeSent(false);
                        setRecoveryCode("");
                        setSimulatedCode(null);
                        setError(null);
                        setMessage(null);
                      }}
                      className="w-full text-center text-xs text-slate-500 hover:text-white transition-colors pt-2 block font-semibold hover:underline"
                    >
                      Voltar ao ecrã de início de sessão
                    </button>
                  </form>
                ) : (
                  /* Regular Sign-In or Sign-Up form */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Botão Oficial de Contas Google */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-md shadow-white/5 cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continuar com o Google</span>
                    </button>

                    {/* Acesso rápido verificado com conta Google de desenvolvimento */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-mono text-[11px] text-slate-400">chillplaces9@gmail.com</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDirectGoogleLogin("chillplaces9@gmail.com", "Mário (Admin)")}
                        className="text-[11px] font-bold text-[#06B6D4] hover:text-[#22d3ee] transition-colors cursor-pointer hover:underline"
                      >
                        Entrar com 1 clique
                      </button>
                    </div>

                    <div className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-slate-800" />
                      <span className="text-[10px] uppercase font-mono text-slate-400">ou com e-mail</span>
                      <div className="flex-1 h-px bg-slate-800" />
                    </div>

                    {isSignUp && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                          Nome Completo
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Carlos Silva"
                            className="w-full bg-slate-950/65 border border-slate-800 focus:border-[#FF3B30]/60 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Endereço de E-mail
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          className="w-full bg-slate-950/65 border border-slate-800 focus:border-[#FF3B30]/60 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                          Palavra-passe
                        </label>
                        {!isSignUp && (
                          <button
                            type="button"
                            onClick={() => setIsForgotPassword(true)}
                            className="text-xs font-bold text-[#FF3B30] hover:text-[#FF4D4D] transition-colors hover:underline cursor-pointer"
                          >
                            Esqueceu-se?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Digite a palavra-passe..."
                          className="w-full bg-slate-950/65 border border-slate-800 focus:border-[#FF3B30]/60 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Main Submit action button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 px-8 mt-2 bg-[#FF3B30] hover:bg-[#FF4D4D] text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FF3B30]/15"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          A autenticar...
                        </span>
                      ) : (
                        <>
                          <span>{isSignUp ? "Registar Conta Gratuita" : "Entrar com Credenciais"}</span>
                          <ArrowRight className="w-4.5 h-4.5" />
                        </>
                      )}
                    </button>

                    {/* Toggle Sign Up / Sign In */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                        setMessage(null);
                      }}
                      className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors block pt-2 font-semibold hover:underline cursor-pointer"
                    >
                      {isSignUp 
                        ? "Já tem uma conta de acesso? Iniciar Sessão" 
                        : "Ainda sem conta? Criar uma conta gratuita agora"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
