import React, { useEffect, useState } from "react";
import { UserProfile } from "../types";
import { Heart, Sparkles, Zap, ArrowRight, HelpCircle } from "lucide-react";
import { apiFetch as fetch } from "../utils/api";

interface DashboardViewProps {
  userProfile: UserProfile | null;
  onNavigateToModule: (module: string) => void;
}

export interface DailyInsight {
  recommendation: string;
  insight: string;
  mission: string;
}

export default function DashboardView({ userProfile, onNavigateToModule }: DashboardViewProps) {
  const [insightData, setInsightData] = useState<DailyInsight>({
    recommendation: "Escreva uma mensagem sutil de agradecimento pelo suporte do parceiro hoje.",
    insight: "A intimidade floresce nos pequenos gestos diários, não apenas nos grandes eventos.",
    mission: "Diga 'Aprecio-te por seres quem és' espontaneamente ao seu parceiro.",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setLoading(true);
      fetch("/api/dashboard-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setInsightData(data);
          }
        })
        .catch((err) => console.error("Erro ao carregar insights diários:", err))
        .finally(() => setLoading(false));
    }
  }, [userProfile]);

  // Safe checks for user details
  const userName = userProfile?.name || "Utilizador Especial";
  const loveLang = userProfile?.loveLanguage || "Toque Físico / Tempo de Qualidade";
  const relationshipGoal = userProfile?.relationshipGoal || "Construir harmonia e diálogo duradouro";

  return (
    <div className="space-y-8 font-sans animate-cyber-scan">
      {/* Top Welcome Banner */}
      <div className="glass-cyber p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-full bg-gradient-to-l from-[#FF3B30]/15 via-[#06B6D4]/5 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <span className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest flex items-center gap-1.5">
            <span className="glow-dot-red animate-ping" />
            <Sparkles className="w-4 h-4 text-[#FF3B30]" /> Diagnóstico Holográfico Ativo
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display text-white">
            Saudações, <span className="neon-text-red">{userName}!</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed">
            O seu painel Amor IA está sintonizado com o vetor quântico: <strong className="text-white">"{relationshipGoal}"</strong>.
          </p>
        </div>
        <div className="flex gap-3 relative z-10 shrink-0">
          <div className="bg-[#121216]/80 border border-[#06B6D4]/30 rounded-2xl py-3 px-5 text-center shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <span className="block text-[9px] text-[#06B6D4] font-mono font-bold uppercase tracking-wider">Linguagem Amor</span>
            <span className="text-xs font-black text-[#06B6D4] neon-text-cyan">{loveLang}</span>
          </div>
          <div className="bg-[#121216]/80 border border-[#FF3B30]/30 rounded-2xl py-3 px-5 text-center shadow-[0_0_15px_rgba(255,59,48,0.1)]">
            <span className="block text-[9px] text-[#FF3B30] font-mono font-bold uppercase tracking-wider">Estado da Rede</span>
            <span className="text-xs font-black text-[#FF3B30] neon-text-red">ATIVO VIP</span>
          </div>
        </div>
      </div>

      {/* Main Stats and Score Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Relationship Score - Dynamic Circle */}
        <div className="glass p-6 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="glow-dot-red" />
            Pontuação Relacional (Score)
          </h3>
          
          <div className="score-circle my-2">
            <span className="text-4xl font-black font-display text-white drop-shadow-[0_0_10px_#FF3B30]">85%</span>
            <span className="text-[10px] text-[#06B6D4] font-mono font-bold uppercase tracking-widest neon-text-cyan">Excelente</span>
          </div>

          <p className="text-xs text-slate-400 px-4">
            A sua pontuação relacional subiu 5% esta semana após os treinos na Simulação Cyber-Amorosa.
          </p>
        </div>

        {/* AI Recommendations */}
        <div className="lg:col-span-2 glass-cyber p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF3B30]/20 text-[#FF3B30] shadow-[0_0_10px_rgba(255,59,48,0.3)]">
                <Sparkles className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest">Recomendação IA de Hoje</h4>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-semibold">
              {loading ? "A consultar IA..." : insightData.recommendation}
            </p>
          </div>
          <button
            onClick={() => onNavigateToModule("coach")}
            className="px-5 py-2.5 btn-neon-cyan text-xs text-white font-bold transition-all flex items-center gap-2 self-start"
          >
            <span>Consultar Coach Amante IA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Deep AI Insight block */}
      <div className="glass p-6 md:p-8 relative overflow-hidden bg-gradient-to-r from-[#121216]/50 to-[#FF3B30]/5 border border-[#FF3B30]/25">
        <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-[#FF3B30]/10 rounded-full blur-xl" />
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#FF3B30] fill-[#FF3B30] animate-bounce" /> 
            Insight Avançado de Psicologia Relacional Quântica
          </span>
          <p className="text-sm text-slate-200 font-medium italic leading-relaxed">
            "{loading ? "A analisar dados de casal..." : insightData.insight}"
          </p>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="glass p-6 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <span className="glow-dot-cyan animate-pulse" />
          Ações de Resolução Rápida (Atalhos Holográficos)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: "analyzer", title: "Analisar Conversa", desc: "Copie chats de ontem", color: "border-[#FF3B30]/30 hover:border-[#FF3B30] hover:shadow-[0_0_15px_rgba(255,59,48,0.25)] hover:text-[#FF3B30]", iconColor: "text-[#FF3B30]" },
            { id: "msg-generator", title: "Mensagem Rápida", desc: "Romântico, desculpas, etc.", color: "border-[#06B6D4]/30 hover:border-[#06B6D4] hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:text-[#06B6D4]", iconColor: "text-[#06B6D4]" },
            { id: "simulator", title: "Simular Conflito", desc: "Pratique cenários difíceis", color: "border-[#A78BFA]/30 hover:border-[#A78BFA] hover:shadow-[0_0_15px_rgba(167,139,250,0.25)] hover:text-[#A78BFA]", iconColor: "text-[#A78BFA]" },
            { id: "love-language-test", title: "Refazer Teste", desc: "O que prefere no amor?", color: "border-slate-800 hover:border-[#FF3B30] hover:shadow-[0_0_15px_rgba(255,59,48,0.15)]", iconColor: "text-slate-400" }
          ].map((act) => (
            <button
              key={act.id}
              onClick={() => onNavigateToModule(act.id)}
              className={`p-5 rounded-2xl text-left bg-[#050507]/60 border ${act.color} transition-all duration-300 active:scale-95 hover:scale-[1.03] flex flex-col justify-between min-h-[110px] group cursor-pointer`}
            >
              <div>
                <span className="text-xs font-black text-white block mb-1 group-hover:text-white transition-colors">{act.title}</span>
                <span className="text-[10px] text-slate-500 leading-relaxed block group-hover:text-slate-300 transition-colors">{act.desc}</span>
              </div>
              <div className="flex justify-end pt-2">
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
