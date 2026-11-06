import { createClient, SupabaseClient, User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js";

/**
 * Cliente e Gestor de Autenticação Supabase para o Amor IA.
 * 
 * Suporta:
 * - Variáveis de ambiente: VITE_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_URL
 * - Variáveis de chave: VITE_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_ANON_KEY
 * - Descoberta dinâmica em tempo de execução via /api/auth/config (caso o deploy não tenha injetado no build)
 * - signUp(), signInWithPassword(), signOut(), getSession(), onAuthStateChange()
 * - Criação de perfis e ativação de 3 dias de teste gratuito
 * - Tratamento rigoroso de e-mail não confirmado, credenciais inválidas e conflitos
 */

const metaEnv = typeof import.meta !== "undefined" ? (import.meta as any).env : {};
const procEnv = typeof process !== "undefined" ? (process as any).env : {};

let dynamicSupabaseUrl = 
  (metaEnv?.VITE_SUPABASE_URL || metaEnv?.NEXT_PUBLIC_SUPABASE_URL || metaEnv?.SUPABASE_URL || procEnv?.VITE_SUPABASE_URL || procEnv?.SUPABASE_URL) || "";

let dynamicSupabaseAnonKey = 
  (metaEnv?.VITE_SUPABASE_ANON_KEY || metaEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY || metaEnv?.SUPABASE_ANON_KEY || procEnv?.VITE_SUPABASE_ANON_KEY || procEnv?.SUPABASE_ANON_KEY) || "";

let clientInstance: SupabaseClient | null = null;
let configFetchPromise: Promise<boolean> | null = null;

/**
 * Verifica se o Supabase possui credenciais válidas configuradas
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    dynamicSupabaseUrl && 
    dynamicSupabaseAnonKey && 
    dynamicSupabaseUrl.startsWith("http") &&
    dynamicSupabaseUrl.includes("supabase.co")
  );
}

/**
 * Retorna ou inicializa o cliente Supabase singleton
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient(dynamicSupabaseUrl, dynamicSupabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
          storage: typeof window !== "undefined" ? window.localStorage : undefined
        }
      });
    } catch (err) {
      console.error("[Supabase Client Init Error]:", err);
      return null;
    }
  }
  return clientInstance;
}

/**
 * Tenta buscar configurações públicas do Supabase a partir do servidor em tempo de execução
 */
export async function syncRuntimeSupabaseConfig(): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return true;
  }
  if (configFetchPromise) {
    return configFetchPromise;
  }

  configFetchPromise = (async () => {
    try {
      const res = await fetch("/api/auth/config", {
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.supabase?.configured && data.supabase.url && data.supabase.anonKey) {
          dynamicSupabaseUrl = data.supabase.url;
          dynamicSupabaseAnonKey = data.supabase.anonKey;
          clientInstance = null; // Forçar recriação com as novas credenciais
          return isSupabaseConfigured();
        }
      }
    } catch (e) {
      // Ignorar falhas silenciosamente
    }
    return false;
  })();

  return configFetchPromise;
}

export interface SupabaseAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    plan: "Free" | "Premium";
    isTrialActive?: boolean;
    trialDaysRemaining?: number;
    trialEndsAt?: string;
  };
  session?: SupabaseSession | null;
  emailConfirmationRequired?: boolean;
  code?: string;
  message?: string;
  error?: string;
}

/**
 * Registo de Novo Utilizador via Supabase Auth (supabase.auth.signUp)
 * - Salva nome completo nos metadados
 * - Cria perfil na base de dados (se tabela existir)
 * - Ativa 3 dias de teste gratuito
 * - Trata confirmação de e-mail e erros amigáveis em Português
 */
export async function signUpWithSupabase(params: {
  email: string;
  password: string;
  fullName: string;
}): Promise<SupabaseAuthResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      code: "NOT_CONFIGURED",
      message: "Supabase não configurado no cliente."
    };
  }

  const cleanEmail = params.email.toLowerCase().trim();
  const cleanPassword = params.password.trim();
  const cleanName = params.fullName.trim();

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          full_name: cleanName,
          name: cleanName,
          registered_at: new Date().toISOString()
        }
      }
    });

    if (error) {
      console.warn("[Supabase signUp error]:", error);
      const msg = error.message.toLowerCase();

      if (msg.includes("already registered") || msg.includes("already exists") || error.status === 422) {
        return {
          success: false,
          code: "ACCOUNT_EXISTS",
          message: "Este e-mail já possui uma conta registada. Por favor, introduza a sua palavra-passe na aba 'Iniciar Sessão'."
        };
      }
      if (msg.includes("password should be at least") || msg.includes("weak password")) {
        return {
          success: false,
          code: "WEAK_PASSWORD",
          message: "A palavra-passe deve conter pelo menos 6 caracteres seguros."
        };
      }
      if (msg.includes("rate limit") || error.status === 429) {
        return {
          success: false,
          code: "RATE_LIMITED",
          message: "Demasiadas tentativas num curto período de tempo. Por favor, aguarde alguns minutos antes de tentar novamente."
        };
      }
      return {
        success: false,
        code: "SIGNUP_ERROR",
        message: error.message || "Não foi possível concluir o registo no Supabase."
      };
    }

    if (!data.user) {
      return {
        success: false,
        code: "NO_USER",
        message: "Não foi possível criar a conta. Tente novamente."
      };
    }

    // Calcular período de 3 dias de teste gratuito (72h)
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Tentar salvar/atualizar o perfil do utilizador na tabela do Supabase (user_profiles ou profiles)
    try {
      await supabase
        .from("user_profiles")
        .upsert({
          id: data.user.id,
          user_email: cleanEmail,
          name: cleanName,
          plan: "Free",
          trial_ends_at: trialEndsAt,
          updated_at: now.toISOString(),
          created_at: now.toISOString()
        }, { onConflict: "user_email" });
    } catch (profileErr) {
      console.warn("[Supabase profile upsert warning - tabela pode não existir ou RLS estrito]:", profileErr);
    }

    // 2. Verificar se o Supabase exige confirmação de e-mail (quando data.session é nulo mas user foi criado)
    const confirmationRequired = !data.session;

    if (confirmationRequired) {
      return {
        success: true,
        user: {
          id: data.user.id,
          email: cleanEmail,
          name: cleanName,
          plan: "Free",
          isTrialActive: true,
          trialDaysRemaining: 3,
          trialEndsAt
        },
        session: null,
        emailConfirmationRequired: true,
        message: "Conta criada com sucesso! Enviámos um e-mail de confirmação. Por favor, confirme o seu e-mail antes de aceder."
      };
    }

    // 3. Registo com sessão ativa imediata
    return {
      success: true,
      user: {
        id: data.user.id,
        email: cleanEmail,
        name: cleanName,
        plan: "Free",
        isTrialActive: true,
        trialDaysRemaining: 3,
        trialEndsAt
      },
      session: data.session,
      emailConfirmationRequired: false,
      message: "Conta criada com sucesso! 3 dias de teste gratuito ativados."
    };
  } catch (err: any) {
    console.error("[Supabase signUp exception]:", err);
    return {
      success: false,
      code: "EXCEPTION",
      message: err.message || "Erro inesperado ao contactar o serviço de registo."
    };
  }
}

/**
 * Iniciar Sessão via Supabase Auth (supabase.auth.signInWithPassword)
 * - Valida credenciais com o Supabase Auth
 * - Trata e-mail não confirmado
 * - Trata credenciais incorretas
 * - Mantém e retorna a sessão ativa
 */
export async function signInWithSupabase(params: {
  email: string;
  password: string;
}): Promise<SupabaseAuthResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      code: "NOT_CONFIGURED",
      message: "Supabase não configurado no cliente."
    };
  }

  const cleanEmail = params.email.toLowerCase().trim();
  const cleanPassword = params.password.trim();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword
    });

    if (error) {
      console.warn("[Supabase signIn error]:", error);
      const msg = error.message.toLowerCase();

      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        return {
          success: false,
          code: "EMAIL_NOT_CONFIRMED",
          message: "O seu e-mail ainda não foi confirmado. Por favor, verifique a sua caixa de entrada (ou pasta de spam) para ativar a sua conta."
        };
      }
      if (msg.includes("invalid login credentials") || msg.includes("invalid_grant") || error.status === 400) {
        return {
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Palavra-passe ou e-mail incorretos. Por favor, verifique os seus dados."
        };
      }
      if (msg.includes("rate limit") || error.status === 429) {
        return {
          success: false,
          code: "RATE_LIMITED",
          message: "Demasiadas tentativas consecutivas de acesso. Por favor, aguarde alguns minutos antes de tentar novamente."
        };
      }
      return {
        success: false,
        code: "AUTH_ERROR",
        message: error.message || "Erro ao autenticar com o Supabase."
      };
    }

    if (!data.user || !data.session) {
      return {
        success: false,
        code: "NO_SESSION",
        message: "Não foi possível inicializar a sessão do utilizador."
      };
    }

    const sbUser = data.user;
    const name = 
      sbUser.user_metadata?.full_name || 
      sbUser.user_metadata?.name || 
      cleanEmail.split("@")[0] || 
      "Utilizador";

    return {
      success: true,
      user: {
        id: sbUser.id,
        email: cleanEmail,
        name,
        plan: cleanEmail === "chillplaces9@gmail.com" ? "Premium" : "Free"
      },
      session: data.session,
      message: "Sessão iniciada com sucesso!"
    };
  } catch (err: any) {
    console.error("[Supabase signIn exception]:", err);
    return {
      success: false,
      code: "EXCEPTION",
      message: err.message || "Erro ao contactar o serviço de autenticação."
    };
  }
}

/**
 * Obtém a sessão ativa atual do Supabase
 */
export async function getSupabaseSession(): Promise<{
  session: SupabaseSession | null;
  user: SupabaseUser | null;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { session: null, user: null };
  }
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return { session: null, user: null };
    }
    return {
      session: data.session,
      user: data.session.user
    };
  } catch (err) {
    console.warn("[Supabase getSession warning]:", err);
    return { session: null, user: null };
  }
}

/**
 * Regista um listener para mudanças de estado de autenticação (onAuthStateChange)
 */
export function onSupabaseAuthStateChange(
  callback: (event: string, session: SupabaseSession | null) => void
): { unsubscribe: () => void } {
  const supabase = getSupabase();
  if (!supabase) {
    return { unsubscribe: () => {} };
  }
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return {
    unsubscribe: () => {
      subscription.unsubscribe();
    }
  };
}

/**
 * Termina a sessão no Supabase Auth
 */
export async function signOutSupabase(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Aviso ao terminar sessão no Supabase:", e);
    }
  }
}

/**
 * Inicia o fluxo de autenticação Google via Supabase OAuth (se desejado futuramente)
 */
export async function signInWithGoogleSupabase(redirectTo?: string): Promise<{ error: any }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: new Error("Supabase não está configurado nas variáveis de ambiente.") };
  }

  const targetRedirect = redirectTo || `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: targetRedirect,
      queryParams: {
        access_type: "offline",
        prompt: "select_account"
      }
    }
  });

  return { error };
}

/**
 * Processa o callback de autenticação do Supabase após redirecionamento
 */
export async function handleAuthCallback(): Promise<{
  user: {
    email: string;
    name: string;
    avatar: string;
    uid: string;
  } | null;
  error: any;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { user: null, error: new Error("Supabase não configurado.") };
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { user: null, error };
    }
    if (!data.session || !data.session.user) {
      return { user: null, error: new Error("Nenhuma sessão encontrada no callback de autenticação.") };
    }

    const sbUser: SupabaseUser = data.session.user;
    const email = (sbUser.email || "").toLowerCase().trim();
    const name = 
      sbUser.user_metadata?.full_name || 
      sbUser.user_metadata?.name || 
      email.split("@")[0] || 
      "Utilizador";
    const avatar = 
      sbUser.user_metadata?.avatar_url || 
      sbUser.user_metadata?.picture || 
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

    return {
      user: {
        email,
        name,
        avatar,
        uid: sbUser.id
      },
      error: null
    };
  } catch (err: any) {
    return { user: null, error: err };
  }
}
