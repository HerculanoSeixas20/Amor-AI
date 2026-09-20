import React, { useState, useEffect } from "react";
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Crown, 
  Copy, 
  AlertTriangle, 
  MessageSquare, 
  Mail, 
  Upload, 
  Clock, 
  Calendar, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ShieldAlert,
  UserCheck,
  UserX,
  HelpCircle
} from "lucide-react";
import { apiFetch as fetch } from "../utils/api";

interface SubscriptionViewProps {
  currentPlan: "Free" | "Premium";
  userEmail: string;
  onUpgrade?: (plan: "Free" | "Premium") => void;
  onSync?: () => void;
}

interface UserSubscriptionInfo {
  success: boolean;
  plan: "Free" | "Premium";
  name: string;
  email: string;
  activationDate: string | null;
  expirationDate: string | null;
  daysRemaining: number;
  payments: PaymentItem[];
}

interface PaymentItem {
  paymentId: string;
  transactionId: string;
  email: string;
  name: string;
  plan: string;
  value: string;
  method: string;
  phone?: string;
  clientName?: string;
  date: string;
  time: string;
  receiptUrl: string | null;
  status: "pending_upload" | "pending_confirmation" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  activationDate?: string;
  expirationDate?: string;
  auditLogs: string[];
}

export default function SubscriptionView({ currentPlan, userEmail, onUpgrade, onSync }: SubscriptionViewProps) {
  // Subscription Info from Server
  const [subInfo, setSubInfo] = useState<UserSubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Flow State
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activePayment, setActivePayment] = useState<PaymentItem | null>(null);

  // Modals & Clipboard Alerts
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // File Upload State
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Multicaixa Express Form State
  const [expressPhone, setExpressPhone] = useState("");
  const [expressName, setExpressName] = useState("");
  const [isSelectingExpress, setIsSelectingExpress] = useState(false);

  // New Combined Payment Form States
  const [selectedMethod, setSelectedMethod] = useState<"Express" | "IBAN" | null>(null);
  const [ibanEmail, setIbanEmail] = useState(userEmail || "");
  const [ibanName, setIbanName] = useState("");
  const [ibanPhone, setIbanPhone] = useState("");

  useEffect(() => {
    if (userEmail) {
      setIbanEmail(userEmail);
    }
  }, [userEmail]);

  const plans = [
    {
      id: "mensal",
      name: "Plano Mensal",
      duration: "30 dias",
      price: "5.000 Kz",
      value: "5.000 Kz",
      description: "Acesso Premium durante 30 dias.",
      popular: false,
      benefits: [
        "Acesso ilimitado ao AI Coach de Relações",
        "Análise inteligente de diálogos do WhatsApp",
        "Plano personalizado de Reconquista e Salvação",
        "Simuladores interativos com personas reais",
        "Avaliações e Testes de Relacionamento ilimitados"
      ]
    },
    {
      id: "trimestral",
      name: "Plano Trimestral",
      duration: "90 dias",
      price: "15.000 Kz",
      value: "15.000 Kz",
      description: "Acesso Premium durante 90 dias.",
      popular: true,
      benefits: [
        "Acesso ilimitado ao AI Coach de Relações",
        "Análise inteligente de diálogos do WhatsApp",
        "Plano personalizado de Reconquista e Salvação",
        "Simuladores interativos com personas reais",
        "Avaliações e Testes de Relacionamento ilimitados",
        "Suporte preferencial via e-mail e WhatsApp",
        "Economia de 10% em relação ao mensal"
      ]
    },
    {
      id: "anual",
      name: "Plano Anual",
      duration: "365 dias",
      price: "60.000 Kz",
      value: "60.000 Kz",
      description: "Acesso Premium durante 365 dias.",
      popular: false,
      benefits: [
        "Acesso ilimitado ao AI Coach de Relações",
        "Análise inteligente de diálogos do WhatsApp",
        "Plano personalizado de Reconquista e Salvação",
        "Simuladores interativos com personas reais",
        "Avaliações e Testes de Relacionamento ilimitados",
        "Suporte técnico prioritário 24/7",
        "Selo de Utilizador VIP com prioridade máxima",
        "Poupe a longo prazo"
      ]
    }
  ];

  // Fetch Sub Info
  const fetchSubInfo = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const res = await fetch(`/api/user-subscription?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) {
        setSubInfo(data);
        // Find if there is a payment in progress or pending upload
        const pending = data.payments?.find(
          (p: PaymentItem) => p.status === "pending_upload" || p.status === "pending_confirmation"
        );
        if (pending) {
          setActivePayment(pending);
        } else {
          setActivePayment(null);
        }
      }

      // Load user notifications
      try {
        const resNotif = await fetch(`/api/notifications?email=${encodeURIComponent(userEmail)}`);
        const dataNotif = await resNotif.json();
        if (dataNotif.success) {
          setNotifications(dataNotif.notifications || []);
        }
      } catch (e) {
        console.error("Erro ao carregar notificações:", e);
      }
    } catch (e) {
      console.error("Erro ao carregar subscrição:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationsAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error("Erro ao marcar notificações como lidas:", e);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchSubInfo();
    }
  }, [userEmail]);



  // Handle Plan Click
  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  // Step 1: Initiate Payment Session in DB (Optimistic, Instant & Error-Proof)
  const handleInitiatePayment = async (method: string, phone?: string, clientName?: string) => {
    if (!selectedPlan) return;
    
    // Instantly transition and populate details
    const clientGeneratedPaymentId = "PAY-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const clientGeneratedTxId = "TX-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const now = new Date();
    const isExpress = method.includes("Express");
    
    const optimisticPayment: PaymentItem = {
      paymentId: clientGeneratedPaymentId,
      transactionId: clientGeneratedTxId,
      email: userEmail || "chillplaces9@gmail.com",
      name: clientName || (userEmail ? userEmail.split("@")[0] : "Cliente"),
      plan: selectedPlan.name,
      value: selectedPlan.value,
      method: method,
      phone: phone || undefined,
      clientName: clientName || undefined,
      date: now.toLocaleDateString("pt-AO", { year: "numeric", month: "2-digit", day: "2-digit" }),
      time: now.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      receiptUrl: null,
      status: isExpress ? "pending_confirmation" : "pending_upload",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      auditLogs: [`[${now.toISOString()}] Pagamento iniciado localmente via ${method}.${phone ? ` Telemóvel: ${phone}. Nome: ${clientName}.` : ""}`]
    };

    // Set instantly - zero delay!
    setActivePayment(optimisticPayment);
    setReceiptBase64(null);
    setReceiptFileName("");

    // Silently sync with the server in the background
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail || "chillplaces9@gmail.com",
          plan: selectedPlan.name,
          value: selectedPlan.value,
          method,
          phone,
          clientName
        })
      });
      const data = await res.json();
      if (data.success && data.payment) {
        // Update with the official server-assigned ids/details without resetting form
        setActivePayment(prev => {
          if (!prev) return data.payment;
          // Keep base64 if user started uploading in the split second before response
          return {
            ...data.payment,
            paymentId: data.payment.paymentId || prev.paymentId,
            transactionId: data.payment.transactionId || prev.transactionId
          };
        });
        fetchSubInfo(true); // Sincroniza em background
      }
    } catch (err) {
      console.warn("Sincronização em segundo plano do pagamento demorou, usando sessão local robusta.", err);
    }
  };

  // Helper Copy Clipboard
  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(message);
    setTimeout(() => setCopiedText(null), 3000);
  };

  // File to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("O tamanho do ficheiro excede o limite de 10 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptBase64(reader.result as string);
      setReceiptFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Submit Receipt
  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePayment || !receiptBase64) return;

    try {
      setIsUploading(true);
      const res = await fetch("/api/payment/upload-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: activePayment.paymentId,
          receiptBase64,
          receiptFileName,
          email: activePayment.email || userEmail || "chillplaces9@gmail.com",
          plan: activePayment.plan || (selectedPlan ? selectedPlan.name : "Plano Mensal"),
          value: activePayment.value || (selectedPlan ? selectedPlan.value : "5.000 Kzs"),
          method: activePayment.method || "Transferência Bancária"
        })
      });
      const data = await res.json();
      if (data.success) {
        setUploadSuccess(true);
        setActivePayment(data.payment);
        fetchSubInfo(true); // Refresh local state immediately in parallel
        if (onSync) onSync(); // Sync parent state
        setTimeout(() => {
          setUploadSuccess(false);
          setShowPaymentModal(false);
          setSelectedPlan(null);
        }, 1000);
      } else {
        alert("Ocorreu um erro ao carregar o comprovativo: " + (data.error || "Tente novamente."));
      }
    } catch (e) {
      console.error(e);
      alert("Erro de ligação ao servidor.");
    } finally {
      setIsUploading(false);
    }
  };

  // Reset payment state and try again
  const handleCancelOrResetPayment = () => {
    setActivePayment(null);
    setReceiptBase64(null);
    setReceiptFileName("");
    setSelectedPlan(null);
    setShowPaymentModal(false);
    setExpressPhone("");
    setExpressName("");
    setIbanEmail(userEmail || "");
    setIbanName("");
    setIbanPhone("");
    setSelectedMethod(null);
    setIsSelectingExpress(false);
  };

  // Submit payment form inputs + PDF receipt as a unified transaction
  const handleSubmitPayment = async (method: string, email: string, name: string, phone?: string) => {
    if (!selectedPlan || !receiptBase64) return;
    
    try {
      setIsUploading(true);
      
      // 1. Create the payment record with form values
      const resCreate = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          plan: selectedPlan.name,
          value: selectedPlan.price,
          method,
          phone,
          clientName: name
        })
      });
      const dataCreate = await resCreate.json();
      if (!dataCreate.success || !dataCreate.payment) {
        alert("Erro ao registar início de pagamento: " + (dataCreate.error || "Tente novamente."));
        setIsUploading(false);
        return;
      }

      const paymentId = dataCreate.payment.paymentId;

      // 2. Upload the PDF receipt
      const resUpload = await fetch("/api/payment/upload-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          receiptBase64,
          receiptFileName,
          email: email.trim().toLowerCase(),
          plan: selectedPlan.name,
          value: selectedPlan.price,
          method
        })
      });
      const dataUpload = await resUpload.json();
      if (dataUpload.success) {
        setUploadSuccess(true);
        setActivePayment(dataUpload.payment);
        fetchSubInfo(true);
        if (onSync) onSync();
        setTimeout(() => {
          setUploadSuccess(false);
          setShowPaymentModal(false);
          setSelectedPlan(null);
          setSelectedMethod(null);
          setReceiptBase64(null);
          setReceiptFileName("");
          setIbanEmail(userEmail || "");
          setIbanName("");
          setIbanPhone("");
          setExpressName("");
        }, 1500);
      } else {
        alert("Erro ao enviar o comprovativo PDF: " + (dataUpload.error || "Tente novamente."));
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro de ligação ao servidor.");
    } finally {
      setIsUploading(false);
    }
  };

  // Format Dates
  const formatDateStr = (isoString: string | null | undefined) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("pt-AO", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch (e) {
      return isoString;
    }
  };

  const isUserPremium = currentPlan === "Premium";

  return (
    <div id="premium-subscription-system" className="space-y-10 font-sans p-1">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#9E1B1B]/15 text-[#FF3B30] border border-[#9E1B1B]/30">
            <Crown className="w-3.5 h-3.5 text-[#FF3B30] animate-pulse" /> Subscrição de Membro Premium VIP
          </span>
          {loading && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono animate-pulse bg-slate-900/45 px-2 py-1 rounded-lg border border-slate-800/40">
              <RefreshCw className="w-3 h-3 animate-spin text-[#FF3B30]" /> Sincronizando dados...
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white">
          {isUserPremium ? "A Sua Conta Premium VIP Está Ativa" : "Leve a Sua Vida Amorosa ao Nível Máximo"}
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          {isUserPremium 
            ? "Obrigado por assinar o Amor IA. Abaixo pode gerir a sua subscrição, ver dias restantes e consultar o histórico de pagamentos."
            : "O login básico dá-lhe acesso apenas ao Painel Geral. Desbloqueie o Coach IA, Analisador de WhatsApp, Simuladores com Personas e Planos de Reconquista escolhendo um plano abaixo."}
        </p>
      </div>

      {/* 1.5 USER NOTIFICATIONS BANNER */}
      {notifications.length > 0 && (
        <div className="max-w-5xl mx-auto space-y-3 animate-fade-in mb-6">
          {notifications.map((n: any) => (
            <div 
              key={n.id} 
              className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between ${
                n.read 
                  ? "bg-[#0A0A0F]/50 border-slate-900 text-slate-400" 
                  : "bg-red-500/5 border-[#FF3B30]/20 text-slate-300 shadow-lg shadow-red-950/10"
              }`}
            >
              <div className="flex gap-2.5 items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-slate-700" : "bg-[#FF3B30] animate-pulse"}`} />
                <div>
                  <span className="font-bold text-white block">{n.title}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                  <span className="text-[9px] text-slate-600 block mt-1 font-mono">
                    {new Date(n.createdAt).toLocaleString("pt-AO")}
                  </span>
                </div>
              </div>
              {!n.read && (
                <button
                  type="button"
                  onClick={handleMarkNotificationsAsRead}
                  className="px-2.5 py-1 text-[10px] font-bold bg-[#FF3B30]/15 hover:bg-[#FF3B30]/25 text-[#FF3B30] border border-[#FF3B30]/25 rounded-md cursor-pointer transition-all whitespace-nowrap self-end sm:self-center"
                >
                  Marcar como lida
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. REAL-TIME SUBSCRIPTION MANAGEMENT SUMMARY PANEL */}
      <div className="max-w-5xl mx-auto">
        <div className="glass rounded-2xl border border-slate-900 overflow-hidden relative p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9E1B1B]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center border-b border-slate-900/60 pb-6 mb-6">
            
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Plano Atual</span>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isUserPremium ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" : "bg-slate-800 text-slate-400"}`}>
                  {isUserPremium ? "PREMIUM VIP" : "CONTA GRATUITA"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isUserPremium ? "Acesso total ilimitado a todas as ferramentas." : "Acesso apenas ao Painel Geral."}
              </p>
            </div>

            <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-900 pt-4 md:pt-0 md:pl-6">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Data de Ativação</span>
              <p className="text-sm font-bold text-white font-mono">
                {formatDateStr(subInfo?.activationDate)}
              </p>
              <p className="text-[11px] text-slate-400">Ativação automática via aprovação</p>
            </div>

            <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-900 pt-4 md:pt-0 md:pl-6">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Data de Expiração</span>
              <p className="text-sm font-bold text-white font-mono">
                {formatDateStr(subInfo?.expirationDate)}
              </p>
              <p className="text-[11px] text-slate-400">Data de expiração calculada</p>
            </div>

            <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-900 pt-4 md:pt-0 md:pl-6 text-center md:text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Dias Restantes</span>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className={`text-2xl font-extrabold font-display ${isUserPremium ? "text-emerald-400" : "text-slate-400"}`}>
                  {subInfo?.daysRemaining ?? 0}
                </span>
                <span className="text-xs text-slate-500">dias</span>
              </div>
              {isUserPremium && (subInfo?.daysRemaining ?? 0) <= 5 && (
                <span className="text-[10px] text-amber-400 font-semibold animate-pulse block">Expira em breve!</span>
              )}
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-slate-600">VALOR DO PLANO:</span>
                <span className="text-white font-bold">{subInfo?.payments?.[0]?.value || "0 Kz"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-slate-600">ESTADO DA CONTA:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  !isUserPremium 
                    ? "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20" 
                    : (subInfo?.daysRemaining ?? 0) <= 0 
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
                  {!isUserPremium ? "INATIVO" : (subInfo?.daysRemaining ?? 0) <= 0 ? "EXPIRADO" : "ATIVO"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("subscription-plans-list");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renovar Plano</span>
            </button>
          </div>



          {/* Alert Banner for pending approval states */}
          {activePayment && activePayment.status === "pending_confirmation" && (
            <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3 text-slate-300 text-xs items-center">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
              <div className="flex-1">
                <span className="font-bold text-white flex items-center gap-2">
                  Pendente de Confirmação
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase border border-amber-500/30 animate-pulse">
                    Pendente
                  </span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enviou o comprovativo para o pagamento <strong>{activePayment.paymentId}</strong>. O nosso desenvolvedor está a validar a transação bancária. O seu plano será ativado assim que for confirmado.
                </p>
              </div>
              <button
                onClick={fetchSubInfo}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
              >
                Atualizar Estado
              </button>
            </div>
          )}

          {activePayment && activePayment.status === "pending_upload" && (
            <div className="mt-6 p-4 bg-[#FF3B30]/5 border border-[#FF3B30]/20 rounded-xl flex gap-3 text-slate-300 text-xs items-center">
              <AlertTriangle className="w-5 h-5 text-[#FF3B30] shrink-0" />
              <div className="flex-1">
                <span className="font-bold text-white">Pagamento Pendente de Comprovativo</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Iniciou o pagamento <strong>{activePayment.paymentId}</strong> do plano {activePayment.plan} ({activePayment.value}). Efetue a transferência ou Express e envie o comprovativo para ativar o serviço.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const foundPlan = plans.find(p => p.name === activePayment.plan);
                    setSelectedPlan(foundPlan || plans[0]);
                    setShowPaymentModal(true);
                  }}
                  className="px-3 py-1.5 bg-[#FF3B30] hover:bg-[#D32F2F] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                >
                  Enviar Comprovativo Now
                </button>
                <button
                  onClick={handleCancelOrResetPayment}
                  className="px-2 py-1.5 border border-slate-800 text-slate-400 hover:text-slate-300 text-[10px] rounded-lg cursor-pointer transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. PLANS SELECTION & PRICING CONTAINER */}
      <div id="subscription-plans-list" className="space-y-6 pt-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white font-display">
            {isUserPremium ? "Renovar ou Alterar o Seu Plano" : "Selecione uma Opção de Assinatura"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Ativação rápida, segura e com suporte directo em Angola.</p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`glass p-6 flex flex-col justify-between transition-all relative rounded-2xl ${
                  plan.popular 
                    ? "border-2 border-[#9E1B1B] bg-gradient-to-b from-[#121216]/50 to-[#240B0E]/20 shadow-xl shadow-[#9E1B1B]/10 scale-105 md:scale-105" 
                    : "border border-slate-900 hover:border-[#9E1B1B]/30"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 py-1 px-3 bg-[#9E1B1B] text-white text-[9px] font-bold rounded-full uppercase tracking-wider shadow-lg">
                    Recomendado
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{plan.name}</h3>
                    <div className="flex items-baseline text-white mt-1">
                      <span className="text-3xl font-extrabold font-display tracking-tight text-white">{plan.price}</span>
                      <span className="text-xs text-slate-500 ml-1">/ {plan.duration}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 min-h-[32px]">{plan.description}</p>
                  </div>

                  <hr className="border-slate-900" />

                  <ul className="space-y-2.5 text-[11px] text-slate-300">
                    {plan.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full mt-6 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#9E1B1B] to-[#FF3B30] text-white hover:opacity-95"
                      : "bg-[#0A0A0F] border border-slate-800 text-slate-300 hover:text-white hover:border-[#9E1B1B]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Assinar Agora</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      {/* 4. PAYMENT MODAL WITH EMBEDDED WORKFLOW */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          
          <div className="glass max-w-2xl w-full rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={handleCancelOrResetPayment}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <XCircle className="w-6 h-6" />
            </button>

            {/* Modal Title */}
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white font-display">Pagar Plano</h3>
              <p className="text-xs text-slate-400">Escolha o método de pagamento para o plano <strong>{selectedPlan.name}</strong> ({selectedPlan.price}).</p>
            </div>

            {/* Clipboard success banner */}
            {copiedText && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center">
                {copiedText}
              </div>
            )}

            {uploadSuccess || (activePayment && activePayment.status === "pending_confirmation") ? (
              <div className="bg-[#0A0A0F] border border-slate-900 rounded-xl p-6 text-center space-y-5 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">Pagamento Registado com Sucesso!</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    A sua solicitação de ativação do plano <strong className="text-white">{selectedPlan?.name || activePayment?.plan}</strong> no valor de <strong className="text-white">{selectedPlan?.price || activePayment?.value}</strong> foi registada no sistema.
                  </p>
                </div>

                <div className="bg-slate-900/35 p-4 rounded-xl border border-slate-900 text-left space-y-2.5 max-w-sm mx-auto text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-900/40 pb-2">
                    <span className="text-slate-500">UTILIZADOR:</span>
                    <span className="text-white font-sans font-bold">{activePayment?.name || expressName || ibanName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/40 pb-2">
                    <span className="text-slate-500">MÉTODO:</span>
                    <span className="text-white font-bold">{activePayment?.method || selectedMethod}</span>
                  </div>
                  {activePayment?.phone && (
                    <div className="flex justify-between border-b border-slate-900/40 pb-2">
                      <span className="text-slate-500">TELEFONE:</span>
                      <span className="text-white font-bold">{activePayment.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">ESTATUTO:</span>
                    <span className="text-amber-400 font-bold uppercase text-[10px] bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">Pendente de Aprovação</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                  O nosso administrador irá validar o comprovativo PDF anexado e ativará a sua subscrição VIP em breve.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelOrResetPayment}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-950/20"
                  >
                    Fechar Janela
                  </button>
                </div>
              </div>
            ) : selectedMethod === "Express" ? (
              <div className="space-y-4 bg-[#0A0A0F] border border-slate-900 rounded-xl p-5 md:p-6 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    Pagamento via Multicaixa Express
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod(null)}
                    className="text-xs text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    Alterar método
                  </button>
                </div>

                {/* Premium Information Box: Instruções */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    <span>Instruções</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-blue-400">1.</span>
                      <span>Efetue o pagamento utilizando o Multicaixa Express ou Transferência Bancária.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-blue-400">2.</span>
                      <span>Após concluir o pagamento clique em 'Enviar Comprovativo'.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-blue-400">3.</span>
                      <span>Aguarde a validação do pagamento.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-blue-400">4.</span>
                      <span>O seu plano será ativado após a aprovação.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  {/* Destination instructions shown clearly */}
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">Transferência no Express</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Efetue o pagamento no valor de <strong className="text-white">{selectedPlan.price}</strong> para o seguinte número de telemóvel de destino:
                    </p>
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-900 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Telemóvel de Destino</span>
                        <span className="text-xl font-mono font-extrabold text-white">928 230 620</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("928 230 620", "Número copiado com sucesso.")}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copiar Número</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Titular: <strong>CHILL PLACES</strong>
                    </div>
                  </div>

                  {/* Form input fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Nome Completo do Usuário</label>
                      <input
                        type="text"
                        required
                        placeholder="Digite o seu nome completo"
                        value={expressName}
                        onChange={(e) => setExpressName(e.target.value)}
                        className="w-full bg-[#050507] border border-slate-900 focus:border-blue-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* File upload container (Drag-n-drop file upload container) */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-400">Carregar Comprovativo</label>
                      <p className="text-[10px] text-slate-500">Por favor, carregue o seu comprovativo oficial no formato PDF, PNG ou JPG (Máx: 10 MB).</p>
                    </div>

                    <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/40 rounded-xl p-6 transition-all bg-[#0A0A0F]/50 text-center relative">
                      <input
                        type="file"
                        required={!receiptBase64}
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                          <Upload className="w-5 h-5 text-blue-400" />
                        </div>
                        
                        <div>
                          <span className="text-xs text-white font-semibold">Arraste o comprovativo (PDF, PNG, JPG) ou clique para carregar</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">Formatos aceites: PDF, PNG, JPG, JPEG (Máx. 10 MB)</p>
                        </div>

                        {receiptFileName && (
                          <div className="p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg inline-flex items-center gap-2 max-w-xs text-left mx-auto text-[11px]">
                            <FileText className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-white truncate font-mono">{receiptFileName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* File Preview container */}
                  {receiptBase64 && (
                    <div className="bg-[#0A0A0F] border border-slate-900 rounded-xl p-3 space-y-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Pré-visualização do Comprovativo</span>
                      <div className="p-4 bg-slate-900/35 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-center gap-3">
                        {receiptBase64.startsWith("data:image/") ? (
                          <img
                            src={receiptBase64}
                            alt="Comprovativo"
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 object-cover rounded-lg border border-slate-800 bg-slate-950 shrink-0"
                          />
                        ) : (
                          <FileText className="w-10 h-10 text-red-500 shrink-0" />
                        )}
                        <div className="text-center sm:text-left min-w-0 flex-1">
                          <span className="text-xs font-semibold text-white block truncate font-mono">{receiptFileName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {receiptBase64.startsWith("data:image/") ? "Imagem Carregada" : "Documento PDF Carregado"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod(null)}
                      className="flex-1 py-2.5 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      disabled={isUploading || !expressName || !receiptBase64}
                      onClick={() => handleSubmitPayment("Multicaixa Express", userEmail, expressName, undefined)}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-950/25"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>A Enviar...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Enviar Comprovativo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedMethod === "IBAN" ? (
              <div className="space-y-4 bg-[#0A0A0F] border border-slate-900 rounded-xl p-5 md:p-6 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                    Pagamento por Transferência Bancária
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod(null)}
                    className="text-xs text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    Alterar método
                  </button>
                </div>

                {/* Premium Information Box: Instruções */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    <span>Instruções</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-purple-400">1.</span>
                      <span>Efetue o pagamento utilizando o Multicaixa Express ou Transferência Bancária.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-purple-400">2.</span>
                      <span>Após concluir o pagamento clique em 'Enviar Comprovativo'.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-purple-400">3.</span>
                      <span>Aguarde a validação do pagamento.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-purple-400">4.</span>
                      <span>O seu plano será ativado após a aprovação.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  {/* Destination instructions shown clearly WITHOUT TITULAR */}
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Transferência Bancária / IBAN</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Efetue a transferência de <strong className="text-white">{selectedPlan.price}</strong> para o IBAN de destino abaixo:
                    </p>
                    
                    <div className="grid grid-cols-1 gap-3 text-xs">
                      <div className="bg-slate-900/35 p-3 rounded-lg border border-slate-900">
                        <span className="text-slate-500 block text-[10px] uppercase">Banco</span>
                        <span className="text-white font-medium">Banco de Fomento Angola (BFA)</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-2 mt-2">
                      <div className="w-full">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">IBAN de Destino</span>
                        <span className="text-sm font-mono font-bold text-white break-all">0006.0000.9641.0541.3010.7</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("0006.0000.9641.0541.3010.7", "IBAN copiado com sucesso.")}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copiar IBAN</span>
                      </button>
                    </div>
                  </div>

                  {/* Form input fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 mb-1">E-mail</label>
                      <input
                        type="email"
                        required
                        placeholder="exemplo@email.com"
                        value={ibanEmail}
                        onChange={(e) => setIbanEmail(e.target.value)}
                        className="w-full bg-[#050507] border border-slate-900 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Digite o seu nome completo"
                        value={ibanName}
                        onChange={(e) => setIbanName(e.target.value)}
                        className="w-full bg-[#050507] border border-slate-900 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Número de Telefone</label>
                      <input
                        type="tel"
                        required
                        placeholder="9XXXXXXXX"
                        value={ibanPhone}
                        onChange={(e) => setIbanPhone(e.target.value)}
                        className="w-full bg-[#050507] border border-slate-900 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* File upload container (Drag-n-drop file upload container) */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-400">Carregar Comprovativo</label>
                      <p className="text-[10px] text-slate-500">Por favor, carregue o seu comprovativo oficial no formato PDF, PNG ou JPG (Máx: 10 MB).</p>
                    </div>

                    <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/40 rounded-xl p-6 transition-all bg-[#0A0A0F]/50 text-center relative">
                      <input
                        type="file"
                        required={!receiptBase64}
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                          <Upload className="w-5 h-5 text-purple-400" />
                        </div>
                        
                        <div>
                          <span className="text-xs text-white font-semibold">Arraste o comprovativo (PDF, PNG, JPG) ou clique para carregar</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">Formatos aceites: PDF, PNG, JPG, JPEG (Máx. 10 MB)</p>
                        </div>

                        {receiptFileName && (
                          <div className="p-2.5 bg-purple-500/5 border border-purple-500/20 rounded-lg inline-flex items-center gap-2 max-w-xs text-left mx-auto text-[11px]">
                            <FileText className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-white truncate font-mono">{receiptFileName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* File Preview container */}
                  {receiptBase64 && (
                    <div className="bg-[#0A0A0F] border border-slate-900 rounded-xl p-3 space-y-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Pré-visualização do Comprovativo</span>
                      <div className="p-4 bg-slate-900/35 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-center gap-3">
                        {receiptBase64.startsWith("data:image/") ? (
                          <img
                            src={receiptBase64}
                            alt="Comprovativo"
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 object-cover rounded-lg border border-slate-800 bg-slate-950 shrink-0"
                          />
                        ) : (
                          <FileText className="w-10 h-10 text-red-500 shrink-0" />
                        )}
                        <div className="text-center sm:text-left min-w-0 flex-1">
                          <span className="text-xs font-semibold text-white block truncate font-mono">{receiptFileName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {receiptBase64.startsWith("data:image/") ? "Imagem Carregada" : "Documento PDF Carregado"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod(null)}
                      className="flex-1 py-2.5 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      disabled={isUploading || !ibanEmail || !ibanName || !ibanPhone || !receiptBase64}
                      onClick={() => handleSubmitPayment("Transferência Bancária", ibanEmail, ibanName, ibanPhone)}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950/25"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>A Enviar...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Enviar Comprovativo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* CHOOSE PAYMENT METHOD AND INITIALIZE SESSION */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Method 1: MCX Express */}
                <div className="bg-[#0A0A0F] border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-all flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-wider">Método Rápido</span>
                    <h4 className="text-sm font-bold text-white mt-1">Multicaixa Express</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Pague de imediato por telemóvel associado ao Express.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (userEmail) {
                        setExpressName(userEmail.split("@")[0].toUpperCase());
                      }
                      setSelectedMethod("Express");
                    }}
                    className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Selecionar Multicaixa Express
                  </button>
                </div>

                {/* Method 2: IBAN Bank Transfer */}
                <div className="bg-[#0A0A0F] border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-all flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[9px] font-bold uppercase tracking-wider">BAI, BFA, etc.</span>
                    <h4 className="text-sm font-bold text-white mt-1">Transferência Bancária</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Depósito físico, NetBanking ou caixas automáticos ATM.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("IBAN")}
                    className="mt-4 w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Selecionar Transferência Bancária
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
