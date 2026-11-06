-- =========================================================================
-- ESQUEMA SQL OFICIAL E POLÍTICAS RLS DO SUPABASE PARA O AMOR IA
-- Pode ser executado diretamente no SQL Editor do Dashboard do Supabase
-- =========================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Utilizador (user_profiles)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'Free',
  is_trial_active BOOLEAN DEFAULT true,
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '3 days'),
  avatar TEXT,
  provider TEXT DEFAULT 'Email',
  country TEXT DEFAULT 'Angola',
  language TEXT DEFAULT 'Português',
  currency TEXT DEFAULT 'AOA',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS) na tabela user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles (Cada utilizador só acede ao seu próprio perfil; Admin tem acesso pleno)
DROP POLICY IF EXISTS "Os utilizadores podem ler o seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Os utilizadores podem ler o seu próprio perfil"
ON public.user_profiles FOR SELECT
USING (
  auth.uid() = id 
  OR auth.jwt() ->> 'email' = 'chillplaces9@gmail.com'
);

DROP POLICY IF EXISTS "Os utilizadores podem criar o seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Os utilizadores podem criar o seu próprio perfil"
ON public.user_profiles FOR INSERT
WITH CHECK (
  auth.uid() = id 
  OR auth.jwt() ->> 'email' = 'chillplaces9@gmail.com'
);

DROP POLICY IF EXISTS "Os utilizadores podem atualizar o seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Os utilizadores podem atualizar o seu próprio perfil"
ON public.user_profiles FOR UPDATE
USING (
  auth.uid() = id 
  OR auth.jwt() ->> 'email' = 'chillplaces9@gmail.com'
);

DROP POLICY IF EXISTS "Os utilizadores podem eliminar o seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Os utilizadores podem eliminar o seu próprio perfil"
ON public.user_profiles FOR DELETE
USING (
  auth.uid() = id 
  OR auth.jwt() ->> 'email' = 'chillplaces9@gmail.com'
);

-- 3. Tabela de Diário Emocional (relationship_journal)
CREATE TABLE IF NOT EXISTS public.relationship_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  date TEXT NOT NULL,
  mood TEXT NOT NULL,
  notes TEXT,
  score INTEGER DEFAULT 75,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.relationship_journal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso pessoal ao diário" ON public.relationship_journal;
CREATE POLICY "Acesso pessoal ao diário"
ON public.relationship_journal FOR ALL
USING (
  auth.uid() = user_id 
  OR auth.jwt() ->> 'email' = 'chillplaces9@gmail.com'
);

-- 4. Tabela de Metas do Relacionamento (relationship_goals)
CREATE TABLE IF NOT EXISTS public.relationship_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  target_date TEXT,
  progress INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.relationship_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso pessoal às metas" ON public.relationship_goals;
CREATE POLICY "Acesso pessoal às metas"
ON public.relationship_goals FOR ALL
USING (
  auth.uid() = user_id 
  OR auth.jwt() ->> 'email' = 'chillplaces9@gmail.com'
);

-- 5. Tabela de Calendário Afetivo (relationship_calendar)
CREATE TABLE IF NOT EXISTS public.relationship_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.relationship_calendar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso pessoal ao calendário" ON public.relationship_calendar;
CREATE POLICY "Acesso pessoal ao calendário"
ON public.relationship_calendar FOR ALL
USING (
  auth.uid() = user_id 
  OR auth.jwt() ->> 'email' = 'chillplaces9@gmail.com'
);

-- 6. Trigger Automático para criar perfil em public.user_profiles quando novo utilizador é registado no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, user_email, name, plan, is_trial_active, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'chillplaces9@gmail.com' THEN 'Premium' ELSE 'Free' END,
    true,
    now() + interval '3 days'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
