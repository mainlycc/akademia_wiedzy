-- Tabela tutorów (może zawierać tutorów bez konta Auth)
CREATE TABLE IF NOT EXISTS public.tutors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  email         text,
  phone         text,
  rate          numeric(12,2),
  bio           text,
  active        boolean NOT NULL DEFAULT true,
  -- Opcjonalne powiązanie z profilem (dla tutorów z kontem)
  profile_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_tutors_active ON public.tutors (active);
CREATE INDEX IF NOT EXISTS idx_tutors_last_first ON public.tutors (last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_tutors_profile_id ON public.tutors (profile_id);

-- Włączenie RLS
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

-- Polityki RLS dla tutorów
-- Admin ma pełny dostęp
DROP POLICY IF EXISTS admin_all_tutors ON public.tutors;
CREATE POLICY admin_all_tutors
  ON public.tutors
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Tutor może czytać wszystkich tutorów (do wyboru przy przypisywaniu)
DROP POLICY IF EXISTS tutor_read_tutors ON public.tutors;
CREATE POLICY tutor_read_tutors
  ON public.tutors
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'tutor')
  );

-- Tutor może edytować tylko swój rekord (jeśli ma profile_id)
DROP POLICY IF EXISTS tutor_update_own_tutor ON public.tutors;
CREATE POLICY tutor_update_own_tutor
  ON public.tutors
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'tutor'
    )
    AND profile_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'tutor'
    )
    AND profile_id = auth.uid()
  );
