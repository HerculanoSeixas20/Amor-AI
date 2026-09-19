import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Heart,
  FileText,
  Send,
  Radar,
  Sparkles,
  RotateCcw,
  Activity,
  BookOpen,
  CheckSquare,
  Calendar,
  Gift,
  Smile,
  Target,
  User,
  Crown,
  Shield,
  LogOut,
  Menu,
  X,
  Flame,
  MessageSquareHeart,
  Database,
  Sun,
  Moon
} from "lucide-react";
import { UserProfile, AuthState } from "../types";

interface SidebarLayoutProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userProfile: UserProfile | null;
  authState: AuthState;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function SidebarLayout({
  currentView,
  onViewChange,
  userProfile,
  authState,
  onLogout,
  children,
}: SidebarLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const isDeveloper = authState.user?.email?.toLowerCase().trim() === "chillplaces9@gmail.com" || authState.user?.email?.toLowerCase().trim() === "chiilplaces9@gmail.com";

  const menuItems = [
    { id: "dashboard", label: "Painel Geral", icon: LayoutDashboard, category: "Visão Geral" },
    { id: "coach", label: "AI Coach Amoroso", icon: MessageSquareHeart, category: "Módulos Principais" },
    { id: "analyzer", label: "Analisador WhatsApp", icon: FileText, category: "Módulos Principais" },
    { id: "msg-generator", label: "Gerador de Mensagens", icon: Send, category: "Módulos Principais" },
    { id: "simulator", label: "Simulador de Chat", icon: Sparkles, category: "Módulos Inteligentes" },
    { id: "winback", label: "Plano de Reconquista", icon: RotateCcw, category: "Guias & Recuperação" },
    { id: "recovery", label: "Plano de Salvação", icon: Activity, category: "Guias & Recuperação" },
    { id: "love-language-test", label: "Teste das Linguagens", icon: Heart, category: "Testes & Autoconhecimento" },
    { id: "tests", label: "Testes de Relação", icon: CheckSquare, category: "Testes & Autoconhecimento" },
    { id: "calendar", label: "Calendário Relacional", icon: Calendar, category: "Utilidades Diárias" },
    { id: "date-ideas", label: "Ideias de Encontros", icon: Flame, category: "Ideias & Gestos" },
    { id: "gift-suggestions", label: "Sugestões de Presentes", icon: Gift, category: "Ideias & Gestos" },
    { id: "dating-assistant", label: "Assistente de Date", icon: Smile, category: "Outros Modos" },
    { id: "singles-mode", label: "Modo Solteiros", icon: Sparkles, category: "Outros Modos" },
  ];

  // Group by category
  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  return (
    <div className="min-h-screen bg-[#050507] flex relative overflow-hidden font-sans">
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#9E1B1B]/4 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E11D48]/3 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0C0C10]/95 backdrop-blur-md border-b border-slate-900 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange("dashboard")}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9E1B1B] to-[#E11D48] flex items-center justify-center text-white animate-futuristic-float shadow-[0_0_15px_rgba(255,59,48,0.5)]">
            <Heart className="w-4.5 h-4.5 fill-white/10" />
          </div>
          <span className="font-bold font-display text-lg text-white">
            Amor <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#E11D48]">IA</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={theme === "dark" ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-300 hover:text-white transition-colors focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-[280px] bg-[#050507] border-r border-slate-900/80 z-50 flex flex-col justify-between transition-all duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#FF3B30]/15 flex items-center justify-between relative overflow-hidden bg-gradient-to-r from-[#0C0C10] to-[#050507]">
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF3B30]/40 to-transparent" />
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { onViewChange("dashboard"); setIsOpen(false); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9E1B1B] to-[#FF3B30] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,59,48,0.5)] animate-futuristic-float">
              <Heart className="w-5.5 h-5.5 fill-white/20 text-white" />
            </div>
            <div>
              <span className="font-extrabold font-display text-xl tracking-tight text-white block">
                Amor <span className="text-[#FF3B30] neon-text-red">IA</span>
              </span>
              <span className="text-[9px] text-[#FF3B30] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="glow-dot-red animate-ping shrink-0" />
                CYBER PORTAL VIP
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={theme === "dark" ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
            <button className="lg:hidden p-1 text-slate-500 hover:text-white" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin">
          {categories.map((cat) => (
            <div key={cat} className="space-y-1">
              <span className="text-[10px] font-bold text-[#06B6D4] uppercase tracking-wider pl-3 block mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] shadow-[0_0_6px_#06B6D4]" />
                {cat}
              </span>
              {menuItems
                .filter((item) => item.category === cat)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  const isUserFree = authState.user?.plan !== "Premium";
                  const isLocked = isUserFree && !["dashboard", "profile", "subscription", "pricing"].includes(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 relative overflow-hidden group ${
                        isActive
                          ? "bg-[#FF3B30]/15 text-white border-l-2 border-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.15)]"
                          : "text-slate-400 hover:bg-[#FF3B30]/5 hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF3B30]/5 to-transparent pointer-events-none" />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-[#FF3B30] drop-shadow-[0_0_8px_#FF3B30]" : "text-slate-500 group-hover:text-slate-300"}`} />
                      <span className={isActive ? "neon-text-red" : ""}>{item.label}</span>
                      {isLocked ? (
                        <Sparkles className="w-3.5 h-3.5 ml-auto text-amber-400 shrink-0 fill-amber-400/20 animate-pulse drop-shadow-[0_0_6px_#FBBF24]" />
                      ) : (
                        item.id === "coach" && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
                        )
                      )}
                    </button>
                  );
                })}
            </div>
          ))}

          {/* SaaS Core Utilities */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-3 block mb-1">
              Painéis Adicionais
            </span>
            <button
              onClick={() => { onViewChange("profile"); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${
                currentView === "profile" ? "bg-[#9E1B1B]/15 text-white border-l-2 border-[#9E1B1B]" : "text-slate-400 hover:bg-[#121216]/50 hover:text-white"
              }`}
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>Meu Perfil</span>
            </button>
            <button
              onClick={() => { onViewChange("subscription"); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                currentView === "subscription" ? "bg-[#FF3B30]/15 text-white border-l-2 border-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.15)]" : "text-slate-400 hover:bg-[#FF3B30]/5 hover:text-white"
              }`}
            >
              <Crown className="w-4 h-4 text-[#FF3B30] drop-shadow-[0_0_6px_#FF3B30]" />
              <span className={currentView === "subscription" ? "neon-text-red" : ""}>Assinatura Premium</span>
              {authState.user?.plan === "Premium" ? (
                <span className="ml-auto text-[8px] bg-[#FF3B30]/20 text-[#FF3B30] font-bold px-1.5 py-0.5 rounded border border-[#FF3B30]/30 animate-pulse-subtle shadow-[0_0_8px_rgba(255,59,48,0.3)]">VIP</span>
              ) : (
                <span className="ml-auto text-[8px] bg-[#FF3B30]/10 text-slate-400 font-bold px-1.5 py-0.5 rounded border border-slate-800">UP</span>
              )}
            </button>
             {isDeveloper && (
              <button
                onClick={() => { onViewChange("admin"); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  currentView === "admin" ? "bg-[#FF3B30]/15 text-white border-l-2 border-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.15)]" : "text-slate-400 hover:bg-[#FF3B30]/5 hover:text-white"
                }`}
              >
                <Shield className="w-4 h-4 text-[#06B6D4] drop-shadow-[0_0_6px_#06B6D4]" />
                <span className={currentView === "admin" ? "neon-text-cyan" : ""}>Painel Admin</span>
                <span className="ml-auto text-[8px] bg-cyan-500/20 text-[#06B6D4] font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">DEV</span>
              </button>
            )}

          </div>
        </div>

        {/* User Card at the bottom */}
        <div className="p-4 border-t border-[#FF3B30]/15 bg-[#121216]/60 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#06B6D4]/30 to-transparent" />
          
          {/* Quick Theme Toggle in footer */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-medium text-slate-400">Modo de Exibição</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tema Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Tema Escuro</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9E1B1B] to-[#FF3B30] flex items-center justify-center text-white text-xs font-bold font-display uppercase shadow-[0_0_10px_rgba(255,59,48,0.4)]">
              {authState.user?.name ? authState.user.name.substring(0, 2) : "US"}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-white block truncate">{authState.user?.name || "Utilizador VIP"}</span>
              <span className="text-[10px] text-slate-500 block truncate">{authState.user?.email}</span>
            </div>
            <div className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/30 shadow-[0_0_8px_rgba(255,59,48,0.15)]">
              {authState.user?.plan || "Free"}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-900 hover:bg-[#FF3B30]/10 hover:border-[#FF3B30]/30 text-slate-400 hover:text-[#FF3B30] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-[inset_0_0_10px_rgba(255,59,48,0.02)] active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Desconectar Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Content View wrapper */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pt-20 lg:pt-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
