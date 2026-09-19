import React, { useState, useEffect } from "react";
import { AuthState, UserProfile } from "./types";
import Login from "./components/Login";
import Onboarding from "./components/Onboarding";
import SubscriptionView from "./components/SubscriptionView";
import ProfileView from "./components/ProfileView";
import SidebarLayout from "./components/SidebarLayout";
import DashboardView from "./components/DashboardView";
import AdminPanel from "./components/AdminPanel";
import {
  CoachView,
  ConversationAnalyzerView,
  MessageGeneratorView,
  InterestDetectorView,
  ConversationSimulatorView,
  WinBackPlanView,
  RelationshipRecoveryPlanView,
  LoveLanguageTestView,
  RelationshipTestsView,
  RelationshipCalendarView,
  DateIdeasView,
  GiftSuggestionsView,
  DatingAssistantView,
  SinglesModeView
} from "./components/ModuleViews";

import { Crown, HelpCircle, Activity, Sparkles, LogOut, Check, Heart, MessageSquare, Compass, Zap, Database, Plus, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentModule, setCurrentModule] = useState<string>("dashboard");
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);

  // Sync state with simulated local session
  useEffect(() => {
    const savedUserStr = localStorage.getItem("amor_ia_user");
    const savedProfileStr = localStorage.getItem("amor_ia_profile");

    let parsedUser: any = null;
    let parsedProfile: any = null;

    if (savedUserStr) {
      try {
        parsedUser = JSON.parse(savedUserStr);
      } catch (e) {
        console.error("Erro ao analisar utilizador salvo:", e);
      }
    }

    if (savedProfileStr) {
      try {
        parsedProfile = JSON.parse(savedProfileStr);
      } catch (e) {
        console.error("Erro ao analisar perfil salvo:", e);
      }
    }

    if (parsedUser) {
      // Carregar instantaneamente a sessão local para carregar o ecrã rapidamente
      setAuthState({
        user: parsedUser,
        isAuthenticated: true,
        loading: false,
      });

      if (parsedProfile) {
        setUserProfile(parsedProfile);
      }

      // Sincronizar assinatura real do servidor de forma assíncrona
        fetch(`/api/user-subscription?email=${encodeURIComponent(parsedUser.email)}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}`);
            }
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              throw new TypeError("O servidor não retornou JSON!");
            }
            return res.json();
          })
          .then(data => {
            if (data.success && data.plan) {
              const updatedUser = { ...parsedUser, plan: data.plan };
              localStorage.setItem("amor_ia_user", JSON.stringify(updatedUser));
              setAuthState({
                user: updatedUser,
                isAuthenticated: true,
                loading: false,
              });

              if (parsedProfile) {
                const updatedProfile = { ...parsedProfile, subscriptionTier: data.plan };
                localStorage.setItem("amor_ia_profile", JSON.stringify(updatedProfile));
                setUserProfile(updatedProfile);
              }
            }
          })
          .catch(err => console.warn("Aviso ao sincronizar subscrição inicial com o servidor:", err));
    } else {
      if (parsedProfile) {
        setUserProfile(parsedProfile);
      }
    }
  }, []);

  const handleLoginSuccess = (emailOrUser: any, name?: string, plan?: "Free" | "Premium", extraFields?: any) => {
    let email = "";
    let userName = "";
    let userPlan: "Free" | "Premium" = "Free";
    let avatar = "";
    let provider = "";
    let country = "";
    let language = "";
    let currency = "";

    if (typeof emailOrUser === "object" && emailOrUser !== null) {
      email = emailOrUser.email || "";
      userName = emailOrUser.name || "";
      userPlan = emailOrUser.plan || "Free";
      avatar = emailOrUser.avatar || "";
      provider = emailOrUser.provider || "";
      country = emailOrUser.country || "";
      language = emailOrUser.language || "";
      currency = emailOrUser.currency || "";
    } else {
      email = emailOrUser || "";
      userName = name || "";
      userPlan = plan || "Free";
      if (extraFields) {
        avatar = extraFields.avatar || "";
        provider = extraFields.provider || "";
        country = extraFields.country || "";
        language = extraFields.language || "";
        currency = extraFields.currency || "";
      }
    }

    const cleanEmail = email.toLowerCase().trim();

    // Registar ou obter utilizador no servidor
    fetch("/api/register-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: cleanEmail, 
        name: userName,
        avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        provider: provider || "Google",
        country: country || "Angola",
        language: language || "Português",
        currency: currency || "AOA"
      })
    })
      .then(res => res.json())
      .then(data => {
        const liveUser = (data.success && data.user) ? data.user : { 
          email: cleanEmail, 
          name: userName, 
          plan: userPlan,
          avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          provider: provider || "Google",
          country: country || "Angola",
          language: language || "Português",
          currency: currency || "AOA",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        localStorage.setItem("amor_ia_user", JSON.stringify(liveUser));
        setAuthState({
          user: liveUser,
          isAuthenticated: true,
          loading: false,
        });

        const defaultProfile: UserProfile = {
          name: liveUser.name,
          age: 25,
          gender: "Masculino",
          relationshipStatus: "single",
          relationshipGoal: "Construir uma conexão profunda",
          challenges: "Melhorar a comunicação ativa",
          communicationStyle: "Proativo e Emocional",
          loveLanguage: "Tempo de Qualidade"
        };

        const savedProfileStr = localStorage.getItem("amor_ia_profile");
        let profile = defaultProfile;
        if (savedProfileStr) {
          try {
            profile = { ...defaultProfile, ...JSON.parse(savedProfileStr) };
          } catch (e) {
            console.error(e);
          }
        }

        const updatedProfile = { 
          ...profile, 
          name: liveUser.name,
          subscriptionTier: liveUser.plan,
          avatar: liveUser.avatar,
          provider: liveUser.provider,
          country: liveUser.country,
          language: liveUser.language,
          currency: liveUser.currency,
          createdAt: liveUser.createdAt,
          lastLogin: liveUser.lastLogin
        };

        localStorage.setItem("amor_ia_profile", JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
      })
      .catch(err => {
        console.error("Erro ao registar no servidor:", err);
        // Fallback local se o servidor falhar
        const fallbackUser = { 
          email: cleanEmail, 
          name: userName, 
          plan: userPlan,
          avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          provider: provider || "Google",
          country: country || "Angola",
          language: language || "Português",
          currency: currency || "AOA",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        localStorage.setItem("amor_ia_user", JSON.stringify(fallbackUser));
        setAuthState({
          user: fallbackUser,
          isAuthenticated: true,
          loading: false,
        });
      });
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    const currentPlan = authState.user?.plan || "Free";
    const updatedProfile = {
      ...profile,
      subscriptionTier: currentPlan
    };
    localStorage.setItem("amor_ia_profile", JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
  };

  const handleLogout = () => {
    localStorage.removeItem("amor_ia_user");
    localStorage.removeItem("amor_ia_profile");
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    setUserProfile(null);
    setCurrentModule("dashboard");
  };

  const handleDeleteAccount = () => {
    if (!authState.user?.email) return;
    
    fetch("/api/delete-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authState.user.email })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          handleLogout();
        }
      })
      .catch(e => {
        console.error("Erro ao eliminar conta:", e);
        // Fallback para apagar localmente de qualquer forma
        handleLogout();
      });
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem("amor_ia_profile", JSON.stringify(updatedProfile));
    
    // Sincronizar dados no servidor se o nome ou campos de localização forem alterados
    if (authState.user) {
      const updatedUser = { 
        ...authState.user, 
        name: updatedProfile.name,
        country: (updatedProfile as any).country || (authState.user as any).country || "Angola",
        language: (updatedProfile as any).language || (authState.user as any).language || "Português",
        currency: (updatedProfile as any).currency || (authState.user as any).currency || "AOA",
        avatar: (updatedProfile as any).avatar || (authState.user as any).avatar
      };
      setAuthState(prev => ({ ...prev, user: updatedUser }));
      localStorage.setItem("amor_ia_user", JSON.stringify(updatedUser));
      
      fetch("/api/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authState.user.email,
          name: updatedProfile.name,
          country: (updatedProfile as any).country,
          language: (updatedProfile as any).language,
          currency: (updatedProfile as any).currency,
          avatar: (updatedProfile as any).avatar
        })
      }).catch(e => console.error("Erro ao sincronizar perfil alterado:", e));
    }
  };

  const toggleSubscriptionTier = () => {
    if (!userProfile) return;
    const currentPlan = authState.user?.plan || "Free";
    const nextPlan = currentPlan === "Premium" ? "Free" : "Premium";
    
    // Atualizar no servidor se for alterado localmente
    fetch("/api/admin/update-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authState.user?.email, plan: nextPlan })
    }).catch(e => console.error(e));

    const updatedProfile: UserProfile = {
      ...userProfile,
      subscriptionTier: nextPlan,
    };
    setUserProfile(updatedProfile);
    localStorage.setItem("amor_ia_profile", JSON.stringify(updatedProfile));

    if (authState.user) {
      const updatedUser = { ...authState.user, plan: nextPlan as "Free" | "Premium" };
      setAuthState({ ...authState, user: updatedUser });
      localStorage.setItem("amor_ia_user", JSON.stringify(updatedUser));
    }
  };

  const handleUpdateUserPlan = (email: string, plan: "Free" | "Premium", durationDays: number = 30) => {
    fetch("/api/admin/update-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, plan, durationDays, adminEmail: "chillplaces9@gmail.com" })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const targetEmail = email.toLowerCase().trim();
          const currentEmail = (authState.user?.email || "").toLowerCase().trim();
          if (targetEmail === currentEmail) {
            const updatedUser = { ...authState.user, plan: plan };
            setAuthState(prev => ({ ...prev, user: updatedUser }));
            localStorage.setItem("amor_ia_user", JSON.stringify(updatedUser));
            if (userProfile) {
              const updatedProfile = { ...userProfile, subscriptionTier: plan };
              setUserProfile(updatedProfile);
              localStorage.setItem("amor_ia_profile", JSON.stringify(updatedProfile));
            }
          }
        }
      })
      .catch(e => console.error("Erro ao atualizar plano:", e));
  };

  const syncSubscription = async () => {
    if (!authState.user) return;
    try {
      const res = await fetch(`/api/user-subscription?email=${encodeURIComponent(authState.user.email)}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("O servidor não retornou JSON!");
      }
      const data = await res.json();
      if (data.success && data.plan) {
        const updatedUser = { ...authState.user, plan: data.plan };
        localStorage.setItem("amor_ia_user", JSON.stringify(updatedUser));
        setAuthState(prev => ({
          ...prev,
          user: updatedUser
        }));

        if (userProfile) {
          const updatedProfile = { ...userProfile, subscriptionTier: data.plan };
          localStorage.setItem("amor_ia_profile", JSON.stringify(updatedProfile));
          setUserProfile(updatedProfile);
        }
      }
    } catch (err) {
      console.warn("Aviso ao sincronizar subscrição com o servidor (silencioso):", err);
    }
  };

  // Sincronizar subscrição silenciosamente em segundo plano sempre que o módulo ativo muda
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      syncSubscription();
    }
  }, [currentModule, authState.isAuthenticated]);

  // Sincronizar subscrição periodicamente para refletir ativações/desativações automáticas do administrador
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user) return;
    
    // Sincronizar a cada 8 segundos em segundo plano para reação imediata
    const interval = setInterval(() => {
      syncSubscription();
    }, 8000);
    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.user?.email]);

  // Main UI Router
  if (!authState.isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isUserPremium = authState.user?.plan === "Premium";
  const isAdmin = authState.user?.email === "chillplaces9@gmail.com" || authState.user?.email === "chiilplaces9@gmail.com";

  // SE NÃO FOR PREMIUM E NÃO FOR ADMIN, BLOQUEIA COMPLETAMENTE O ACESSO E PEDE O PAGAMENTO COM A ESTRELA DESTAQUE
  if (!isUserPremium && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Glowing Backgrounds */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF3B30]/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#06B6D4]/5 rounded-full blur-[160px] pointer-events-none" />

        <div className="w-full max-w-4xl bg-slate-950/70 backdrop-blur-3xl border border-slate-900 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative z-10 space-y-8">
          
          {/* Header with Star / Sparkles Icon */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/30 shadow-[0_0_20px_rgba(255,59,48,0.2)] text-amber-400 animate-bounce mb-2">
              <Sparkles className="w-8 h-8 fill-amber-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-display flex items-center justify-center gap-2">
              Amor <span className="text-[#FF3B30]">IA</span> Premium VIP
            </h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Olá, <strong className="text-white">{authState.user?.name}</strong>! O acesso completo à plataforma Amor IA está atualmente inativo. Ative a sua subscrição VIP Premium para desbloquear todas as funcionalidades exclusivas e conselhos de psicologia amorosa inteligente.
            </p>
          </div>

          {/* Form / SubscriptionView */}
          <div className="border-t border-slate-900 pt-6">
            <SubscriptionView
              currentPlan="Free"
              userEmail={authState.user?.email || ""}
              onUpgrade={() => {}}
              onSync={syncSubscription}
            />
          </div>

          {/* Footer controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-900/60 pt-6 text-[11px] text-slate-500">
            <span className="flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Sincronização em tempo real ativa. Aguardando ativação automática do administrador...
            </span>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all font-semibold cursor-pointer text-xs uppercase tracking-wider"
            >
              Terminar Sessão
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <Onboarding
        userName={authState.user?.name || ""}
        onOnboardingComplete={handleOnboardingComplete}
      />
    );
  }

  // Active sub-module rendering
  const renderActiveModule = () => {
    // Definir quais módulos são livres (Painel Geral e as definições do próprio perfil/assinatura)
    const isPremiumRoute = ![
      "dashboard",
      "profile",
      "pricing",
      "subscription"
    ].includes(currentModule);

    // Permitir o desenvolvedor ver o Painel Admin
    if (currentModule === "admin" && (authState.user?.email === "chillplaces9@gmail.com" || authState.user?.email === "chiilplaces9@gmail.com")) {
      return <AdminPanel />;
    }

    const isUserPremium = authState.user?.plan === "Premium";

    if (isPremiumRoute && !isUserPremium) {
      return (
        <div className="space-y-6">
          <div className="bg-[#9E1B1B]/15 border border-[#9E1B1B]/30 rounded-3xl p-6 text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-white font-display">Recurso Premium Bloqueado</h2>
            <p className="text-xs text-slate-400">
              O módulo avançado <strong className="text-[#FF3B30] uppercase">"{currentModule}"</strong> requer uma subscrição ativa de membro VIP Premium.
            </p>
          </div>
          <SubscriptionView
            currentPlan="Free"
            userEmail={authState.user?.email || ""}
            onUpgrade={() => {}}
            onSync={syncSubscription}
          />
        </div>
      );
    }

    switch (currentModule) {
      case "dashboard":
        return <DashboardView userProfile={userProfile} onNavigateToModule={setCurrentModule} />;
      case "coach":
        return <CoachView userProfile={userProfile} />;
      case "analyzer":
        return <ConversationAnalyzerView />;
      case "msg-generator":
        return <MessageGeneratorView />;
      case "simulator":
        return <ConversationSimulatorView />;
      case "winback":
        return <WinBackPlanView />;
      case "recovery":
        return <RelationshipRecoveryPlanView />;
      case "love-language-test":
        return <LoveLanguageTestView />;
      case "tests":
        return <RelationshipTestsView />;
      case "calendar":
        return <RelationshipCalendarView />;
      case "date-ideas":
        return <DateIdeasView />;
      case "gift-suggestions":
        return <GiftSuggestionsView />;
      case "dating-assistant":
        return <DatingAssistantView />;
      case "singles-mode":
        return <SinglesModeView />;
      case "admin":
        if (authState.user?.email?.toLowerCase().trim() === "chillplaces9@gmail.com" || authState.user?.email?.toLowerCase().trim() === "chiilplaces9@gmail.com") {
          return <AdminPanel />;
        }
        return <DashboardView userProfile={userProfile} onNavigateToModule={setCurrentModule} />;
      case "profile":
        return (
          <ProfileView 
            userProfile={userProfile} 
            authState={authState} 
            onNavigateToModule={setCurrentModule} 
            onUpdateUserPlan={handleUpdateUserPlan}
            onUpdateProfile={handleUpdateProfile}
            onDeleteAccount={handleDeleteAccount}
            onLogout={handleLogout}
          />
        );

      case "pricing":
      case "subscription":
        return (
          <SubscriptionView
            currentPlan={isUserPremium ? "Premium" : "Free"}
            userEmail={authState.user?.email || ""}
            onUpgrade={(plan) => toggleSubscriptionTier()}
            onSync={syncSubscription}
          />
        );
      default:
        return <DashboardView userProfile={userProfile} onNavigateToModule={setCurrentModule} />;
    }
  };

  return (
    <SidebarLayout
      currentView={currentModule}
      onViewChange={setCurrentModule}
      onLogout={handleLogout}
      userProfile={userProfile}
      authState={authState}
    >
      <div className="space-y-6 relative">
        {/* VIP Upgrade Micro-Banner */}
        {authState.user?.plan !== "Premium" && (
          <div className="bg-gradient-to-r from-[#9E1B1B] to-[#E11D48] border border-[#FF3B30]/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg text-white font-sans animate-pulse-subtle">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-white animate-pulse" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Acesso Premium VIP do Amor IA — 5.000 Kzs/mês</h4>
                <p className="text-[11px] text-white/95 font-medium font-sans">Desbloqueie análises de diálogos infinitas, simulações avançadas de chat e planos de reconquista personalizados.</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentModule("pricing")}
              className="py-2 px-4 bg-white text-[#9E1B1B] font-extrabold text-[10px] uppercase rounded-xl hover:bg-slate-100 hover:text-[#B91C1C] transition-all self-stretch sm:self-auto text-center cursor-pointer"
            >
              Fazer Upgrade VIP
            </button>
          </div>
        )}

        {/* Dynamic Screen Stage with Fast & Premium Animations */}
        <AnimatePresence mode="wait">
          <motion.main
            key={currentModule}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            id="stage"
            className="transition-all"
          >
            {renderActiveModule()}
          </motion.main>
        </AnimatePresence>

        {/* Floating Action Buttons (FAB) - Gorgeous & Dynamic Quick Shortcuts */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
          <AnimatePresence>
            {isFloatingMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col items-end gap-2.5 mb-2 pointer-events-auto"
              >
                {/* 1. Toggle VIP Developer Quick Switch Button */}
                {(authState.user?.email === "chillplaces9@gmail.com" || authState.user?.email === "chiilplaces9@gmail.com") && (
                  <button
                    onClick={() => {
                      toggleSubscriptionTier();
                      setIsFloatingMenuOpen(false);
                    }}
                    className="flex items-center gap-2 group cursor-pointer"
                    title="Ativar/Desativar VIP Instantâneo"
                  >
                    <span className="bg-[#121216]/95 text-amber-400 font-mono text-[10px] font-bold py-1.5 px-3 rounded-lg border border-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap">
                      🛠️ DEV: {authState.user?.plan === "Premium" ? "Remover VIP" : "Ativar VIP Grátis"}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-950/40 hover:scale-110 active:scale-95 transition-transform">
                      <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
                    </div>
                  </button>
                )}

                {/* 2. Coach IA Quick Link */}
                <button
                  onClick={() => {
                    setCurrentModule("coach");
                    setIsFloatingMenuOpen(false);
                  }}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <span className="bg-[#121216]/95 text-white font-sans text-[10px] font-bold py-1.5 px-3 rounded-lg border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap">
                    Falar com Coach IA
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9E1B1B] to-[#FF3B30] text-white flex items-center justify-center shadow-lg shadow-red-950/30 hover:scale-110 active:scale-95 transition-transform">
                    <Heart className="w-4 h-4 text-white fill-white/20" />
                  </div>
                </button>

                {/* 3. Messages Generator Quick Link */}
                <button
                  onClick={() => {
                    setCurrentModule("msg-generator");
                    setIsFloatingMenuOpen(false);
                  }}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <span className="bg-[#121216]/95 text-white font-sans text-[10px] font-bold py-1.5 px-3 rounded-lg border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap">
                    Gerador de Mensagens
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </button>

                {/* 5. Home Dashboard Link */}
                <button
                  onClick={() => {
                    setCurrentModule("dashboard");
                    setIsFloatingMenuOpen(false);
                  }}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <span className="bg-[#121216]/95 text-white font-sans text-[10px] font-bold py-1.5 px-3 rounded-lg border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap">
                    Painel Geral
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform">
                    <Compass className="w-4 h-4" />
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Toggle Button - Glowing Crimson Pulse */}
          <button
            onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
            className="pointer-events-auto w-12 h-12 rounded-full bg-gradient-to-r from-[#9E1B1B] to-[#FF3B30] text-white flex items-center justify-center shadow-lg shadow-red-900/40 hover:scale-110 active:scale-95 transition-all cursor-pointer relative group border border-white/10"
            title="Menu Rápido Amor IA"
          >
            <div className="absolute inset-0 rounded-full bg-[#FF3B30] opacity-20 blur-sm group-hover:opacity-40 animate-ping pointer-events-none" />
            <motion.div
              animate={{ rotate: isFloatingMenuOpen ? 135 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isFloatingMenuOpen ? <X className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
            </motion.div>
          </button>
        </div>

      </div>
    </SidebarLayout>
  );
}
