import React, { useState, useEffect } from "react";
import { UserProfile, AuthState } from "../types";
import { 
  User, Mail, Crown, Shield, Sparkles, Heart, Clock, CheckCircle, XCircle, Search, Edit2
} from "lucide-react";
import AdminPanel from "./AdminPanel";
import { apiFetch as fetch } from "../utils/api";

interface ProfileViewProps {
  userProfile: any;
  authState: AuthState;
  onNavigateToModule: (module: string) => void;
  onUpdateUserPlan?: (email: string, plan: "Free" | "Premium", durationDays?: number) => void;
  onUpdateProfile?: (profile: any) => void;
  onDeleteAccount?: () => void;
  onLogout?: () => void;
}

export default function ProfileView({ 
  userProfile, 
  authState, 
  onNavigateToModule, 
  onUpdateUserPlan,
  onUpdateProfile,
  onDeleteAccount,
  onLogout
}: ProfileViewProps) {
  const isDeveloper = authState.user?.email === "chillplaces9@gmail.com" || authState.user?.email === "chiilplaces9@gmail.com";
  const [devViewMode, setDevViewMode] = useState<"profile" | "admin" >("admin");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>({ ...userProfile });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Developer custom States
  const [users, setUsers] = useState<any[]>([]);
  const [quickSearchText, setQuickSearchText] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Erro ao carregar utilizadores para pesquisa:", err);
    }
  };

  useEffect(() => {
    if (isDeveloper) {
      fetchUsers();
    }
  }, [isDeveloper]);

  // Translate relationship status to PT-AO
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "dating": return "Num Relacionamento (Namoro)";
      case "married": return "Casado(a)";
      case "single": return "Solteiro(a)";
      case "divorced": return "Divorciado(a)";
      case "looking_for_love": return "À Procura de Amor";
      default: return "Não Definido";
    }
  };

  const handleSave = () => {
    if (onUpdateProfile) {
      onUpdateProfile(editedProfile);
    } else {
      localStorage.setItem("amor_ia_profile", JSON.stringify(editedProfile));
    }
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdatePlanForUser = async (email: string, plan: "Free" | "Premium", durationDays: number = 30) => {
    setActionMessage(null);
    setActionError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setActionError("Por favor introduza um e-mail válido.");
      return;
    }

    try {
      const res = await fetch("/api/admin/update-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: cleanEmail, 
          plan, 
          durationDays, 
          adminEmail: "chillplaces9@gmail.com" 
        })
      });
      const data = await res.json();
      if (data.success) {
        let planDesc = "GRATUITO (Free)";
        if (plan === "Premium") {
          if (durationDays === 30) planDesc = "PREMIUM VIP MENSAL (30 dias)";
          else if (durationDays === 90) planDesc = "PREMIUM VIP TRIMESTRAL (90 dias)";
          else if (durationDays === 365) planDesc = "PREMIUM VIP ANUAL (365 dias)";
          else planDesc = `PREMIUM VIP (${durationDays} dias)`;
        }
        setActionMessage(`Estatuto de "${cleanEmail}" alterado com sucesso para ${planDesc}!`);
        
        // Notify parent state for instant reactive UI switch (especially if it is the developer's account)
        if (onUpdateUserPlan) {
          onUpdateUserPlan(cleanEmail, plan, durationDays);
        }
        
        // Reload users list to keep dashboard in-sync
        fetchUsers();
        setTimeout(() => setActionMessage(null), 6000);
      } else {
        setActionError(data.error || "Não foi possível atualizar o plano do utilizador.");
      }
    } catch (err) {
      console.error(err);
      setActionError("Erro na ligação ao servidor.");
    }
  };

  // If the user is the developer, render the Admin Panel directly as their "Meu Perfil" tab, with developer-specific headers!
  if (isDeveloper && devViewMode === "admin") {
    return (
      <div id="developer-profile-container" className="space-y-8 animate-fade-in">
        {/* Developer Exclusive Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#9E1B1B]/40 bg-gradient-to-br from-[#121216] via-[#1A0B0B] to-[#0A0A0F] p-6 md:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#9E1B1B]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-red-600/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#9E1B1B] to-[#FF3B30] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-[#9E1B1B]/30 border-2 border-[#FF3B30]/30">
                  DEV
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#E11D48] text-white flex items-center justify-center border-2 border-[#0A0A0F]">
                  <Shield className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-tight">
                    {authState.user?.name || "Administrador Geral"}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-gradient-to-r from-red-600 to-red-800 text-white uppercase tracking-widest border border-red-500/20">
                    DIRETOR DESENVOLVEDOR
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5 justify-center md:justify-start">
                  <Mail className="w-3.5 h-3.5 text-red-500" />
                  <span>chillplaces9@gmail.com</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-lg">
                  Conta mestre de engenharia com acesso de super-administrador aos servidores local, produção e sincronização de base de dados Supabase/PostgreSQL.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="bg-[#121216]/90 border border-slate-900 rounded-2xl p-3 text-center min-w-[100px] shadow-lg">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Estatuto VIP</span>
                <span className="text-xs font-black text-[#FF3B30] font-mono">SUPREMO</span>
              </div>
              <div className="bg-[#121216]/90 border border-slate-900 rounded-2xl p-3 text-center min-w-[100px] shadow-lg">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Privilégio</span>
                <span className="text-xs font-black text-amber-400 font-mono">FULL ACCESS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Mode Selector Selector */}
        <div className="flex gap-2 p-1.5 bg-[#121216]/90 border border-slate-900/80 rounded-2xl w-fit shadow-md">
          <button
            onClick={() => setDevViewMode("admin")}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all cursor-pointer bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-950/40"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Painel de Controle Desenvolvedor</span>
          </button>
          <button
            onClick={() => setDevViewMode("profile")}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-400 hover:text-white"
          >
            <User className="w-3.5 h-3.5" />
            <span>Meu Perfil Pessoal</span>
          </button>
        </div>

        {/* --- Action Status Feedbacks --- */}
        {actionMessage && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center gap-2.5 shadow-xl animate-fade-in">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        )}
        {actionError && (
          <div className="p-4 bg-red-950/60 border border-red-500/30 text-red-300 rounded-2xl text-xs flex items-center gap-2.5 shadow-xl animate-fade-in">
            <XCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{actionError}</span>
          </div>
        )}

        {/* --- DEDICATED DEV CONTROLS CARD --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Section 1: Self Account Simulation */}
          <div className="glass p-6 rounded-3xl border border-[#9E1B1B]/30 bg-gradient-to-br from-[#121216] via-[#1A0B0B] to-[#0A0A0F] space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9E1B1B]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">Simulação Rápida (Minha Conta)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pode ativar ou desativar o plano Premium VIP instantaneamente na sua conta para testar e simular as diferenças visuais e funcionais entre o perfil gratuito e VIP.
              </p>
            </div>

            <div className="space-y-4 pt-3">
              <div className="bg-[#050507] border border-slate-900 rounded-2xl p-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">O seu Estatuto Atual:</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  authState.user?.plan === "Premium" 
                    ? "bg-[#9E1B1B]/20 text-[#FF3B30] border border-[#9E1B1B]/40 animate-pulse" 
                    : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}>
                  {authState.user?.plan === "Premium" ? "👑 PREMIUM VIP" : "FREE (GRATUITO)"}
                </span>
              </div>

              <div className="flex gap-2">
                {authState.user?.plan === "Premium" ? (
                  <button
                    onClick={() => handleUpdatePlanForUser("chillplaces9@gmail.com", "Free")}
                    className="w-full px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Desativar Meu Premium (Tornar Free)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdatePlanForUser("chillplaces9@gmail.com", "Premium", 30)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#9E1B1B] to-[#FF3B30] hover:opacity-90 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-[#9E1B1B]/30"
                  >
                    <Crown className="w-4 h-4 text-yellow-300" />
                    <span>Ativar Meu Premium VIP</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Manage other users with search */}
          <div className="glass p-6 rounded-3xl border border-slate-900 bg-[#0A0A0F] space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-900 pb-2">
              <User className="w-4.5 h-4.5 text-red-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Gerir Plano de Outros Utilizadores</h3>
            </div>

            <div className="space-y-3">
              {/* Field: Search Name or Email */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">E-mail ou Nome do Utilizador</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Introduza o e-mail ou o nome do utilizador..."
                    value={quickSearchText}
                    onChange={(e) => setQuickSearchText(e.target.value)}
                    className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 pl-9 text-xs text-white focus:outline-none focus:border-[#9E1B1B] font-semibold"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Cycle / Duration dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">Duração do Plano (Diferentes Ciclos)</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(Number(e.target.value))}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#9E1B1B] font-semibold"
                >
                  <option value={30}>Plano Mensal (30 dias)</option>
                  <option value={90}>Plano Trimestral (90 dias)</option>
                  <option value={365}>Plano Anual (365 dias)</option>
                </select>
              </div>

              {/* Action for the typed email or text */}
              {quickSearchText.trim() && (
                <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-500">AÇÃO DIRETA PARA: "{quickSearchText}"</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePlanForUser(quickSearchText, "Premium", selectedDuration)}
                      className="flex-1 py-1.5 px-3 bg-[#9E1B1B] hover:opacity-95 text-white text-[10px] font-bold rounded-lg transition-all"
                    >
                      Ativar Premium ({selectedDuration} dias)
                    </button>
                    <button
                      onClick={() => handleUpdatePlanForUser(quickSearchText, "Free")}
                      className="py-1.5 px-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-semibold rounded-lg transition-all"
                    >
                      Desativar (Free)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* List of matched database users */}
            {quickSearchText.trim() && (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto divide-y divide-slate-900/60 border border-slate-900 rounded-xl p-1 bg-[#050507]/40">
                <span className="text-[9px] font-mono text-slate-500 px-2 pt-1 block uppercase">Utilizadores Encontrados:</span>
                {users.filter(u => {
                  const q = quickSearchText.toLowerCase();
                  return (u.email || "").toLowerCase().includes(q) || (u.name || "").toLowerCase().includes(q);
                }).length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic px-2 py-1.5">Nenhum utilizador corresponde. Pode digitar o e-mail completo acima para ativar.</p>
                ) : (
                  users.filter(u => {
                    const q = quickSearchText.toLowerCase();
                    return (u.email || "").toLowerCase().includes(q) || (u.name || "").toLowerCase().includes(q);
                  }).map(u => (
                    <div key={u.email} className="p-2 flex items-center justify-between text-xs hover:bg-slate-900/50 rounded-lg">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-white truncate text-[11px]">{u.name || u.email.split("@")[0]}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{u.email}</p>
                        <span className={`text-[8px] font-bold px-1.5 rounded ${
                          u.plan === "Premium" ? "bg-red-500/10 text-red-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {u.plan} {u.expirationDate && `(expira ${new Date(u.expirationDate).toLocaleDateString("pt-AO")})`}
                        </span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleUpdatePlanForUser(u.email, "Premium", selectedDuration)}
                          className="py-1 px-2 bg-gradient-to-r from-red-950 to-red-900 text-white text-[9px] font-bold rounded"
                        >
                          Ativar
                        </button>
                        <button
                          onClick={() => handleUpdatePlanForUser(u.email, "Free")}
                          className="py-1 px-2 bg-slate-900 text-slate-400 text-[9px] font-bold rounded"
                        >
                          Free
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* The Entire Admin Control Suite */}
        <div className="border border-slate-900/60 rounded-3xl bg-[#050507]/90 p-1">
          <AdminPanel />
        </div>
      </div>
    );
  }

  // Regular user profile view
  return (
    <div id="user-profile-container" className="space-y-8 animate-fade-in">
      {/* Selector de Modo do Desenvolvedor (Apenas Visível para o Dev no Perfil Pessoal) */}
      {isDeveloper && (
        <div className="flex gap-2 p-1.5 bg-[#121216]/90 border border-slate-900/80 rounded-2xl w-fit shadow-md mb-4">
          <button
            onClick={() => setDevViewMode("admin")}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-400 hover:text-white"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>Painel de Controle Desenvolvedor</span>
          </button>
          <button
            onClick={() => setDevViewMode("profile")}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all cursor-pointer bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-950/40"
          >
            <User className="w-3.5 h-3.5" />
            <span>Meu Perfil Pessoal</span>
          </button>
        </div>
      )}

      {/* Save Toast */}
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 shadow-2xl animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Perfil atualizado com sucesso localmente!</span>
        </div>
      )}

      {/* Header Profile Summary */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-900/80 bg-gradient-to-b from-[#121216] to-[#0A0A0F] p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#9E1B1B]/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            {editedProfile.avatar || authState.user?.avatar ? (
              <img 
                src={editedProfile.avatar || authState.user?.avatar} 
                alt="Avatar de Perfil" 
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border border-[#E11D48]/40 shadow-lg shadow-red-950/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9E1B1B] to-[#E11D48] flex items-center justify-center text-white text-2xl font-black uppercase shadow-lg shadow-red-950/20">
                {authState.user?.name ? authState.user.name.substring(0, 2) : "US"}
              </div>
            )}
            <div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold font-display text-white tracking-tight">
                  {editedProfile.name || authState.user?.name || "Utilizador Amor IA"}
                </h1>
                {authState.user?.plan === "Premium" && (
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/35 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                    <Crown className="w-2.5 h-2.5" /> MEMBRO VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1.5 justify-center md:justify-start">
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span>{authState.user?.email}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isEditing 
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/40" 
                : "bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            {isEditing ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Dados do Perfil</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: subscription status */}
        <div className="glass p-6 rounded-2xl border border-slate-900 space-y-5 h-fit">
          <div className="flex items-center gap-2">
            <Crown className="w-4.5 h-4.5 text-[#E11D48]" />
            <h3 className="text-sm font-bold text-white">Estatuto da Assinatura</h3>
          </div>

          {authState.user?.plan === "Premium" ? (
            <div className="space-y-4 pt-1">
              <div className="p-4 bg-gradient-to-tr from-red-950/30 to-red-900/10 border border-red-500/20 rounded-xl space-y-2 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF3B30]/5 rounded-full blur-xl" />
                <span className="text-[10px] font-black tracking-widest text-[#FF3B30] uppercase block">PREMIUM VIP ATIVO</span>
                <p className="text-xs text-slate-300">Tem acesso ilimitado a todos os diagnósticos de chat, geradores de áudio/texto e planos avançados de salvação.</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 bg-[#050507] p-3 rounded-xl border border-slate-900">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="block font-bold text-white text-[11px]">Subscrição Renovada</span>
                  <span className="text-[10px] text-slate-500">Ativação vitalícia ou recorrente verificada localmente.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl space-y-2 text-center">
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block">CONTA GRATUITA (FREE)</span>
                <p className="text-xs text-slate-400">Upgrade para desbloquear recursos de IA e diagnósticos avançados de relacionamentos.</p>
              </div>
              <button
                onClick={() => onNavigateToModule("pricing")}
                className="w-full py-2.5 bg-gradient-to-r from-[#9E1B1B] to-[#FF3B30] hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-md shadow-red-950/40 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Desbloquear Premium VIP</span>
              </button>
            </div>
          )}

          {/* DEDICATED ACCOUNT MANAGEMENT UTILITIES */}
          <div className="border-t border-slate-900 pt-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gestão de Conta</h4>
            
            <button
              onClick={onLogout}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <span>Terminar Sessão Secura</span>
            </button>

            <button
              onClick={() => {
                if (confirm("Tem certeza absoluta de que deseja eliminar definitivamente a sua conta? Esta ação é irreversível e apagará todos os seus dados e diagnósticos dos nossos servidores.")) {
                  if (onDeleteAccount) onDeleteAccount();
                }
              }}
              className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/40 text-red-400 hover:text-red-350 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <span>Eliminar Minha Conta</span>
            </button>
          </div>
        </div>

        {/* Right columns: profile answers */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-slate-900 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
            <User className="w-4.5 h-4.5 text-[#FF3B30]" />
            <h3 className="text-sm font-bold text-white">Configurações & Diagnóstico Relacional</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold block">Idade</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProfile.age || 25}
                  onChange={(e) => setEditedProfile({ ...editedProfile, age: parseInt(e.target.value) || 25 })}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#9E1B1B]"
                />
              ) : (
                <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-white font-medium">
                  {editedProfile.age || "Não Definido"} anos
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold block">Género</label>
              {isEditing ? (
                <select
                  value={editedProfile.gender || "Masculino"}
                  onChange={(e) => setEditedProfile({ ...editedProfile, gender: e.target.value })}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#9E1B1B]"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              ) : (
                <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-white font-medium">
                  {editedProfile.gender || "Não Definido"}
                </div>
              )}
            </div>

            {/* Relationship Status */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold block">Estado de Relacionamento</label>
              {isEditing ? (
                <select
                  value={editedProfile.relationshipStatus || "single"}
                  onChange={(e) => setEditedProfile({ ...editedProfile, relationshipStatus: e.target.value as any })}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#9E1B1B]"
                >
                  <option value="single">Solteiro(a)</option>
                  <option value="dating">Num Relacionamento (Namoro)</option>
                  <option value="married">Casado(a)</option>
                  <option value="divorced">Divorciado(a)</option>
                  <option value="looking_for_love">À Procura de Amor</option>
                </select>
              ) : (
                <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-white font-medium">
                  {getStatusLabel(editedProfile.relationshipStatus)}
                </div>
              )}
            </div>

            {/* Love Language */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold block">Linguagem do Amor Principal</label>
              {isEditing ? (
                <select
                  value={editedProfile.loveLanguage || "Palavras de Afirmação"}
                  onChange={(e) => setEditedProfile({ ...editedProfile, loveLanguage: e.target.value })}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#9E1B1B]"
                >
                  <option value="Palavras de Afirmação">Palavras de Afirmação</option>
                  <option value="Tempo de Qualidade">Tempo de Qualidade</option>
                  <option value="Atos de Serviço">Atos de Serviço</option>
                  <option value="Presentes">Presentes</option>
                  <option value="Toque Físico">Toque Físico</option>
                </select>
              ) : (
                <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-white font-medium flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#FF3B30] fill-[#FF3B30]/20 shrink-0" />
                  <span>{editedProfile.loveLanguage || "Não Definido"}</span>
                </div>
              )}
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold block">País</label>
              {isEditing ? (
                <input
                  type="text"
                  value={(editedProfile as any).country || "Angola"}
                  onChange={(e) => setEditedProfile({ ...editedProfile, country: e.target.value } as any)}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#9E1B1B]"
                />
              ) : (
                <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-white font-medium">
                  {(editedProfile as any).country || "Angola"}
                </div>
              )}
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold block">Idioma de Preferência</label>
              {isEditing ? (
                <input
                  type="text"
                  value={(editedProfile as any).language || "Português"}
                  onChange={(e) => setEditedProfile({ ...editedProfile, language: e.target.value } as any)}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#9E1B1B]"
                />
              ) : (
                <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-white font-medium">
                  {(editedProfile as any).language || "Português"}
                </div>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold block">Moeda do Sistema</label>
              {isEditing ? (
                <input
                  type="text"
                  value={(editedProfile as any).currency || "AOA"}
                  onChange={(e) => setEditedProfile({ ...editedProfile, currency: e.target.value } as any)}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#9E1B1B]"
                />
              ) : (
                <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-white font-medium">
                  {(editedProfile as any).currency || "AOA"}
                </div>
              )}
            </div>

            {/* Provider */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold block">Provedor de Autenticação</label>
              <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-slate-400 font-mono">
                {(editedProfile as any).provider || "Google"}
              </div>
            </div>

            {/* Created At */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold block">Conta Criada Em</label>
              <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-slate-400 font-mono">
                {(editedProfile as any).createdAt ? new Date((editedProfile as any).createdAt).toLocaleString("pt-AO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleDateString("pt-AO")}
              </div>
            </div>

            {/* Last Login */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold block">Última Sessão Registada</label>
              <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-slate-400 font-mono">
                {(editedProfile as any).lastLogin ? new Date((editedProfile as any).lastLogin).toLocaleString("pt-AO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleDateString("pt-AO")}
              </div>
            </div>

            {/* Avatar URL */}
            {isEditing && (
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-slate-500 font-semibold block">URL da Foto de Perfil (Avatar)</label>
                <input
                  type="text"
                  value={(editedProfile as any).avatar || ""}
                  placeholder="https://exemplo.com/foto.jpg"
                  onChange={(e) => setEditedProfile({ ...editedProfile, avatar: e.target.value } as any)}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#9E1B1B]"
                />
              </div>
            )}

            {/* Goal */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-500 font-semibold block">Objetivo Relacional Principal</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.relationshipGoal || ""}
                  onChange={(e) => setEditedProfile({ ...editedProfile, relationshipGoal: e.target.value })}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#9E1B1B]"
                />
              ) : (
                <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-white font-medium">
                  {editedProfile.relationshipGoal || "Não Definido"}
                </div>
              )}
            </div>

            {/* Communication Style */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-500 font-semibold block">Estilo de Comunicação</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.communicationStyle || ""}
                  onChange={(e) => setEditedProfile({ ...editedProfile, communicationStyle: e.target.value })}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#9E1B1B]"
                />
              ) : (
                <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-white font-medium">
                  {editedProfile.communicationStyle || "Não Definido"}
                </div>
              )}
            </div>

            {/* Challenges */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-500 font-semibold block">Maiores Desafios de Conexão</label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={editedProfile.challenges || ""}
                  onChange={(e) => setEditedProfile({ ...editedProfile, challenges: e.target.value })}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#9E1B1B] resize-none"
                />
              ) : (
                <div className="bg-[#050507] border border-slate-900 p-3 rounded-xl text-white font-medium leading-relaxed">
                  {editedProfile.challenges || "Não Definido"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
