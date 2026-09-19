import React, { useState, useEffect } from "react";
import { UserProfile, Message, ConversationAnalysis, MessageGeneratorResult, InterestDetectorResult, SimulatorPersona, WinBackResult, RecoveryResult, LoveLanguageResult, JournalEntry, DateIdea, GiftSuggestion, DatingAssistantResult, SinglesLessonResult, RelationshipTestResult, CalendarEvent, RelationshipGoalItem } from "../types";
import {
  Heart, Sparkles, Send, Upload, FileText, CheckCircle, AlertTriangle, Play, RotateCcw,
  Plus, Calendar, Gift, Flame, Trophy, Smile, Activity, ShieldAlert, BadgeHelp, Eye, Clock, HelpCircle, Trash2
} from "lucide-react";
import { apiFetch as fetch } from "../utils/api";

// =============================================================
// HELPER: Loading Spinner Premium
// =============================================================
function AIPremiumLoading({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#9E1B1B]/20 border-t-[#9E1B1B] animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#E11D48] animate-pulse" />
      </div>
      <p className="text-xs font-mono text-slate-400 text-center uppercase tracking-widest max-w-xs">{msg}</p>
    </div>
  );
}

// =============================================================
// MODULE 1: AI RELATIONSHIP COACH VIEW
// =============================================================
// HELPER: TypewriterText para respostas dinâmicas, fluidas e de alto desempenho
export function TypewriterText({ text, speed = 10 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    if (!text) return;
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        // Incrementa em blocos de 5 caracteres para manter uma velocidade ágil, imediata e empolgante
        const increment = 5;
        const nextIndex = Math.min(currentIndex + increment, text.length);
        setDisplayedText(text.slice(0, nextIndex));
        setCurrentIndex(nextIndex);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className="relative">
      <p className="whitespace-pre-line font-medium">{displayedText}</p>
      {currentIndex < text.length && (
        <span className="inline-block w-1.5 h-3.5 bg-red-500 animate-pulse ml-1 align-middle" />
      )}
      {currentIndex < text.length && (
        <button
          type="button"
          onClick={() => {
            setDisplayedText(text);
            setCurrentIndex(text.length);
          }}
          className="mt-2 block text-[10px] font-semibold uppercase text-[#9E1B1B] hover:text-[#E11D48] transition-colors cursor-pointer"
        >
          ⚡ Saltar efeito de digitação e mostrar tudo
        </button>
      )}
    </div>
  );
}

export function CoachView({ userProfile }: { userProfile: UserProfile | null }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Olá! Sou o seu Conselheiro Amoroso da Amor IA. Estou aqui para o apoiar em qualquer desafio, dúvida de comunicação, discussões, atração ou planeamento na sua relação. Como posso ajudar o seu coração hoje?`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState<"gemini" | "openai">("gemini");

  // Sincronização do motor de inteligência entre componentes via eventos globais
  React.useEffect(() => {
    const savedProvider = localStorage.getItem("amor_ia_ai_provider") || "gemini";
    setAiProvider(savedProvider as "gemini" | "openai");

    const handleSync = () => {
      const current = localStorage.getItem("amor_ia_ai_provider") || "gemini";
      setAiProvider(current as "gemini" | "openai");
    };

    window.addEventListener("amor_ia_provider_changed", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("amor_ia_provider_changed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleProviderToggle = (provider: "gemini" | "openai") => {
    setAiProvider(provider);
    localStorage.setItem("amor_ia_ai_provider", provider);
    window.dispatchEvent(new Event("amor_ia_provider_changed"));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-ai-provider": aiProvider 
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.text,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Desculpe, ocorreu um erro na ligação com a IA. Certifique-se de que a sua chave API está correta nos segredos da aplicação ou tente novamente.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-red-100 rounded-3xl overflow-hidden flex flex-col h-[550px] relative shadow-xl shadow-red-950/5 animate-fade-in">
      {/* Cabeçalho Premium com Seletor Ativo de Inteligência */}
      <div className="p-4 border-b border-red-100 bg-gradient-to-r from-[#9E1B1B] to-[#E11D48] flex justify-between items-center text-white flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-[#9E1B1B] flex items-center justify-center text-xs font-black font-display uppercase shadow-inner">AI</div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">AI Coach Relacional</h3>
            <span className="text-[9px] font-mono text-red-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CONEXÃO ULTRARRÁPIDA (CHATGPT INTEGRADO)
            </span>
          </div>
        </div>
        
        {/* Seletor do Motor de IA Integrado (Gemini vs ChatGPT) */}
        <div className="flex items-center gap-1 bg-black/15 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            title="Usar motor Gemini (rápido e equilibrado)"
            onClick={() => handleProviderToggle("gemini")}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              aiProvider === "gemini"
                ? "bg-white text-[#9E1B1B] shadow-md"
                : "text-red-100 hover:bg-white/10"
            }`}
          >
            Gemini
          </button>
          <button
            type="button"
            title="Usar ChatGPT / GPT-4o (estruturado e analítico)"
            onClick={() => handleProviderToggle("openai")}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              aiProvider === "openai"
                ? "bg-white text-[#9E1B1B] shadow-md"
                : "text-red-100 hover:bg-white/10"
            }`}
          >
            ChatGPT
          </button>
        </div>
      </div>

      {/* Janela de Conversa */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m, idx) => {
          const isLatestAssistantMsg = m.role === "assistant" && idx === messages.length - 1;
          return (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm transition-all duration-300 ${
                m.role === "user" 
                  ? "bg-gradient-to-br from-[#9E1B1B] to-[#BE123C] text-white rounded-tr-none" 
                  : "bg-white border border-red-100/60 text-slate-800 rounded-tl-none"
              }`}>
                {isLatestAssistantMsg ? (
                  <TypewriterText text={m.content} />
                ) : (
                  <p className="whitespace-pre-line font-medium">{m.content}</p>
                )}
                <span className={`block text-[8px] text-right mt-1.5 ${
                  m.role === "user" ? "text-red-200" : "text-slate-400"
                }`}>{m.timestamp}</span>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-red-100/60 rounded-2xl p-3.5 text-xs text-slate-500 flex items-center gap-2.5 shadow-sm rounded-tl-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9E1B1B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9E1B1B]"></span>
              </span>
              <span className="font-medium animate-pulse">
                {aiProvider === "openai" ? "ChatGPT (GPT-4o) está a formular a resposta..." : "Gemini está a analisar os padrões relacionais..."}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Campo de Entrada de Mensagem */}
      <form onSubmit={handleSend} className="p-4 border-t border-red-100 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={aiProvider === "openai" ? "Pergunte ao ChatGPT sobre a sua relação..." : "Peça conselhos imediatos ao Gemini..."}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#9E1B1B] focus:ring-1 focus:ring-[#9E1B1B]"
        />
        <button type="submit" className="py-3 px-5 bg-[#9E1B1B] hover:bg-[#801414] text-white font-bold rounded-xl transition-all shadow-md shadow-red-950/10 flex items-center justify-center cursor-pointer">
          <Send className="w-4 h-4 animate-pulse" />
        </button>
      </form>
    </div>
  );
}

// =============================================================
// MODULE 2: CONVERSATION ANALYZER VIEW
// =============================================================
export function ConversationAnalyzerView() {
  const [conversationText, setConversationText] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConversationAnalysis | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationText.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationText, context }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Analisador Avançado de Conversas</h2>
          <p className="text-xs text-slate-400">Cole trechos de conversas (ex: WhatsApp, Instagram) para obter um relatório psicológico de respeito, empatia, compatibilidade e sinais de alerta.</p>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contexto da relação (opcional)</label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Ex: Estamos num namoro de 6 meses e ele começou a responder muito frio ultimamente."
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6C4DFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Conteúdo da Conversa (copie e cole as mensagens de texto)</label>
            <textarea
              required
              rows={6}
              value={conversationText}
              onChange={(e) => setConversationText(e.target.value)}
              placeholder="Ex:
[Carlos 14:02]: Estás livre hoje à noite para jantar?
[Maria 14:15]: Não sei, tenho coisas para fazer...
[Carlos 14:16]: Tudo bem, diz alguma coisa se mudares de ideias.
[Maria 15:30]: ok"
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6C4DFF]"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#6C4DFF] to-[#FF4D8D] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2">
            <Activity className="w-4 h-4" />
            <span>{loading ? "A processar relatório de IA..." : "Iniciar Análise Relacional"}</span>
          </button>
        </form>
      </div>

      {loading && <AIPremiumLoading msg="A ler conversas, avaliar empatia e detetar red/green flags com o modelo de IA..." />}

      {result && (
        <div className="bg-[#1E293B]/75 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-[10px] bg-[#6C4DFF]/15 text-[#9D7CFF] border border-[#6C4DFF]/30 font-bold font-mono py-1 px-3 rounded-full uppercase tracking-wider">RELATÓRIO RELACIONAL PREMIUM</span>
              <h3 className="text-xl font-bold text-white font-display mt-2">Diagnóstico de Diálogo concluído</h3>
            </div>
            <div className="bg-[#1E293B] border border-slate-800 py-3 px-5 rounded-2xl text-center">
              <span className="block text-[9px] text-slate-500 font-bold uppercase">SCORE DE COMUNICAÇÃO</span>
              <span className="text-3xl font-black text-[#9D7CFF]">{result.score}%</span>
            </div>
          </div>

          {/* Core Metrics Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0F172A]/50 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-slate-500 block font-semibold mb-1">RESPEITO MÚTUO</span>
              <span className="text-lg font-extrabold text-white">{result.respectScore}/100</span>
            </div>
            <div className="bg-[#0F172A]/50 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-slate-500 block font-semibold mb-1">EMPATIA DEMONSTRADA</span>
              <span className="text-lg font-extrabold text-white">{result.empathyScore}/100</span>
            </div>
            <div className="bg-[#0F172A]/50 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-slate-500 block font-semibold mb-1">COMPATIBILIDADE</span>
              <span className="text-lg font-extrabold text-white">{result.compatibilityScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle className="w-4 h-4" /> Green Flags Encontradas
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.greenFlags.map((flag, i) => (
                  <li key={i} className="flex gap-2 items-start bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/10">
                    <span className="text-emerald-500">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" /> Alertas / Red Flags
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.redFlags.map((flag, i) => (
                  <li key={i} className="flex gap-2 items-start bg-red-950/20 p-2 rounded-xl border border-red-500/10">
                    <span className="text-red-500">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Análise Psicológica Detalhada</h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{result.detailedAnalysis}</p>
          </div>

          <div className="space-y-3 bg-[#6C4DFF]/5 border border-[#6C4DFF]/15 p-5 rounded-2xl">
            <h4 className="text-xs font-bold text-[#9D7CFF] uppercase tracking-wider">Recomendações de Próximos Passos</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {result.nextSteps.map((step, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="text-[#FF4D8D] font-bold font-mono">0{i+1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// MODULE 3: MESSAGE GENERATOR VIEW
// =============================================================
export function MessageGeneratorView() {
  const [category, setCategory] = useState("Romântica");
  const [style, setStyle] = useState("Elegante");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MessageGeneratorResult | null>(null);

  const categories = ["Romântica", "Desculpas / Perdão", "Bom dia", "Boa noite", "Flerte / Conquista", "Reconquistar Ex", "Convite para Encontro", "Aniversário"];
  const styles = ["Elegante", "Divertido", "Romântico Intenso", "Curto e Misterioso", "Confiante / Maduro"];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, style, context }),
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Gerador de Mensagens Premium</h2>
          <p className="text-xs text-slate-400">Escolha a situação e o tom desejados para obter opções de mensagens impossíveis de serem ignoradas.</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Categoria / Intenção</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#6C4DFF]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estilo de escrita</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#6C4DFF]"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contexto específico (opcional - ajuda a refinar a mensagem)</label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Ex: Tivemos uma discussão ontem à noite por causa de ciúmes e quero quebrar o gelo de forma pacífica."
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6C4DFF]"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#6C4DFF] to-[#FF4D8D] text-white font-bold rounded-xl text-xs transition-all shadow-md">
            {loading ? "A gerar mensagens..." : "Gerar Mensagens de Alto Impacto"}
          </button>
        </form>
      </div>

      {loading && <AIPremiumLoading msg="A modelar rascunhos com técnicas de psicologia linguística..." />}

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.options.map((opt, idx) => (
            <div key={idx} className="bg-[#1E293B]/80 border border-slate-800 rounded-2xl p-5 space-y-4 relative flex flex-col justify-between">
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#6C4DFF] flex items-center justify-center text-xs font-bold text-white shadow-md">
                0{idx + 1}
              </span>
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-200 bg-[#0F172A] p-4 rounded-xl border border-slate-800 font-sans italic select-all cursor-pointer">
                  "{opt.text}"
                </p>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#FF4D8D] uppercase tracking-wider block">Gatilho Psicológico:</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{opt.explanation}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(opt.text);
                  alert("Mensagem copiada para a área de transferência!");
                }}
                className="w-full mt-4 py-2 bg-slate-800 hover:bg-[#6C4DFF]/20 text-white hover:text-white border border-slate-700 hover:border-[#6C4DFF]/30 text-[10px] font-bold rounded-lg transition-all"
              >
                Copiar Mensagem
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================
// MODULE 4: INTEREST DETECTOR VIEW
// =============================================================
export function InterestDetectorView() {
  const [answers, setAnswers] = useState({
    replySpeed: "Às vezes demora horas, outras vezes rápido",
    initiatesConversations: "Geralmente sou eu que inicio",
    invitationReaction: "Aceita mas desmarca com frequência",
    bodyLanguage: "Mantém contacto visual e sorri",
    emotionalDisclosure: "Não partilha segredos profundos",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InterestDetectorResult | null>(null);

  const handleDetect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/interest-detector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Detetor Analítico de Interesse</h2>
          <p className="text-xs text-slate-400">Preencha o miniteste de comportamento observável do seu pretendente para obter o cálculo de probabilidade afetiva real.</p>
        </div>

        <form onSubmit={handleDetect} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Velocidade de resposta às mensagens</label>
              <select
                value={answers.replySpeed}
                onChange={(e) => setAnswers({ ...answers, replySpeed: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                <option value="Quase imediato, mesmo ocupado">Quase imediato, mesmo ocupado</option>
                <option value="Em poucos minutos/horas, com regularidade">Em poucos minutos/horas, com regularidade</option>
                <option value="Às vezes demora horas, outras vezes rápido">Às vezes demora horas, outras vezes rápido</option>
                <option value="Demora dias e responde com preguiça">Demora dias e responde com preguiça</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quem costuma iniciar as conversas?</label>
              <select
                value={answers.initiatesConversations}
                onChange={(e) => setAnswers({ ...answers, initiatesConversations: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                <option value="Sempre ele/ela, com muito entusiasmo">Sempre ele/ela, com muito entusiasmo</option>
                <option value="50% / 50% de forma equilibrada">50% / 50% de forma equilibrada</option>
                <option value="Geralmente sou eu que inicio">Geralmente sou eu que inicio</option>
                <option value="Sou 100% eu que inicio, caso contrário não há conversa">Sou 100% eu que inicio, caso contrário não há conversa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reação a convites para encontros</label>
              <select
                value={answers.invitationReaction}
                onChange={(e) => setAnswers({ ...answers, invitationReaction: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                <option value="Aceita de imediato e sugere data/local">Aceita de imediato e sugere data/local</option>
                <option value="Aceita mas deixa data em aberto">Aceita mas deixa data em aberto</option>
                <option value="Aceita mas desmarca com frequência">Aceita mas desmarca com frequência</option>
                <option value="Dá desculpas constantes de falta de tempo">Dá desculpas constantes de falta de tempo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Linguagem corporal (quando estão juntos)</label>
              <select
                value={answers.bodyLanguage}
                onChange={(e) => setAnswers({ ...answers, bodyLanguage: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                <option value="Muito toque físico sutil, proximidade e sorrisos">Muito toque físico sutil, proximidade e sorrisos</option>
                <option value="Mantém contacto visual e sorri">Mantém contacto visual e sorri</option>
                <option value="Normal, amigável mas sem sinais claros de intimidade">Normal, amigável mas sem sinais claros de intimidade</option>
                <option value="Distante, olha para o telemóvel constantemente">Distante, olha para o telemóvel constantemente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nível de partilha emocional</label>
            <select
              value={answers.emotionalDisclosure}
              onChange={(e) => setAnswers({ ...answers, emotionalDisclosure: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
            >
              <option value="Conta segredos profundos, planos futuros e vulnerabilidades">Conta segredos profundos, planos futuros e vulnerabilidades</option>
              <option value="Conversa amigável sobre rotina e passatempos">Conversa amigável sobre rotina e passatempos</option>
              <option value="Não partilha segredos profundos">Não partilha segredos profundos</option>
              <option value="Superficial e evita falar de sentimentos">Superficial e evita falar de sentimentos</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#6C4DFF] to-[#FF4D8D] text-white font-bold rounded-xl text-xs transition-all shadow-md">
            {loading ? "A calcular probabilidades..." : "Executar Cálculo de Interesse"}
          </button>
        </form>
      </div>

      {loading && <AIPremiumLoading msg="A calcular vetor de atração e afinidade..." />}

      {results && (
        <div className="bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white font-display text-center">Diagnóstico de Afinidade Afetiva</h3>

          {/* Interactive Dial charts using pure CSS/SVG */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
            {[
              { label: "INTERESSE GERAL", val: results.interestPercentage, color: "stroke-[#6C4DFF]" },
              { label: "PROB. DE NAMORO", val: results.relationshipProbability, color: "stroke-[#FF4D8D]" },
              { label: "PROB. DE COMPROMISSO", val: results.commitmentProbability, color: "stroke-[#9D7CFF]" },
              { label: "SUCESSO DE DATE", val: results.datingProbability, color: "stroke-[#22C55E]" },
            ].map((chart, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" className="stroke-slate-800 fill-none" strokeWidth="6" />
                    <circle cx="48" cy="48" r="40" className={`${chart.color} fill-none`} strokeWidth="6" strokeDasharray="251" strokeDashoffset={251 - (251 * chart.val) / 100} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-sm font-black text-white">{chart.val}%</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{chart.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-slate-800 pt-5">
            <div>
              <span className="text-[10px] font-bold text-[#FF4D8D] uppercase tracking-wider">Análise do Comportamento</span>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">{results.psychologicalAnalysis}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-950/15 border border-emerald-500/10 p-4 rounded-xl space-y-2">
                <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">Pontos Fortes (Atração)</span>
                <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                  {results.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </div>

              <div className="bg-red-950/15 border border-red-500/10 p-4 rounded-xl space-y-2">
                <span className="text-xs font-bold text-red-400 block uppercase tracking-wider">Barreiras de Interesse</span>
                <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                  {results.weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}
                </ul>
              </div>
            </div>

            <div className="bg-[#6C4DFF]/10 p-5 rounded-xl border border-[#6C4DFF]/20 space-y-2">
              <span className="text-xs font-bold text-[#9D7CFF] block uppercase tracking-wider">Plano de Atração Recomendado</span>
              <ul className="space-y-2 text-xs text-slate-300">
                {results.recommendations.map((rec, i) => <li key={i} className="flex gap-2"><span className="text-[#FF4D8D] font-bold">•</span><span>{rec}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// MODULE 5: CONVERSATION SIMULATOR
// =============================================================
export function ConversationSimulatorView() {
  const personas: SimulatorPersona[] = [
    { id: "boyfriend_jealous", name: "Gabriel (Namorado)", role: "Namorado Inseguro", description: "Gabriel tende a ficar um pouco ciumento quando sai sem ele.", avatar: "🧔🏾‍♂️" },
    { id: "girlfriend_cold", name: "Beatriz (Namorada)", role: "Namorada Fria/Distante", description: "Beatriz tem respondido de forma curta e precisa de paciência.", avatar: "👩🏾‍🦱" },
    { id: "ex_angry", name: "Júlio (Ex-parceiro)", role: "Ex Irritado", description: "Júlio ainda sente mágoas do término e está muito defensivo.", avatar: "🧑🏾‍💼" },
    { id: "crush_shy", name: "Helena (Crush)", role: "Crush Tímida", description: "Helena é reservada e precisa que tome a iniciativa com charme.", avatar: "👸🏾" }
  ];

  const [selectedPersona, setSelectedPersona] = useState<SimulatorPersona>(personas[0]);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! (A personagem está pronta para conversar. Inicie a conversa para treinar as suas habilidades).", timestamp: "" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState<"gemini" | "openai">("gemini");

  // Sincronização do motor de inteligência entre componentes via eventos globais
  React.useEffect(() => {
    const savedProvider = localStorage.getItem("amor_ia_ai_provider") || "gemini";
    setAiProvider(savedProvider as "gemini" | "openai");

    const handleSync = () => {
      const current = localStorage.getItem("amor_ia_ai_provider") || "gemini";
      setAiProvider(current as "gemini" | "openai");
    };

    window.addEventListener("amor_ia_provider_changed", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("amor_ia_provider_changed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleProviderToggle = (provider: "gemini" | "openai") => {
    setAiProvider(provider);
    localStorage.setItem("amor_ia_ai_provider", provider);
    window.dispatchEvent(new Event("amor_ia_provider_changed"));
  };

  const handleSelectPersona = (p: SimulatorPersona) => {
    setSelectedPersona(p);
    setMessages([
      { role: "assistant", content: `Simulador Ativo: Sou o/a ${p.name}. Como vais falar comigo hoje?`, timestamp: "" }
    ]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input, timestamp: "" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/simulator", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-ai-provider": aiProvider 
        },
        body: JSON.stringify({
          persona: selectedPersona,
          messages: [...messages, userMsg]
        })
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.text, timestamp: "" }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Sidebar selection */}
      <div className="space-y-4">
        <div className="bg-white border border-red-100 rounded-2xl p-5 space-y-2 shadow-sm">
          <h3 className="text-xs font-black text-[#9E1B1B] uppercase tracking-wider">Cenários de Treino</h3>
          <p className="text-[11px] text-slate-500 font-medium">Escolha um perfil para simular discussões ou aproximações e testar a sua maturidade emocional.</p>
        </div>

        <div className="space-y-2">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPersona(p)}
              className={`w-full p-4 rounded-2xl border text-left flex gap-3 transition-all cursor-pointer ${
                selectedPersona.id === p.id
                  ? "bg-red-50 border-[#9E1B1B] text-[#9E1B1B] shadow-sm"
                  : "bg-white border-slate-100 text-slate-600 hover:border-red-200"
              }`}
            >
              <span className="text-2xl">{p.avatar}</span>
              <div>
                <span className={`text-xs font-bold block ${selectedPersona.id === p.id ? "text-[#9E1B1B]" : "text-slate-800"}`}>{p.name}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{p.role}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Chat box */}
      <div className="lg:col-span-2 bg-white border border-red-100 rounded-3xl overflow-hidden flex flex-col h-[500px] shadow-xl shadow-red-950/5">
        <div className="p-4 border-b border-red-100 bg-gradient-to-r from-[#9E1B1B] to-[#E11D48] flex items-center justify-between text-white flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl bg-white/15 p-1 rounded-full">{selectedPersona.avatar}</span>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">{selectedPersona.name}</h4>
              <span className="text-[9px] text-red-100 font-medium">{selectedPersona.description}</span>
            </div>
          </div>

          {/* Motor de IA Integrado (Gemini vs ChatGPT) */}
          <div className="flex items-center gap-1 bg-black/15 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              title="Usar motor Gemini (rápido e equilibrado)"
              onClick={() => handleProviderToggle("gemini")}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                aiProvider === "gemini"
                  ? "bg-white text-[#9E1B1B] shadow-md"
                  : "text-red-100 hover:bg-white/10"
              }`}
            >
              Gemini
            </button>
            <button
              type="button"
              title="Usar ChatGPT / GPT-4o (estruturado e analítico)"
              onClick={() => handleProviderToggle("openai")}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                aiProvider === "openai"
                  ? "bg-white text-[#9E1B1B] shadow-md"
                  : "text-red-100 hover:bg-white/10"
              }`}
            >
              ChatGPT
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => {
            const isLatestAssistantMsg = m.role === "assistant" && idx === messages.length - 1;
            return (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm transition-all duration-300 ${
                  m.role === "user" 
                    ? "bg-[#9E1B1B] text-white font-medium rounded-tr-none" 
                    : "bg-white border border-red-100/60 text-slate-800 font-medium rounded-tl-none"
                }`}>
                  {isLatestAssistantMsg ? (
                    <TypewriterText text={m.content} />
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-red-100/60 rounded-2xl p-3 text-xs text-slate-500 animate-pulse flex items-center gap-2 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9E1B1B] animate-ping" />
                <span>A escrever resposta...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-red-100 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Escreva uma mensagem para ${selectedPersona.name}...`}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#9E1B1B] focus:ring-1 focus:ring-[#9E1B1B]"
          />
          <button type="submit" className="py-2.5 px-5 bg-[#9E1B1B] hover:bg-[#801414] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-950/10 cursor-pointer">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

// =============================================================
// MODULE 6: WIN BACK PLAN (PLANO DE RECONQUISTA)
// =============================================================
export function WinBackPlanView() {
  const [breakTime, setBreakTime] = useState("Há 1 mês");
  const [reasons, setReasons] = useState("");
  const [relationshipDetails, setRelationshipDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<WinBackResult | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/winback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breakTime, reasons, relationshipDetails })
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Criador de Planos de Reconquista</h2>
          <p className="text-xs text-slate-400">Desenhe uma estratégia digna, focada em desenvolvimento emocional, psicologia reversa e atração natural para reatar um relacionamento terminado.</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Há quanto tempo terminaram?</label>
              <input
                type="text"
                required
                value={breakTime}
                onChange={(e) => setBreakTime(e.target.value)}
                placeholder="Ex: 2 semanas / 3 meses"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6C4DFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Razão principal do fim</label>
              <input
                type="text"
                required
                value={reasons}
                onChange={(e) => setReasons(e.target.value)}
                placeholder="Ex: Falta de confiança, discussões frequentes, rotina"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6C4DFF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Outros detalhes cruciais sobre a personalidade do ex</label>
            <textarea
              rows={3}
              value={relationshipDetails}
              onChange={(e) => setRelationshipDetails(e.target.value)}
              placeholder="Ex: Ele é muito teimoso e orgulhoso, e atualmente não me responde às mensagens."
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6C4DFF]"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#6C4DFF] to-[#FF4D8D] text-white font-bold rounded-xl text-xs transition-all shadow-md">
            {loading ? "A estruturar plano de contingência..." : "Gerar Roteiro Científico de Reconquista"}
          </button>
        </form>
      </div>

      {loading && <AIPremiumLoading msg="A calcular fases do plano, estimando o período de contacto zero adaptativo e estratégias de reaproximação sutil..." />}

      {results && (
        <div className="bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <span className="text-[9px] bg-[#FF4D8D]/15 text-[#FF4D8D] border border-[#FF4D8D]/20 font-bold font-mono py-1 px-3 rounded-full uppercase tracking-wider">MAPA PSICOLÓGICO DE REAPROXIMAÇÃO</span>
            <h3 className="text-xl font-bold text-white font-display mt-2">Estratégia Mestre de Reconquista</h3>
          </div>

          <div className="bg-[#0F172A]/50 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-bold text-[#9D7CFF] uppercase tracking-wider block mb-1">Estratégia Geral</span>
            <p className="text-xs text-slate-300 leading-relaxed">{results.overallStrategy}</p>
          </div>

          <div className="bg-red-950/15 border border-red-500/10 p-5 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">ERROS CAPITAIS A EVITAR IMEDIATAMENTE</span>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-5">
              {results.mistakesToAvoid.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>

          {/* Chronological Phases */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Roteiro Cronológico por Fases</h4>
            <div className="space-y-4">
              {results.phases.map((phase, idx) => (
                <div key={idx} className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 py-1 px-3 bg-[#6C4DFF]/10 text-[#9D7CFF] text-[9px] font-mono font-bold rounded-bl-xl border-l border-b border-slate-800">
                    {phase.duration}
                  </div>
                  <h5 className="text-sm font-bold text-white mb-1">{phase.phaseName}</h5>
                  <p className="text-xs text-[#9D7CFF] font-medium mb-3">Objetivo: {phase.objective}</p>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tarefas e Roteiros de Ação:</span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {phase.tasks.map((task, tidx) => (
                        <li key={tidx} className="flex gap-2 items-start">
                          <span className="text-[#FF4D8D] font-mono text-[10px]">✓</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#6C4DFF]/5 border border-[#6C4DFF]/15 p-5 rounded-2xl">
            <span className="text-xs font-bold text-[#9D7CFF] uppercase tracking-wider block mb-1">Aconselhamento Emocional de Mestre</span>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{results.psychologicalAdvice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// MODULE 7: RELATIONSHIP RECOVERY PLAN
// =============================================================
export function RelationshipRecoveryPlanView() {
  const [situation, setSituation] = useState("Discussões frequentes e falta de confiança");
  const [commitmentLevel, setCommitmentLevel] = useState("Ambos querem muito melhorar");
  const [coreProblems, setCoreProblems] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecoveryResult | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, commitmentLevel, coreProblems }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Plano de Salvação de Relacionamento</h2>
          <p className="text-xs text-slate-400">Projete um plano detalhado de 4 semanas com dinâmicas, exercícios de intimidade e dicas de comunicação para recuperar a harmonia amorosa.</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Qual é a maior crise atualmente?</label>
              <input
                type="text"
                required
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Ex: Discussões frequentes, ciúmes, rotina"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#6C4DFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Comprometimento de ambos</label>
              <select
                value={commitmentLevel}
                onChange={(e) => setCommitmentLevel(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#6C4DFF]"
              >
                <option value="Ambos querem muito melhorar">Ambos querem muito melhorar</option>
                <option value="Eu quero muito, mas o parceiro está hesitante">Eu quero muito, mas o parceiro está hesitante</option>
                <option value="Relação muito abalada, no limite do fim">Relação muito abalada, no limite do fim</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Problemas ocultos (traições anteriores, problemas financeiros, etc.)</label>
            <textarea
              rows={2}
              value={coreProblems}
              onChange={(e) => setCoreProblems(e.target.value)}
              placeholder="Ex: Traição no passado por parte dele, o que gerou insegurança extrema."
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#6C4DFF]"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#6C4DFF] to-[#FF4D8D] text-white font-bold rounded-xl text-xs transition-all shadow-md">
            {loading ? "A arquitetar plano de salvamento..." : "Gerar Roteiro de Salvação de Relação"}
          </button>
        </form>
      </div>

      {loading && <AIPremiumLoading msg="A simular plano de intervenção de casais de 4 semanas..." />}

      {result && (
        <div className="bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono py-1 px-3 rounded-full uppercase tracking-wider">PLANO DE RE-SINTONIZAÇÃO</span>
            <h3 className="text-xl font-bold text-white font-display mt-2">Plano de Salvação de Relacionamento</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#0F172A]/40 p-4 rounded-xl border border-slate-800">{result.introduction}</p>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Roteiro Semanal Prático</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.weeks.map((week) => (
                <div key={week.weekNumber} className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-3 relative">
                  <span className="absolute top-4 right-4 text-xs font-black text-slate-700">Semana {week.weekNumber}</span>
                  <h5 className="text-sm font-bold text-white pr-10">{week.theme}</h5>
                  <p className="text-xs text-[#9D7CFF] font-medium">Meta: {week.goal}</p>
                  <div className="space-y-1 text-xs text-slate-300">
                    <span className="text-[10px] font-bold text-slate-500 block">Exercícios sugeridos:</span>
                    {week.exercises.map((ex, i) => (
                      <p key={i} className="flex gap-2 items-start"><span className="text-[#FF4D8D]">•</span><span>{ex}</span></p>
                    ))}
                  </div>
                  <div className="bg-[#0F172A]/40 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                    <strong className="text-[#FF4D8D]">Dica de diálogo:</strong> {week.communicationTip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-[#6C4DFF]/10 to-transparent p-5 rounded-2xl border border-[#6C4DFF]/20 space-y-2">
              <span className="text-xs font-bold text-[#9D7CFF] block uppercase tracking-wider">3 Atividades Românticas Extras</span>
              <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-decimal">
                {result.romanticActivities.map((act, i) => <li key={i}>{act}</li>)}
              </ul>
            </div>

            <div className="bg-[#FF4D8D]/5 p-5 rounded-2xl border border-[#FF4D8D]/15 space-y-2">
              <span className="text-xs font-bold text-[#FF4D8D] block uppercase tracking-wider">Reflexão Semanal</span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {result.weeklyReportTemplate.map((q, i) => <li key={i} className="flex gap-1.5 font-sans"><span>?</span><span>{q}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// MODULE 8: LOVE LANGUAGE TEST VIEW
// =============================================================
export function LoveLanguageTestView() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoveLanguageResult | null>(null);

  const questions = [
    {
      q: "Sinto-me mais amado(a) quando o meu parceiro:",
      options: [
        { label: "Diz palavras doces, elogios ou 'Aprecio imenso o teu esforço'.", val: 0 },
        { label: "Dedica-me tempo sem distrações de telemóvel e fazemos planos divertidos.", val: 1 },
        { label: "Faz uma tarefa chata por mim (ex: arrumar a cozinha, resolver um problema mecânico).", val: 2 },
        { label: "Dá-me uma pequena lembrança ou presente surpresa sutil.", val: 3 },
        { label: "Dá-me carinho físico, deitar de conchinha ou massagens carinhosas.", val: 4 }
      ]
    },
    {
      q: "O que mais me magoa numa relação é:",
      options: [
        { label: "Críticas destrutivas, palavras ríspidas ou frias.", val: 0 },
        { label: "A sensação de estar ausente mesmo quando estamos no mesmo sofá.", val: 1 },
        { label: "Falta de cooperação e o parceiro ignorar as minhas necessidades práticas.", val: 2 },
        { label: "Passar datas importantes sem qualquer gesto ou mimo palpável.", val: 3 },
        { label: "Falta de intimidade física e toque espontâneo diário.", val: 4 }
      ]
    },
    {
      q: "No meu aniversário, eu gostaria principalmente de:",
      options: [
        { label: "Um cartão escrito à mão com declarações profundas.", val: 0 },
        { label: "Uma viagem ou jantar a sós extraordinário.", val: 1 },
        { label: "O meu parceiro organizar a festa ou tratar de toda a logística por mim.", val: 2 },
        { label: "Um presente personalizado incrível que mostre que me conhece.", val: 3 },
        { label: "Muitos abraços, proximidade e conexão corporal.", val: 4 }
      ]
    }
  ];

  const handleOptionSelect = (val: number) => {
    const updatedAnswers = [...answers, val];
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Process result locally & via IA
      setLoading(true);
      // Count major languages
      const counts: Record<number, number> = {};
      updatedAnswers.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
      const languages = ["Palavras de Afirmação", "Tempo de Qualidade", "Atos de Serviço", "Presentes", "Toque Físico"];
      
      // Determine primary and secondary
      let primaryIdx = 0;
      let secondaryIdx = 1;
      let maxCount = -1;
      languages.forEach((_, idx) => {
        const c = counts[idx] || 0;
        if (c > maxCount) {
          secondaryIdx = primaryIdx;
          primaryIdx = idx;
          maxCount = c;
        }
      });

      fetch("/api/love-languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryLanguage: languages[primaryIdx],
          secondaryLanguage: languages[secondaryIdx]
        })
      })
        .then((res) => res.json())
        .then((data) => setResult(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  };

  const handleReset = () => {
    setAnswers([]);
    setCurrentQuestion(0);
    setResult(null);
  };

  return (
    <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 md:p-8 font-sans space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white font-display">Teste Avançado das 5 Linguagens do Amor</h2>
        <p className="text-xs text-slate-400">Descubra cientificamente de que forma prefere expressar e receber amor emocional para melhorar a ligação de casal.</p>
      </div>

      {!result && !loading && (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>PERGUNTA {currentQuestion + 1} DE {questions.length}</span>
            <span>Progresso: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>

          <h3 className="text-sm font-semibold text-white leading-relaxed">{questions[currentQuestion].q}</h3>

          <div className="space-y-2.5">
            {questions[currentQuestion].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(opt.val)}
                className="w-full p-4 rounded-xl text-left text-xs bg-[#0F172A]/50 border border-slate-800 hover:border-[#6C4DFF] hover:bg-[#6C4DFF]/5 text-slate-300 hover:text-white transition-all active:scale-[0.99]"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <AIPremiumLoading msg="A calcular pontuação de afinidade amorosa..." />}

      {result && (
        <div className="space-y-6">
          <div className="text-center space-y-1 pb-4 border-b border-slate-800">
            <span className="text-[10px] bg-[#6C4DFF]/20 text-[#9D7CFF] font-bold font-mono py-1 px-3 rounded-full uppercase">RESULTADO COMPLETO</span>
            <h3 className="text-xl font-bold text-white font-display mt-2">A sua Linguagem Predominante é de Alta Sintonia</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0F172A]/40 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#6C4DFF] block uppercase tracking-wider">Linguagem Primária</span>
              <p className="text-xs text-slate-300 leading-relaxed">{result.explanationPrimary}</p>
            </div>

            <div className="bg-[#0F172A]/40 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#FF4D8D] block uppercase tracking-wider">Linguagem Secundária</span>
              <p className="text-xs text-slate-300 leading-relaxed">{result.explanationSecondary}</p>
            </div>
          </div>

          <div className="bg-[#6C4DFF]/5 border border-[#6C4DFF]/15 p-5 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-[#9D7CFF] block uppercase tracking-wider">Recomendações Práticas de Demonstração</span>
            <ul className="space-y-2 text-xs text-slate-300">
              {result.actionSuggestions.map((s, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="text-[#FF4D8D]">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-950/15 border border-red-500/10 p-5 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-red-400 block uppercase tracking-wider">O que Deve Ser Evitado</span>
            <ul className="space-y-2 text-xs text-slate-300">
              {result.mistakesToAvoid.map((m, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="text-red-500">✗</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={handleReset} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all">
            Fazer Teste Novamente
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================
// MODULE 9: RELATIONSHIP JOURNAL VIEW
// =============================================================
export function RelationshipJournalView() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    { id: "1", date: "2026-07-06", mood: "loving", score: 90, notes: "Fomos passear pela marginal de Luanda e jantámos fantásticos. Comunicação 100% fluida." },
    { id: "2", date: "2026-07-07", mood: "neutral", score: 70, notes: "Algum cansaço pós-trabalho mas conseguimos dialogar bem sobre os problemas." },
    { id: "3", date: "2026-07-08", mood: "anxious", score: 50, notes: "Pequena faísca por causa de um mal-entendido de mensagens. Precisamos de acalmar." }
  ]);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<JournalEntry["mood"]>("loving");
  const [score, setScore] = useState(80);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    const newEntry: JournalEntry = {
      id: Math.random().toString(),
      date: new Date().toISOString().substring(0, 10),
      mood,
      score,
      notes: note,
    };

    setEntries([newEntry, ...entries]);
    setNote("");
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Write Diary block */}
        <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Novo Registo no Diário</h3>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Como avalia o dia de hoje (0 a 100)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="w-full accent-[#6C4DFF]"
              />
              <span className="text-xs text-[#9D7CFF] font-bold mt-1 block text-right">{score}% score</span>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1.5">Humor Predominante</label>
              <div className="grid grid-cols-5 gap-1.5 bg-[#0F172A]/50 p-1.5 rounded-xl border border-slate-800">
                {(["happy", "loving", "neutral", "sad", "anxious"] as JournalEntry["mood"][]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mood === m ? "bg-[#6C4DFF]/25 text-white" : "text-slate-500"
                    }`}
                  >
                    {m === "loving" && "💖"}
                    {m === "happy" && "😊"}
                    {m === "neutral" && "😐"}
                    {m === "sad" && "😢"}
                    {m === "anxious" && "😰"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1.5">Anotações / Notas Rápidas</label>
              <textarea
                rows={3}
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Teve um jantar relaxado, conversámos sem tocar nos segredos chatos do costume."
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6C4DFF]"
              />
            </div>

            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-[#6C4DFF] to-[#9D7CFF] text-white font-bold text-xs rounded-xl transition-all shadow-md">
              Registar no Diário
            </button>
          </form>
        </div>

        {/* View history and interactive graphs */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Histórico Diário de Conexão</h3>
            <div className="space-y-3.5">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-[#0F172A]/40 border border-slate-800 p-4 rounded-2xl flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-slate-800 flex items-center justify-center text-2xl shrink-0">
                    {entry.mood === "loving" && "💖"}
                    {entry.mood === "happy" && "😊"}
                    {entry.mood === "neutral" && "😐"}
                    {entry.mood === "sad" && "😢"}
                    {entry.mood === "anxious" && "😰"}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-500">{entry.date}</span>
                      <span className="text-xs font-bold text-[#9D7CFF]">{entry.score}% de score</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{entry.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// MODULE 10: RELATIONSHIP TESTS VIEW (PSYCHOMETRICS)
// =============================================================
export function RelationshipTestsView() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RelationshipTestResult | null>(null);

  const tests = [
    { id: "compatibility", title: "Teste de Compatibilidade Geral", questionsCount: 3, icon: Heart, desc: "Avalie crenças, rituais e compatibilidade existencial de casal." },
    { id: "attachment", title: "Teste do Estilo de Apego", questionsCount: 3, icon: ShieldAlert, desc: "APEGO SEGURO, ANSIOSO OU EVITATIVO. Conheça as suas barreiras." },
    { id: "jealousy", title: "Teste de Ciúmes & Insegurança", questionsCount: 3, icon: BadgeHelp, desc: "Entenda se as suas inseguranças são normais ou desgastantes." }
  ];

  const testQuestions: Record<string, { q: string, options: string[] }[]> = {
    compatibility: [
      { q: "Como gerem as opiniões contrárias sobre finanças?", options: ["Sempre conversamos e encontramos um meio termo pacífico", "Geralmente há tensão e adiamos a decisão", "Cada um faz à sua maneira sem partilhar de todo"] },
      { q: "Quão alinhados estão os vossos planos de vida a 5 anos?", options: ["Muito alinhados, partilhamos as mesmas visões", "Algumas divergências mas fáceis de calibrar", "Quase totalmente opostos"] },
      { q: "Qual a frequência de carinho e tempo de qualidade a sós?", options: ["Excelente, cuidamos muito disso diariamente", "Apenas aos fins de semana se não estivermos cansados", "Quase inexistente"] }
    ],
    attachment: [
      { q: "Quando o parceiro demora mais tempo a responder às mensagens, você sente:", options: ["Tranquilidade, ele/ela deve estar ocupado(a)", "Ansiedade extrema, penso que fiz algo errado", "Alívio ou simplesmente não me importo de todo"] },
      { q: "Se o seu parceiro precisa de espaço ou tempo sozinho, você:", options: ["Respeito e incentivo, também gosto de tempo só", "Sinto-me rejeitado(a) e fico a cobrar atenção", "Sinto-me feliz e afasto-me ainda mais"] },
      { q: "Como se sente ao expressar sentimentos profundos?", options: ["Sinto-me totalmente seguro(a) e confortável", "Tenho medo de assustar ou ser abandonado(a)", "Prefiro guardar para mim e ser autossuficiente"] }
    ],
    jealousy: [
      { q: "Se o seu parceiro interage ou recebe likes de alguém que você considera atraente nas redes sociais, qual é a sua reação imediata?", options: ["Desvalorizo completamente, confio plenamente na nossa relação", "Sinto um aperto no peito e começo a investigar os perfis ou a cobrar explicações", "Fico com raiva silenciosa e tento dar o troco fazendo o mesmo ou ignorando-o"] },
      { q: "Com que frequência você sente necessidade de verificar o telemóvel, as conversas ou a localização do seu parceiro?", options: ["Nunca ou quase nunca, respeito totalmente a privacidade dele(a)", "Com bastante frequência, sinto uma insegurança forte que só passa ao confirmar que está tudo bem", "Fazia isso antes, mas agora tento controlar-me para evitar brigas exaustivas"] },
      { q: "Quando o seu parceiro sai com amigos(as) sem si, como costuma passar esse período de tempo?", options: ["Aproveito para fazer as minhas atividades, ler, ver séries ou estar com os meus próprios amigos", "Fico ansioso(a), a imaginar cenários de traição ou a enviar mensagens constantes para ver se responde", "Fico indiferente, mas secretamente ressentido(a) pela exclusão"] }
    ]
  };

  const handleStartTest = (id: string) => {
    setActiveTest(id);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  const handleSelectOption = (idx: number) => {
    const updatedAnswers = [...answers, idx];
    setAnswers(updatedAnswers);

    const questions = testQuestions[activeTest!] || [];
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setLoading(true);
      fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testName: tests.find((t) => t.id === activeTest)?.title, answers: updatedAnswers })
      })
        .then((res) => res.json())
        .then((data) => setResult(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 md:p-8 font-sans space-y-6">
      {!activeTest && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white font-display">Bateria de Testes Psicológicos Relacionais</h2>
            <p className="text-xs text-slate-400 font-sans">Aceda a diagnósticos cientificamente calibrados de compatibilidade, ciúmes e perfis de apego para casais.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {tests.map((test) => {
              const Icon = test.icon;
              return (
                <div key={test.id} className="bg-[#0F172A]/50 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#6C4DFF]/15 text-[#9D7CFF] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white">{test.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{test.desc}</p>
                  </div>
                  <button
                    onClick={() => handleStartTest(test.id)}
                    className="w-full py-2 bg-[#6C4DFF] hover:bg-[#5939f3] text-white text-[10px] font-bold rounded-lg transition-all"
                  >
                    Começar Teste
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTest && !result && !loading && (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>{tests.find((t) => t.id === activeTest)?.title}</span>
            <span>PERGUNTA {currentQuestion + 1} DE {testQuestions[activeTest]?.length || 3}</span>
          </div>

          <h3 className="text-sm font-semibold text-white leading-relaxed">
            {testQuestions[activeTest]?.[currentQuestion]?.q || "Carregar pergunta..."}
          </h3>

          <div className="space-y-2.5">
            {testQuestions[activeTest]?.[currentQuestion]?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className="w-full p-4 rounded-xl text-left text-xs bg-[#0F172A]/50 border border-slate-800 hover:border-[#6C4DFF] hover:bg-[#6C4DFF]/5 text-slate-300 hover:text-white transition-all active:scale-[0.99]"
              >
                {opt}
              </button>
            ))}
          </div>

          <button onClick={() => setActiveTest(null)} className="w-full py-2 border border-slate-800 text-slate-500 hover:text-white text-xs rounded-lg transition-all">
            Voltar para a Lista de Testes
          </button>
        </div>
      )}

      {loading && <AIPremiumLoading msg="A processar respostas, cruzando com algoritmos psicométricos..." />}

      {result && (
        <div className="space-y-6">
          <div className="text-center pb-4 border-b border-slate-800">
            <span className="text-[9px] bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20 font-bold font-mono py-1 px-3 rounded-full uppercase">DIAGNÓSTICO CONCLUÍDO</span>
            <h3 className="text-lg font-bold text-white font-display mt-2">{result.resultTitle}</h3>
            <span className="text-xs text-[#9D7CFF] font-semibold">Pontuação do Teste: {result.score}/100</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#0F172A]/40 p-4 rounded-xl border border-slate-800">{result.analysis}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-950/15 border border-emerald-500/10 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">Pontos Fortes Detectados</span>
              <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                {result.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>

            <div className="bg-red-950/15 border border-red-500/10 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-red-400 block uppercase tracking-wider">Pontos de Atenção</span>
              <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                {result.weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-[#6C4DFF]/5 p-5 rounded-xl border border-[#6C4DFF]/15 space-y-2">
            <span className="text-xs font-bold text-[#9D7CFF] block uppercase tracking-wider">Recomendações Práticas</span>
            <ul className="space-y-2 text-xs text-slate-300">
              {result.recommendations.map((rec, i) => <li key={i} className="flex gap-2"><span className="text-[#FF4D8D] font-bold">•</span><span>{rec}</span></li>)}
            </ul>
          </div>

          <button onClick={() => setActiveTest(null)} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all">
            Concluir e Voltar
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================
// MODULE 11: RELATIONSHIP CALENDAR
// =============================================================
export function RelationshipCalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<CalendarEvent["type"]>("datenight");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  // Get user email safely
  const savedUser = localStorage.getItem("amor_ia_user");
  const userObj = savedUser ? JSON.parse(savedUser) : null;
  const userEmail = userObj?.email || "all";

  // Load calendar events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Try reading from localStorage first for instant load
        const localEvents = localStorage.getItem("amor_ia_calendar_events");
        if (localEvents) {
          setEvents(JSON.parse(localEvents));
          setLoading(false);
        }

        // Fetch latest from backend database
        const response = await fetch(`/api/calendar?email=${encodeURIComponent(userEmail)}`);
        if (response.ok) {
          const serverEvents = await response.json();
          if (serverEvents && serverEvents.length > 0) {
            setEvents(serverEvents);
            localStorage.setItem("amor_ia_calendar_events", JSON.stringify(serverEvents));
          } else if (!localEvents) {
            // Setup defaults if empty
            const defaults = [
              { id: "1", title: "Aniversário de Namoro", date: "2026-07-25", type: "anniversary" as const, notes: "Completamos 2 anos!" },
              { id: "2", title: "Date Night Especial", date: "2026-07-15", type: "datenight" as const, notes: "Reservar mesa no restaurante panorâmico" },
              { id: "3", title: "Aniversário dela/dele", date: "2026-08-11", type: "birthday" as const, notes: "Comprar presente com antecedência" }
            ];
            setEvents(defaults);
            localStorage.setItem("amor_ia_calendar_events", JSON.stringify(defaults));
            // Save defaults to backend too
            for (const item of defaults) {
              await fetch("/api/calendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...item, user_email: userEmail })
              });
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do calendário:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [userEmail]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const newEvent: CalendarEvent = {
      id: Math.random().toString(),
      title,
      date,
      type,
      notes
    };

    // Update local state and localStorage
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem("amor_ia_calendar_events", JSON.stringify(updatedEvents));

    setTitle("");
    setDate("");
    setNotes("");

    // Save in server database
    try {
      await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEvent,
          user_email: userEmail
        })
      });
    } catch (err) {
      console.error("Erro ao salvar evento no servidor:", err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    // Update local state and localStorage
    const updatedEvents = events.filter(e => e.id !== id);
    setEvents(updatedEvents);
    localStorage.setItem("amor_ia_calendar_events", JSON.stringify(updatedEvents));

    // Delete from server database
    try {
      await fetch(`/api/calendar/${id}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error("Erro ao apagar evento no servidor:", err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Agendar Momento Especial</h3>
          <form onSubmit={handleAddEvent} className="space-y-3.5">
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Título do Evento</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Date de Pic-nic"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6C4DFF]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Categoria</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                <option value="anniversary">Aniversário / Marco Importante</option>
                <option value="birthday">Aniversário Pessoal</option>
                <option value="datenight">Encontro Romântico</option>
                <option value="special">Outro Momento Sutil</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Notas extras</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Ela adora comida japonesa..."
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6C4DFF]"
              />
            </div>

            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-[#6C4DFF] to-[#9D7CFF] text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer">
              Adicionar Lembrete
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cronograma de Momentos Memoráveis</h3>
          
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
              A carregar calendário da base de dados...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Nenhum evento agendado. Comece por agendar um momento especial!
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="bg-[#0F172A]/40 border border-slate-800 p-4 rounded-2xl flex justify-between items-center hover:border-slate-700 transition-all group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        event.type === "anniversary" ? "bg-[#FF4D8D]" : event.type === "datenight" ? "bg-[#6C4DFF]" : "bg-amber-500"
                      }`} />
                      <h4 className="text-xs font-bold text-white">{event.title}</h4>
                    </div>
                    {event.notes && <p className="text-[10px] text-slate-400 leading-relaxed pl-4">{event.notes}</p>}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500">{event.date}</span>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      title="Apagar lembrete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// MODULE 12: DATE IDEAS
// =============================================================
export function DateIdeasView() {
  const [budget, setBudget] = useState("Médio");
  const [city, setCity] = useState("Luanda, Angola");
  const [weather, setWeather] = useState("Quente / Ensolarado");
  const [environment, setEnvironment] = useState("Romântico");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<DateIdea[] | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIdeas(null);

    try {
      const response = await fetch("/api/date-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget, city, weather, environment })
      });
      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Gerador Premium de Ideias de Encontros</h2>
          <p className="text-xs text-slate-400">Gere roteiros inesquecíveis, com atmosfera perfeita, estimativa de orçamento e dicas de sedução sutil.</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Orçamento</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                <option value="Económico">Económico (Baixo custo, criativo)</option>
                <option value="Médio">Médio (Excelente custo-benefício)</option>
                <option value="Luxo">Luxo (Inesquecível, requintado)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cidade ou Localização</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Luanda, Benguela, Lisboa"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Clima</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                <option value="Quente / Ensolarado">Quente / Ensolarado</option>
                <option value="Frio / Outono">Frio / Chuvoso</option>
                <option value="Noite Estrelada">Noite Estrelada / Fresco</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ambiente Ideal</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                <option value="Romântico">Romântico Tradicional</option>
                <option value="Ao ar livre">Ao ar livre / Natureza</option>
                <option value="Em casa">Em casa (Intimidade sutil)</option>
                <option value="Aventura / Diversão">Aventura / Descontraído</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#6C4DFF] to-[#FF4D8D] text-white font-bold rounded-xl text-xs transition-all shadow-md">
            {loading ? "A planear roteiros extraordinários..." : "Projetar Ideias de Encontros de Elite"}
          </button>
        </form>
      </div>

      {loading && <AIPremiumLoading msg="A calcular atmosfera, itinerários e gatilhos de conexão..." />}

      {ideas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ideas.map((idea, idx) => (
            <div key={idx} className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#9D7CFF]">
                  <Flame className="w-4.5 h-4.5 fill-[#9D7CFF]/20" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{idea.title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{idea.description}</p>
                <span className="text-[10px] font-mono text-slate-500 block">Custo Estimado: {idea.budgetEstimation}</span>
              </div>
              <div className="bg-[#6C4DFF]/10 border border-[#6C4DFF]/15 p-3.5 rounded-xl text-[11px] text-slate-300">
                <strong className="text-[#FF4D8D]">Dica de Mestre:</strong> {idea.proTip}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================
// MODULE 13: GIFT SUGGESTIONS
// =============================================================
export function GiftSuggestionsView() {
  const [budget, setBudget] = useState("Médio");
  const [occasion, setOccasion] = useState("Aniversário de Namoro");
  const [age, setAge] = useState(26);
  const [stage, setStage] = useState("Paixão Inicial / Namoro Recente");
  const [loading, setLoading] = useState(false);
  const [gifts, setGifts] = useState<GiftSuggestion[] | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGifts(null);

    try {
      const response = await fetch("/api/gift-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget, occasion, age, stage })
      });
      const data = await response.json();
      setGifts(data.gifts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Sugestões de Presentes Personalizados</h2>
          <p className="text-xs text-slate-400">Esqueça meias ou perfumes genéricos. Receba recomendações criativas que tocam o lado emocional do seu parceiro.</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Orçamento Máximo</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                <option value="Económico">Económico (Lembranças criativas)</option>
                <option value="Médio">Médio (Inovador e carinhoso)</option>
                <option value="Luxo">Luxo (Impactante, joias, eletrónicos premium)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ocasião Especial</label>
              <input
                type="text"
                required
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="Ex: Aniversário dela, Reconciliação"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Idade do Parceiro</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fase da Relação</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                <option value="Paixão Inicial / Namoro Recente">Paixão Inicial / Namoro Recente</option>
                <option value="Namoro Longo (1 ano+)">Namoro Longo (1 ano+)</option>
                <option value="Casados / Vida em comum">Casados / Vida em comum</option>
                <option value="A reatar / Recuperar confiança">A reatar / Recuperar confiança</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#6C4DFF] to-[#FF4D8D] text-white font-bold rounded-xl text-xs transition-all shadow-md">
            {loading ? "A calcular conexões emocionais..." : "Pesquisar Sugestões de Presentes Memoráveis"}
          </button>
        </form>
      </div>

      {loading && <AIPremiumLoading msg="A cruzar interesses, linguagens do amor e psicologia de marcas..." />}

      {gifts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gifts.map((gift, idx) => (
            <div key={idx} className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#FF4D8D]">
                  <Gift className="w-4.5 h-4.5 fill-[#FF4D8D]/20" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{gift.name}</h4>
                </div>
                <p className="text-xs text-[#9D7CFF] font-medium leading-relaxed font-sans">{gift.whyItWorks}</p>
                <span className="text-[10px] font-mono text-slate-500 block">Preço Aproximado: {gift.approxPrice}</span>
              </div>
              <div className="bg-[#6C4DFF]/10 p-3.5 rounded-xl text-[11px] text-slate-300">
                <strong className="text-white">Como entregar com charme:</strong> {gift.deliveryTip}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================
// MODULE 14: DATING ASSISTANT
// =============================================================
export function DatingAssistantView() {
  const [currentBio, setCurrentBio] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [appType, setAppType] = useState("Tinder");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DatingAssistantResult | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/dating-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentBio, targetAudience, appType })
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Assistente de Date</h2>
          <p className="text-xs text-slate-400">Maximize as suas correspondências (Matches). Otimize a sua bio e receba abridores/iniciadores de conversa de alta atração.</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Aplicação de Namoro que utiliza</label>
              <select
                value={appType}
                onChange={(e) => setAppType(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                <option value="Tinder">Tinder</option>
                <option value="Bumble">Bumble</option>
                <option value="Amor IA">Amor IA / Premium Match</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Que tipo de pessoa gostaria de atrair?</label>
              <input
                type="text"
                required
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Ex: Pessoas cultas, ambiciosas, descontraídas"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Escreva a sua biografia atual (ou rascunho)</label>
            <textarea
              rows={3}
              value={currentBio}
              onChange={(e) => setCurrentBio(e.target.value)}
              placeholder="Ex: Gosto de café, ginásio e de viajar nos tempos livres."
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6C4DFF]"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#6C4DFF] to-[#FF4D8D] text-white font-bold rounded-xl text-xs transition-all shadow-md">
            {loading ? "A recalibrar perfil social..." : "Otimizar Biografia & Gerar Iniciadores"}
          </button>
        </form>
      </div>

      {loading && <AIPremiumLoading msg="A aplicar copywriting de atração social de elite e análise de micro-expressões..." />}

      {results && (
        <div className="bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0F172A]/50 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#6C4DFF] block uppercase tracking-wider">Opção de Bio 1: Inteligente</span>
              <p className="text-xs text-slate-300 leading-relaxed italic">"{results.optimizedBio1}"</p>
            </div>

            <div className="bg-[#0F172A]/50 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#FF4D8D] block uppercase tracking-wider">Opção de Bio 2: Charmosa</span>
              <p className="text-xs text-slate-300 leading-relaxed italic">"{results.optimizedBio2}"</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-white block uppercase tracking-wider">Iniciadores de Conversa (Abridores)</span>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                {results.starters.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div className="bg-red-950/10 border border-red-500/10 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-red-400 block uppercase tracking-wider">Erros Comuns Detectados</span>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                {results.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-[#6C4DFF]/10 p-5 rounded-xl border border-[#6C4DFF]/20">
            <span className="text-xs font-bold text-[#9D7CFF] block uppercase tracking-wider mb-2">Dicas Fundamentais para Fotografia</span>
            <ul className="space-y-1 text-xs text-slate-300 list-decimal pl-4">
              {results.photoTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// MODULE 15: SINGLES MODE
// =============================================================
export function SinglesModeView() {
  const [topic, setTopic] = useState("Autoconfiança & Timidez");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SinglesLessonResult | null>(null);

  const topics = [
    "Autoconfiança & Timidez",
    "A Arte da Sedução Sutil",
    "Habilidades Sociais & Abordagem",
    "Conversação Fluida em Encontros",
    "Mentalidade Saudável de Solteiro"
  ];

  const handleFetchLesson = async (selectedTopic: string) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/singles-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load initial topic on mount
  useEffect(() => {
    handleFetchLesson("Autoconfiança & Timidez");
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Modo Solteiros: Masterclass de Atração</h2>
          <p className="text-xs text-slate-400">Escolha um tópico para desbloquear técnicas mentais e comportamentais de elite desenvolvidas por terapeutas de casais.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => { setTopic(t); handleFetchLesson(t); }}
              className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                topic === t ? "bg-[#6C4DFF] text-white border-[#6C4DFF]" : "bg-[#0F172A]/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && <AIPremiumLoading msg="A desenhar manual prático com base em psicologia comportamental..." />}

      {result && (
        <div className="bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] bg-[#FF4D8D]/15 text-[#FF4D8D] font-bold font-mono py-1 px-3 rounded-full uppercase">MODO SOLTEIROS MASTERCLASS</span>
            <h3 className="text-xl font-bold text-white font-display mt-2">{result.title}</h3>
          </div>

          <div className="bg-[#0F172A]/50 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-[#9D7CFF] uppercase tracking-wider block">Mudança de Mentalidade (Mindset Shift)</span>
            <p className="text-xs text-slate-300 leading-relaxed italic">"{result.mindsetShift}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">3 Técnicas Práticas</span>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.techniques.map((tech, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="text-[#FF4D8D] font-mono font-bold">0{idx+1}.</span>
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Exemplos de Diálogos Charmosos</span>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.dialogueExamples.map((ex, idx) => (
                  <li key={idx} className="bg-[#0F172A]/40 border border-slate-800 p-3 rounded-xl italic">
                    "{ex}"
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#6C4DFF]/15 to-[#FF4D8D]/5 p-5 rounded-2xl border border-[#6C4DFF]/25 text-center space-y-2 animate-pulse-subtle">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">DESAFIO DE AÇÃO PRÁTICA (24 HORAS)</span>
            <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">{result.dailyChallenge}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// MODULE 16: RELATIONSHIP GOALS
// =============================================================
export function RelationshipGoalsView() {
  const [goals, setGoals] = useState<RelationshipGoalItem[]>([
    { id: "1", title: "Cozinhar juntos 1 vez por semana", category: "time", targetDate: "2026-07-20", progress: 60, notes: "Excelente para descontrair sem ecrãs." },
    { id: "2", title: "Ter conversas de feedback honesto semanais", category: "communication", targetDate: "2026-08-01", progress: 40, notes: "Falar sobre sentimentos sem acusar." },
    { id: "3", title: "Diminuir interrupções ao falar", category: "conflict", targetDate: "2026-07-15", progress: 80, notes: "Trabalhar a escuta ativa profunda." }
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<RelationshipGoalItem["category"]>("communication");
  const [newTarget, setNewTarget] = useState("");

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget) return;

    setGoals([
      ...goals,
      {
        id: Math.random().toString(),
        title: newTitle,
        category: newCategory,
        targetDate: newTarget,
        progress: 0,
        notes: "Novo objetivo traçado."
      }
    ]);
    setNewTitle("");
    setNewTarget("");
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, progress } : g)));
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Definir Nova Meta Amorosa</h3>
          <form onSubmit={handleAddGoal} className="space-y-3.5">
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Meta / Objetivo</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Escuta ativa sem interromper"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6C4DFF]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Categoria</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                <option value="communication">Comunicação Saudável</option>
                <option value="trust">Fortalecimento de Confiança</option>
                <option value="romance">Mais Romance & Paixão</option>
                <option value="time">Tempo de Qualidade Juntos</option>
                <option value="conflict">Resolução de Conflitos</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Data Limite de Progresso</label>
              <input
                type="date"
                required
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-[#6C4DFF] to-[#9D7CFF] text-white font-bold text-xs rounded-xl transition-all shadow-md">
              Estabelecer Compromisso
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Acompanhamento das Metas Ativas</h3>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-[#0F172A]/40 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white">{goal.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Meta até: {goal.targetDate}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#9D7CFF] bg-[#6C4DFF]/15 px-2 py-0.5 rounded border border-[#6C4DFF]/20">
                    {goal.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Progresso Realizado</span>
                    <span className="font-bold">{goal.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value))}
                    className="w-full accent-[#FF4D8D]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
