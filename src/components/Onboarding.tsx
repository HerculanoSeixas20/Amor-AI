import React, { useState } from "react";
import { UserProfile } from "../types";
import { Heart, Sparkles, User, ArrowRight, ArrowLeft, Trophy, Calendar, Smile } from "lucide-react";

interface OnboardingProps {
  userName: string;
  onOnboardingComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ userName, onOnboardingComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(userName || "");
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState("Masculino");
  const [relationshipStatus, setRelationshipStatus] = useState<UserProfile["relationshipStatus"]>("single");
  const [relationshipGoal, setRelationshipGoal] = useState("Melhorar comunicação e empatia mútua");
  const [challenges, setChallenges] = useState("Insegurança e pequenas discussões constantes");
  const [communicationStyle, setCommunicationStyle] = useState("Direto mas calmo");
  const [loveLanguage, setLoveLanguage] = useState("Palavras de Afirmação");

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onOnboardingComplete({
        name,
        age,
        gender,
        relationshipStatus,
        relationshipGoal,
        challenges,
        communicationStyle,
        loveLanguage,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div id="onboarding-container" className="min-h-screen bg-[#050507] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-10 left-10 w-[200px] h-[200px] bg-[#9E1B1B]/12 rounded-full blur-[80px]" />
      <div className="absolute bottom-10 right-10 w-[200px] h-[200px] bg-[#E11D48]/8 rounded-full blur-[80px]" />

      <div className="w-full max-w-2xl glass p-8 md:p-10 shadow-2xl relative z-10 transition-all">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx + 1 <= step ? "w-8 bg-gradient-to-r from-[#9E1B1B] to-[#E11D48]" : "w-2 bg-slate-900"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-slate-500">Passo {step} de {totalSteps}</span>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#FF3B30] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Diagnóstico Inicial Premium
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-white">Conte-nos sobre si</h2>
              <p className="text-sm text-slate-400">
                A Amor IA precisa destes dados básicos para calibrar o tom e personalizar os algoritmos de relacionamento para si.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Qual é o seu nome?</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome ou alcunha"
                    className="w-full bg-[#050507] border border-slate-900 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-[#9E1B1B] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Sua Idade</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                  min={18}
                  max={100}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#9E1B1B] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Gênero</label>
              <div className="grid grid-cols-3 gap-3">
                {["Feminino", "Masculino", "Não-binário / Outro"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-medium transition-all border ${
                      gender === g
                        ? "bg-[#9E1B1B]/20 border-[#9E1B1B] text-white shadow-md shadow-[#9E1B1B]/10"
                        : "bg-[#050507] border-slate-900 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#FF3B30] flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#E11D48] fill-[#E11D48]" /> Situação Afetiva
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-white">Qual é o seu estado civil atual?</h2>
              <p className="text-sm text-slate-400">
                Isso muda as ferramentas visíveis no seu painel. Solteiros ganham foco em sedução e flerte; comprometidos em conexão e diálogo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { id: "single", label: "Solteiro(a)", desc: "Estou focado em flerte, autoestima ou procurar um amor." },
                { id: "dating", label: "Num relacionamento", desc: "Namoro, união de facto ou compromisso recente." },
                { id: "married", label: "Casado(a)", desc: "Vida de casado, rotina partilhada e planos de longo prazo." },
                { id: "divorced", label: "Divorciado(a) / Separado(a)", desc: "Passar por uma transição ou a reestruturar a vida." },
                { id: "looking_for_love", label: "À procura de amor", desc: "Pronto(a) para encontros e focado(a) em conexão real." }
              ].map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => setRelationshipStatus(status.id as UserProfile["relationshipStatus"])}
                  className={`p-4 rounded-2xl text-left transition-all border flex flex-col gap-1 ${
                    relationshipStatus === status.id
                      ? "bg-[#9E1B1B]/15 border-[#9E1B1B] text-white shadow-lg shadow-[#9E1B1B]/5"
                      : "bg-[#050507] border-slate-900 text-slate-400 hover:border-slate-800"
                  }`}
                >
                  <span className={`text-sm font-semibold ${relationshipStatus === status.id ? "text-[#FF3B30]" : "text-white"}`}>
                    {status.label}
                  </span>
                  <span className="text-xs text-slate-400 leading-relaxed">{status.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#FF3B30] flex items-center gap-1.5">
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-white">Objetivos e Desafios</h2>
              <p className="text-sm text-slate-400">
                Seja totalmente honesto(a). O nosso conselheiro de IA é seguro, confidencial e não o julgará.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Qual é o seu principal objetivo amoroso atualmente?</label>
                <textarea
                  value={relationshipGoal}
                  onChange={(e) => setRelationshipGoal(e.target.value)}
                  placeholder="Ex: Quero comunicar melhor sem explodir, ou reconquistar o meu ex com maturidade, ou ter mais romance."
                  rows={2}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#9E1B1B] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Quais os maiores desafios que enfrenta hoje no seu relacionamento?</label>
                <textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Ex: Falta de tempo de qualidade, discussões idiotas sobre ciúmes, falta de intimidade ou comunicação bloqueada."
                  rows={2}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#9E1B1B] transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#E11D48] flex items-center gap-1.5">
                <Smile className="w-4 h-4" /> Linguagem do Coração
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-white">Estilo de Comunicação & Amor</h2>
              <p className="text-sm text-slate-400">
                Escolha a sua Linguagem do Amor predominante. Se não tiver certeza, pode alterá-la mais tarde ou fazer o teste completo na aplicação.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">A sua Linguagem do Amor principal</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { name: "Palavras de Afirmação", desc: "Elogios, agradecimentos e apoio verbal." },
                    { name: "Tempo de Qualidade", desc: "Atenção indivisível, passeios, conversas profundas." },
                    { name: "Atos de Serviço", desc: "Ações práticas que facilitam a vida do outro." },
                    { name: "Presentes", desc: "Gestos visuais e físicos de lembrança carinhosa." },
                    { name: "Toque Físico", desc: "Abraços, mãos dadas, massagens e intimidade física." }
                  ].map((lang) => (
                    <button
                      key={lang.name}
                      type="button"
                      onClick={() => setLoveLanguage(lang.name)}
                      className={`p-3 rounded-xl text-left transition-all border ${
                        loveLanguage === lang.name
                          ? "bg-[#9E1B1B]/15 border-[#9E1B1B] text-white"
                          : "bg-[#050507] border-slate-900 text-slate-400 hover:border-slate-800"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{lang.name}</span>
                      <span className="text-[10px] text-slate-400">{lang.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Como descreve o seu estilo de comunicação?</label>
                <select
                  value={communicationStyle}
                  onChange={(e) => setCommunicationStyle(e.target.value)}
                  className="w-full bg-[#050507] border border-slate-900 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#9E1B1B] transition-all"
                >
                  <option value="Muito Direto e Lógico">Muito Direto e Lógico (focado em soluções rápidas)</option>
                  <option value="Empático e Sensível">Empático e Sensível (focado nos sentimentos e harmonia)</option>
                  <option value="Reservado / Calado">Reservado / Calado (evita confrontos, precisa de tempo para pensar)</option>
                  <option value="Expressivo / Emocional">Expressivo / Emocional (fala tudo na hora com muita energia)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-slate-900 mt-8 pt-6">
          <button
            type="button"
            onClick={handleBack}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white transition-all ${
              step === 1 ? "opacity-30 cursor-not-allowed" : ""
            }`}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-[#9E1B1B] to-[#FF3B30] hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <span>{step === totalSteps ? "Concluir Diagnóstico" : "Seguinte"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
