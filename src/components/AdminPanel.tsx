import React, { useState, useEffect } from "react";
import { 
  Shield, Users, CreditCard, Coins, Key, Bell, ListTodo, 
  Activity, Gift, Terminal, Search, UserPlus, CheckCircle, XCircle, Sparkles, Loader2, RefreshCw, FileText,
  Crown, Clock
} from "lucide-react";
import { apiFetch as fetch } from "../utils/api";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"users" | "payments" | "stats" | "coupons" | "logs">("payments");
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Payments management
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"all" | "pending_confirmation" | "approved" | "rejected" | "pending_upload">("all");

  // Manual creation state
  const [manualEmail, setManualEmail] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualPlan, setManualPlan] = useState<"Free" | "Premium">("Premium");

  // Coupons
  const [coupons, setCoupons] = useState([
    { code: "ANGOLALOVE", discount: "20%", limit: "50 usos", status: "Ativo" },
    { code: "VIPAMOR", discount: "35%", limit: "Sem limite", status: "Ativo" },
    { code: "RECONQUISTA50", discount: "50%", limit: "10 usos", status: "Expirado" }
  ]);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "", limit: "" });

  // Logs
  const [logs, setLogs] = useState([
    { id: "1", type: "AI_COACH", user: "Mateus M.", msg: "Gerada resposta para casamento de longa data.", time: "Há 2 mins" },
    { id: "2", type: "ANALYZER", user: "Carlos S.", msg: "Análise concluída com sucesso. Score: 84.", time: "Há 12 mins" },
    { id: "3", type: "PAYMENT", user: "António F.", msg: "Renovação anual subscrita via Multicaixa.", time: "Há 1 hora" },
    { id: "4", type: "ONBOARDING", user: "Joana P.", msg: "Novo registo de utilizador completo.", time: "Há 2 horas" }
  ]);

  const [notification, setNotification] = useState({ title: "", text: "" });
  const [notifSent, setNotifSent] = useState(false);

  // Developer security check
  const savedUserStr = localStorage.getItem("amor_ia_user");
  const currentUser = savedUserStr ? JSON.parse(savedUserStr) : null;
  const isDeveloper = currentUser?.email === "chillplaces9@gmail.com" || currentUser?.email === "chiilplaces9@gmail.com";

  // Real-time Dashboard statistics state
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    totalRevenueKz: 0,
    formattedTotalRevenue: "0 Kzs",
    pendingPaymentsCount: 0,
    approvedPaymentsCount: 0,
    rejectedPaymentsCount: 0,
    conversionRate: 0,
    updatedAt: new Date().toISOString()
  });
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Erro ao obter utilizadores:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const res = await fetch(`/api/admin/payments?email=${encodeURIComponent("chillplaces9@gmail.com")}`);
      const data = await res.json();
      if (data.success && data.payments) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error("Erro ao carregar pagamentos:", err);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin/dashboard-stats?adminEmail=${encodeURIComponent("chillplaces9@gmail.com")}`);
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Erro ao carregar estatísticas do dashboard:", err);
    }
  };

  const handleManualRefreshAll = async () => {
    setIsRefreshingStats(true);
    await Promise.all([fetchUsers(), fetchPayments(), fetchStats()]);
    setIsRefreshingStats(false);
  };

  useEffect(() => {
    if (isDeveloper) {
      fetchUsers();
      fetchPayments();
      fetchStats();

      // Polling automático a cada 3.5 segundos para atualizar o dashboard sempre que algo acontece
      const interval = setInterval(() => {
        fetchUsers();
        fetchPayments();
        fetchStats();
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [isDeveloper]);

  const handleApprovePayment = async (paymentId: string) => {
    try {
      const res = await fetch("/api/admin/approve-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, adminEmail: "chillplaces9@gmail.com" })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage("Pagamento aprovado com sucesso! O utilizador tem agora Premium PERMANENTE ativado até desativação manual.");
        fetchPayments();
        fetchUsers();
        fetchStats();
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        alert("Erro ao aprovar pagamento: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Erro na ligação ao servidor.");
    }
  };

  const handleRejectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId) return;
    try {
      const res = await fetch("/api/admin/reject-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          paymentId: rejectId, 
          adminEmail: "chillplaces9@gmail.com",
          reason: rejectReason 
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage("O pagamento não pôde ser validado. Comprovativo rejeitado.");
        setRejectId(null);
        setRejectReason("");
        fetchPayments();
        fetchStats();
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        alert("Erro ao rejeitar pagamento: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Erro na ligação ao servidor.");
    }
  };

  const [manualDuration, setManualDuration] = useState<30 | 90 | 365>(30);

  // Ativação Premium Permanente (Indefinida até o desenvolvedor desativar)
  const handleTogglePermanentPremium = async (email: string, targetPlan: "Free" | "Premium") => {
    try {
      const res = await fetch("/api/admin/update-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          plan: targetPlan, 
          adminEmail: "chillplaces9@gmail.com" 
        })
      });
      const data = await res.json();
      if (data.success) {
        if (targetPlan === "Premium") {
          setActionMessage(`Plano Premium PERMANENTE ativado para ${email}. Permanecerá ativo indefinidamente até desativação manual.`);
        } else {
          setActionMessage(`Plano de ${email} revertido para Gratuito (Free).`);
        }
        fetchUsers();
        fetchStats();
        setTimeout(() => setActionMessage(null), 4500);
      } else {
        alert("Erro ao atualizar subscrição: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erro na ligação ao servidor.");
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail) return;
    try {
      await fetch("/api/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: manualEmail, name: manualName })
      });

      const res = await fetch("/api/admin/update-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: manualEmail, 
          plan: manualPlan, 
          adminEmail: "chillplaces9@gmail.com"
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(
          manualPlan === "Premium" 
            ? `Utilizador ${manualEmail} ativado como PREMIUM PERMANENTE!` 
            : `Utilizador ${manualEmail} guardado com plano Gratuito.`
        );
        setManualEmail("");
        setManualName("");
        fetchUsers();
        fetchStats();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;
    setCoupons([
      ...coupons,
      { code: newCoupon.code.toUpperCase(), discount: newCoupon.discount, limit: newCoupon.limit || "Ilimitado", status: "Ativo" }
    ]);
    setNewCoupon({ code: "", discount: "", limit: "" });
  };

  const sendGlobalNotification = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSent(true);
    setTimeout(() => {
      setNotifSent(false);
      setNotification({ title: "", text: "" });
    }, 3000);
  };

  // Block rendering for any unauthorized accounts
  if (!isDeveloper) {
    return (
      <div id="admin-restricted" className="max-w-2xl mx-auto p-8 text-center bg-[#050507]/90 border border-slate-900 rounded-3xl space-y-6 my-12">
        <div className="w-16 h-16 bg-[#9E1B1B]/15 border border-[#9E1B1B]/30 rounded-full flex items-center justify-center mx-auto text-[#FF3B30]">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white font-display">Acesso Restrito ao Desenvolvedor</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Este painel administrativo contém dados confidenciais de faturamento e chaves de acesso a subscrições.
            Apenas a conta de desenvolvedor principal (<span className="text-[#FF3B30] font-semibold">chillplaces9@gmail.com</span>) tem privilégios para visualizar este ecrã.
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (u.email || "").toLowerCase().includes(q) || (u.name || "").toLowerCase().includes(q);
  });

  return (
    <div id="admin-panel" className="space-y-6 font-sans">
      
      {/* Title block with tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#FF3B30]" /> Painel de Controle (Desenvolvedor)
          </h1>
          <p className="text-xs text-slate-400">Ativação permanente de Premium, gestão de utilizadores e dashboard financeiro em Kwanza (AOA).</p>
        </div>
        <div className="flex flex-wrap gap-2 p-1 bg-[#121216] border border-slate-900 rounded-xl">
          {[
            { id: "users", label: "Subscritores & Premium", icon: Users },
            { id: "payments", label: "Pagamentos (Kwanza)", icon: CreditCard },
            { id: "stats", label: "Dashboard & Métricas", icon: Activity },
            { id: "coupons", label: "Cupons", icon: Gift },
            { id: "logs", label: "Logs do Sistema", icon: Terminal }
          ].map((tab) => {
            const Icon = tab.icon;
            const isPayments = tab.id === "payments";
            const pendingCount = isPayments ? (stats.pendingPaymentsCount || payments.filter(p => p.status === "pending_confirmation").length) : 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
                  activeTab === tab.id ? "bg-[#9E1B1B] text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {isPayments && pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] bg-[#FF3B30] text-white font-extrabold rounded-full animate-bounce shrink-0 border border-slate-950">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* REAL-TIME DASHBOARD KPI BAR (AUTONOMOUS AUTO-UPDATING METRICS) */}
      <div className="bg-gradient-to-r from-[#0F0D15] via-[#15101E] to-[#0F0D15] border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Dashboard em Tempo Real</span>
            <span className="text-[10px] text-slate-500 font-mono hidden md:inline">• Atualização automática a cada 3.5s</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[10px] text-slate-400 font-mono">
              Última sincronização: {new Date(stats.updatedAt || Date.now()).toLocaleTimeString()}
            </span>
            <button
              onClick={handleManualRefreshAll}
              disabled={isRefreshingStats}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
              title="Atualizar dados agora"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingStats ? "animate-spin text-[#FF3B30]" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>

        {/* 4 CORE KPI METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Card 1: Quantos utilizadores possui */}
          <div className="bg-slate-950/70 border border-slate-800/70 rounded-xl p-4 space-y-1 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Utilizadores Totais</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
              {stats.totalUsers || users.length}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-0.5">
              <span className="text-emerald-400 font-bold">{stats.premiumUsers} VIP</span>
              <span>•</span>
              <span className="text-slate-400">{stats.freeUsers} Free</span>
            </div>
          </div>

          {/* Card 2: Quanto faturei */}
          <div className="bg-slate-950/70 border border-slate-800/70 rounded-xl p-4 space-y-1 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Faturado</span>
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl md:text-2xl font-extrabold font-display text-emerald-400 tracking-tight">
              {stats.formattedTotalRevenue || "0 Kzs"}
            </div>
            <div className="text-[10px] text-slate-400 pt-0.5">
              {stats.approvedPaymentsCount} pagamentos confirmados
            </div>
          </div>

          {/* Card 3: Premium Permanente Ativo */}
          <div className="bg-slate-950/70 border border-slate-800/70 rounded-xl p-4 space-y-1 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Premium Permanente</span>
              <Crown className="w-4 h-4 text-[#FF3B30]" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
              {stats.premiumUsers}
            </div>
            <div className="text-[10px] text-emerald-400 pt-0.5 font-medium">
              ✓ Ativos até desativação manual
            </div>
          </div>

          {/* Card 4: Pagamentos Pendentes */}
          <div className="bg-slate-950/70 border border-slate-800/70 rounded-xl p-4 space-y-1 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Pendentes de Validação</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className={`text-2xl md:text-3xl font-extrabold font-display tracking-tight ${stats.pendingPaymentsCount > 0 ? "text-amber-400" : "text-slate-400"}`}>
              {stats.pendingPaymentsCount}
            </div>
            <div className="text-[10px] text-slate-400 pt-0.5 flex items-center justify-between">
              <span>{stats.pendingPaymentsCount > 0 ? "Aguardando aprovação" : "Nenhum pendente"}</span>
              {stats.pendingPaymentsCount > 0 && (
                <button
                  onClick={() => setActiveTab("payments")}
                  className="text-amber-400 hover:underline font-bold text-[9px] cursor-pointer"
                >
                  Ver →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action status toast/message */}
      {actionMessage && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* TAB 1: USERS & SUBSCRIPTION TOGGLE */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: manual promoter form */}
            <div className="glass p-5 rounded-2xl border border-slate-900 h-fit space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4.5 h-4.5 text-[#FF3B30]" />
                <h3 className="text-sm font-bold text-white">Ativar Premium Manualmente</h3>
              </div>
              <p className="text-xs text-slate-400">
                Ative o Premium de um utilizador de imediato informando o seu e-mail. Funciona mesmo antes de eles criarem conta.
              </p>

              <form onSubmit={handleManualAdd} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">E-mail do Utilizador</label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@email.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-slate-900 rounded-xl p-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-[#9E1B1B]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nome (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Mateus Manuel"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-slate-900 rounded-xl p-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-[#9E1B1B]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plano a Atribuir</label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={manualPlan === "Premium"}
                        onChange={() => setManualPlan("Premium")}
                        className="accent-[#9E1B1B]"
                      />
                      <span className="text-white">Premium VIP</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={manualPlan === "Free"}
                        onChange={() => setManualPlan("Free")}
                        className="accent-[#9E1B1B]"
                      />
                      <span className="text-slate-400">Gratuito (Free)</span>
                    </label>
                  </div>
                </div>

                {manualPlan === "Premium" && (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 text-[11px] text-emerald-300 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-emerald-400" />
                      Ativação Permanente
                    </span>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      O utilizador terá acesso VIP imediato e permanente. O plano não expira até você decidir desativá-lo.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#9E1B1B] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-md shadow-[#9E1B1B]/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{manualPlan === "Premium" ? "Ativar Premium Permanente" : "Definir como Gratuito"}</span>
                </button>
              </form>
            </div>

            {/* Right side: dynamic users list with toggle buttons */}
            <div className="lg:col-span-2 glass rounded-2xl border border-slate-900 overflow-hidden">
              <div className="p-4 border-b border-slate-900 bg-slate-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Utilizadores Registados no Banco de Dados</h3>
                  <button 
                    onClick={fetchUsers} 
                    className="p-1 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-white transition-all"
                    title="Recarregar"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome ou e-mail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-slate-900 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#9E1B1B]"
                  />
                </div>
              </div>

              {isLoadingUsers ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#9E1B1B] animate-spin" />
                  <span className="text-xs">A carregar utilizadores...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Nenhum utilizador encontrado no sistema. Use o formulário ao lado para registar o primeiro!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#050507]/60 text-slate-400 border-b border-slate-900 font-semibold">
                        <th className="p-4">Utilizador</th>
                        <th className="p-4">E-mail</th>
                        <th className="p-4">Plano & Estatuto</th>
                        <th className="p-4 text-right">Ação do Desenvolvedor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      {filteredUsers.map((user, idx) => {
                        const isPremium = user.plan === "Premium";
                        return (
                          <tr key={idx} className="hover:bg-slate-900/10">
                            <td className="p-4">
                              <span className="font-bold text-white block">{user.name || "Sem Nome"}</span>
                              <span className="text-[9px] text-slate-500 font-mono">Registo: {new Date(user.updatedAt || user.createdAt || Date.now()).toLocaleDateString()}</span>
                              {user.password && (
                                <span className="text-[10px] text-amber-400 font-mono block mt-1">🔑 Senha: {user.password}</span>
                              )}
                            </td>
                            <td className="p-4 font-mono text-slate-400">{user.email}</td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1.5 ${
                                  isPremium 
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                                    : "bg-slate-900 text-slate-400 border border-slate-800"
                                }`}>
                                  {isPremium ? (
                                    <>
                                      <Crown className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>PREMIUM PERMANENTE (Ativo)</span>
                                    </>
                                  ) : (
                                    <span>Gratuito (Free)</span>
                                  )}
                                </span>
                                {isPremium && (
                                  <span className="text-[9px] text-emerald-400/80 font-mono block">
                                    ✓ Sempre ativo até desativação manual
                                  </span>
                                )}
                                {user.sessions && user.sessions.length > 0 ? (
                                  <div className="mt-2 pt-1 border-t border-slate-900 space-y-1 max-h-[64px] overflow-y-auto">
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wide block">Logins Recentes:</span>
                                    {user.sessions.slice(-2).reverse().map((s: string, sIdx: number) => (
                                      <span key={sIdx} className="text-[8px] text-emerald-400 font-mono block">
                                        🕒 {new Date(s).toLocaleString("pt-AO")}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2 flex-wrap">
                                {!isPremium ? (
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePermanentPremium(user.email, "Premium")}
                                    className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
                                    title="Ativar Premium Permanente (Fica sempre ativo até você desativar)"
                                  >
                                    <CheckCircle className="w-4 h-4 text-white" />
                                    <span>Ativar Premium Permanente</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePermanentPremium(user.email, "Free")}
                                    className="py-2 px-3.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/50 text-rose-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
                                    title="Desativar Premium Permanente (Mudar utilizador para Free)"
                                  >
                                    <XCircle className="w-4 h-4 text-rose-400" />
                                    <span>Desativar (Mudar para Free)</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1.5: GESTÃO DE PAGAMENTOS EM ANGOLA */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white font-display">Controle de Subscrições e Pagamentos em Angola</h3>
              <p className="text-xs text-slate-400">Aprove transações do Multicaixa Express e Transferências Bancárias para ativar automaticamente o Premium VIP.</p>
            </div>
            <button
              onClick={fetchPayments}
              className="p-2 border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Atualizar Transações</span>
            </button>
          </div>

          {(() => {
            const pendingPayments = payments.filter(p => p.status === "pending_confirmation");
            if (pendingPayments.length > 0) {
              return (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Atenção Programador: {pendingPayments.length} comprovativo(s) pendente(s) de validação!</span>
                      <span className="text-slate-400">Os utilizadores já enviaram o recibo. Por favor, verifique os ficheiros e clique em "Aprovar" para ativar o plano VIP.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setPaymentStatusFilter("pending_confirmation")}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-lg shrink-0 transition-colors"
                  >
                    Filtrar Pendentes
                  </button>
                </div>
              );
            }
            return null;
          })()}

          {(() => {
            const filteredPayments = payments.filter((p) => {
              const matchesSearch =
                (p.paymentId || "").toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
                (p.transactionId || "").toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
                (p.email || "").toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
                (p.name || "").toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
                (p.phone || "").toLowerCase().includes(paymentSearchQuery.toLowerCase());

              const matchesStatus =
                paymentStatusFilter === "all" || p.status === paymentStatusFilter;

              return matchesSearch && matchesStatus;
            });

            return (
              <>
                {/* Filtros e Pesquisa */}
                <div className="flex flex-col sm:flex-row gap-4 bg-[#121216]/40 p-4 border border-slate-900 rounded-2xl items-center justify-between mb-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Pesquisar por ID, transação, nome, e-mail ou MCX..."
                      value={paymentSearchQuery}
                      onChange={(e) => setPaymentSearchQuery(e.target.value)}
                      className="w-full bg-[#0A0A0F] border border-slate-900 rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#9E1B1B]"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Estatuto:</span>
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
                      className="bg-[#0A0A0F] border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#9E1B1B] cursor-pointer w-full sm:w-auto"
                    >
                      <option value="all">Todos os Estados ({payments.length})</option>
                      <option value="pending_confirmation">Pendente de Validação ({payments.filter(p => p.status === "pending_confirmation").length})</option>
                      <option value="approved">Confirmado & Ativo ({payments.filter(p => p.status === "approved").length})</option>
                      <option value="rejected">Recusado ({payments.filter(p => p.status === "rejected").length})</option>
                      <option value="pending_upload">Aguardando Comprovativo ({payments.filter(p => p.status === "pending_upload").length})</option>
                    </select>
                  </div>
                </div>

                {isLoadingPayments ? (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#9E1B1B] animate-spin" />
                    <span className="text-xs">A carregar registos de pagamento...</span>
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs font-mono border border-slate-900 rounded-2xl">
                    Nenhum pedido de pagamento corresponde aos critérios de pesquisa.
                  </div>
                ) : (
                  <div className="glass rounded-2xl border border-slate-900 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#050507]/60 text-slate-400 border-b border-slate-900 font-semibold uppercase tracking-wider text-[10px]">
                            <th className="p-4">Identificador</th>
                            <th className="p-4">Utilizador</th>
                            <th className="p-4">Plano & Valor</th>
                            <th className="p-4">Método</th>
                            <th className="p-4">Data & Hora</th>
                            <th className="p-4">Ficheiro Comprovativo</th>
                            <th className="p-4">Estatuto</th>
                            <th className="p-4 text-right">Ações de Validação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-slate-300">
                          {filteredPayments.map((p) => {
                            const statusColors = {
                              pending_upload: "bg-red-500/10 text-red-400 border border-red-500/20",
                              pending_confirmation: "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse",
                              approved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                              rejected: "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            };

                            const statusLabels = {
                              pending_upload: "Aguardando Comprovativo",
                              pending_confirmation: "Pendente de Validação",
                              approved: "Confirmado & Ativo",
                              rejected: "Recusado"
                            };

                            return (
                              <tr key={p.paymentId} className="hover:bg-slate-900/10">
                                <td className="p-4 font-mono font-bold text-white">
                                  <span className="block">{p.paymentId}</span>
                                  <span className="text-[9px] text-slate-500 font-normal">{p.transactionId}</span>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-extrabold text-white text-xs">{p.name || p.clientName || "Sem Nome"}</span>
                                      <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono">Registo</span>
                                    </div>
                                    <span className="text-xs text-amber-400 font-mono font-semibold block select-all" title="Duplo clique para copiar">{p.email}</span>
                                    {p.phone && (
                                      <span className="text-[10px] text-blue-400 font-mono font-bold block mt-0.5">MCX / Telemóvel: {p.phone}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="font-semibold text-white block">{p.plan}</span>
                                  <span className="text-emerald-400 font-mono font-bold">{p.value}</span>
                                </td>
                                <td className="p-4 text-slate-400">{p.method}</td>
                                <td className="p-4 text-slate-400 font-mono text-[11px]">
                                  <span>{p.date}</span>
                                  <span className="block text-[9px] text-slate-500">{p.time}</span>
                                </td>
                                <td className="p-4">
                                  {p.receiptUrl ? (
                                    <a
                                      href={p.receiptUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline font-semibold"
                                    >
                                      <FileText className="w-4 h-4" />
                                      <span>Ver Comprovativo</span>
                                    </a>
                                  ) : (
                                    <span className="text-slate-600 font-mono italic">Não enviado</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <span className={`inline-block px-2.5 py-1 text-[10px] font-semibold rounded-full ${statusColors[p.status] || "bg-slate-800 text-slate-400"}`}>
                                    {statusLabels[p.status] || p.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  {p.status === "pending_confirmation" ? (
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => handleApprovePayment(p.paymentId)}
                                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>Aprovar</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => { setRejectId(p.paymentId); setRejectReason(""); }}
                                        className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>Rejeitar</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 font-mono text-[10px]">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* REJECTION MODAL POPUP */}
          {rejectId && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="glass max-w-md w-full rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <h4 className="text-sm font-bold text-white font-display">Rejeitar Comprovativo de Pagamento</h4>
                  <button onClick={() => { setRejectId(null); setRejectReason(""); }} className="text-slate-500 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Insira a razão para rejeitar o comprovativo do pagamento <strong>{rejectId}</strong>. O utilizador verá este motivo na sua tela.
                </p>
                <form onSubmit={handleRejectPayment} className="space-y-4">
                  <textarea
                    required
                    placeholder="Ex: O comprovativo enviado está ilegível, incompleto ou o valor transferido não corresponde ao plano selecionado."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    className="w-full bg-[#0A0A0F] border border-slate-900 rounded-xl p-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#9E1B1B]"
                  />
                  <div className="flex gap-3 text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => { setRejectId(null); setRejectReason(""); }}
                      className="flex-1 py-2.5 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 font-semibold cursor-pointer transition-colors"
                    >
                      Voltar atrás
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-white font-bold cursor-pointer transition-colors"
                    >
                      Rejeitar Pagamento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GENERAL STATS IN KWANZA */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass p-5 space-y-2 rounded-2xl">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-semibold">Total Faturado (Real)</span>
                <Coins className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold font-display text-emerald-400">{stats.formattedTotalRevenue || "0 Kzs"}</p>
              <p className="text-[10px] text-emerald-400 font-medium">▲ Calculado dos pagamentos aprovados</p>
            </div>

            <div className="glass p-5 space-y-2 rounded-2xl">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-semibold">Utilizadores Registados</span>
                <Users className="w-4 h-4 text-[#FF3B30]" />
              </div>
              <p className="text-2xl font-extrabold font-display text-white">{stats.totalUsers || users.length} Contas</p>
              <p className="text-[10px] text-slate-400 font-medium">{stats.premiumUsers} VIP • {stats.freeUsers} Gratuitos</p>
            </div>

            <div className="glass p-5 space-y-2 rounded-2xl">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-semibold">Premium Permanente Ativo</span>
                <Crown className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold font-display text-white">{stats.premiumUsers} Membros</p>
              <p className="text-[10px] text-emerald-400 font-medium">Sempre ativos até desativação manual</p>
            </div>

            <div className="glass p-5 space-y-2 rounded-2xl">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-semibold">Taxa de Conversão</span>
                <ListTodo className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold font-display text-white">{stats.conversionRate}%</p>
              <p className="text-[10px] text-slate-400 font-medium">{stats.approvedPaymentsCount} pagamentos validados com sucesso</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass p-6 lg:col-span-2 space-y-4 rounded-2xl">
              <h3 className="text-sm font-bold text-white font-display">Faturamento Estimado de Assinaturas (Kzs - Kwanza)</h3>
              <div className="h-44 flex items-end justify-between gap-2 pt-4">
                {[
                  { month: "Jan", val: "1.2M" },
                  { month: "Fev", val: "1.8M" },
                  { month: "Mar", val: "2.1M" },
                  { month: "Abr", val: "2.8M" },
                  { month: "Mai", val: "3.5M" },
                  { month: "Jun", val: "4.2M" }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      style={{ height: `${(idx + 1) * 15}%` }}
                      className="w-full bg-gradient-to-t from-[#9E1B1B] to-[#FF3B30] rounded-t-lg transition-all"
                    />
                    <span className="text-[10px] text-slate-400">{item.month}</span>
                    <span className="text-[9px] font-mono text-slate-500">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-6 space-y-4 rounded-2xl border border-slate-900">
              <div className="flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-[#FF3B30]" />
                <h3 className="text-sm font-bold text-white">Notificar Utilizadores</h3>
              </div>
              <p className="text-xs text-slate-400">Dispare uma dica ou mensagem de motivação para todos em tempo real.</p>

              {notifSent && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
                  Notificação global enviada para os telemóveis com sucesso!
                </div>
              )}

              <form onSubmit={sendGlobalNotification} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={notification.title}
                    onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                    placeholder="Ex: Novo Teste Disponível!"
                    className="w-full bg-[#0A0A0F] border border-slate-900 rounded-lg p-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#9E1B1B]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold mb-1">Mensagem</label>
                  <textarea
                    required
                    rows={2}
                    value={notification.text}
                    onChange={(e) => setNotification({ ...notification, text: e.target.value })}
                    placeholder="Ex: Descubra o seu perfil com o novo teste..."
                    className="w-full bg-[#0A0A0F] border border-slate-900 rounded-lg p-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#9E1B1B]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#9E1B1B] hover:opacity-95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Disparar Notificação Push
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COUPONS */}
      {activeTab === "coupons" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass p-6 h-fit space-y-4 rounded-2xl border border-slate-900">
            <h3 className="text-sm font-bold text-white">Criar Cupom de Desconto</h3>
            <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Código do Cupom</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: AMORVIPS"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full bg-[#0A0A0F] border border-slate-900 rounded-lg p-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-[#9E1B1B]"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Desconto (%)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 25%"
                  value={newCoupon.discount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                  className="w-full bg-[#0A0A0F] border border-slate-900 rounded-lg p-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-[#9E1B1B]"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Limite de Usos</label>
                <input
                  type="text"
                  placeholder="Ex: 100 utilizações"
                  value={newCoupon.limit}
                  onChange={(e) => setNewCoupon({ ...newCoupon, limit: e.target.value })}
                  className="w-full bg-[#0A0A0F] border border-slate-900 rounded-lg p-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-[#9E1B1B]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#9E1B1B] hover:opacity-95 text-white font-bold rounded-lg transition-all cursor-pointer"
              >
                Gerar Código Promocional
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass overflow-hidden rounded-2xl border border-slate-900">
            <div className="p-5 border-b border-slate-900">
              <h3 className="text-sm font-bold text-white">Cupons Ativos</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#050507]/60 text-slate-400 border-b border-slate-900 font-semibold">
                  <th className="p-4">Código</th>
                  <th className="p-4">Desconto</th>
                  <th className="p-4">Limite</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {coupons.map((coupon, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10">
                    <td className="p-4 font-mono font-bold text-white tracking-wider">{coupon.code}</td>
                    <td className="p-4 text-emerald-400 font-semibold">{coupon.discount}</td>
                    <td className="p-4">{coupon.limit}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        coupon.status === "Ativo" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {coupon.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM LOGS */}
      {activeTab === "logs" && (
        <div className="glass p-5 space-y-4 rounded-2xl border border-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Consola de Diagnóstico e Logs</h3>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> SISTEMA OPERATIVO SECURE
            </span>
          </div>

          <div className="bg-black/95 rounded-xl p-4 font-mono text-xs text-slate-400 h-64 overflow-y-auto space-y-2">
            <p className="text-[#9D7CFF]">[INFO] 2026-07-08T07:12:00: Inicialização do Motor do Amor IA v2.5 com Gemini-3.5-flash...</p>
            <p className="text-emerald-400">[READY] Port Ingress 3000 online e a filtrar requisições para a rede Angolana/Geral.</p>
            {logs.map((log) => (
              <p key={log.id}>
                <span className="text-slate-500">[{log.time}]</span> <span className="text-amber-500">[{log.type}]</span>{" "}
                <span className="text-white font-bold">{log.user}:</span> {log.msg}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
