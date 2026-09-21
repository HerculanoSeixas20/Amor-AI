import { createClient, SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Cliente do Supabase para o Frontend do Amor IA.
 * Suporta variáveis tanto com prefixo VITE_ como NEXT_PUBLIC_ (padrão Vercel).
 */

const metaEnv = typeof import.meta !== "undefined" ? (import.meta as any).env : {};

const supabaseUrl = 
  (metaEnv?.VITE_SUPABASE_URL || metaEnv?.NEXT_PUBLIC_SUPABASE_URL) || "";

const supabaseAnonKey = 
  (metaEnv?.VITE_SUPABASE_ANON_KEY || metaEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || "";

let clientInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.includes("supabase.co"));
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce"
      }
    });
  }
  return clientInstance;
}

/**
 * Inicia o fluxo de autenticação Google via Supabase OAuth.
 * Redireciona o utilizador para o ecrã de consentimento Google com callback para /auth/callback.
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
 * Processa o callback de autenticação do Supabase após redirecionamento do Google OAuth.
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
    // Obter a sessão atual (o Supabase detecta automaticamente os tokens no hash ou query da URL)
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
      "Utilizador Google";
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
