-- Uwaga: w Supabase jest dostępne gen_random_uuid() (pgcrypto)

-- 2.1 Rodzice (kontakt – w MVP mogą nie mieć konta w auth)
CREATE TABLE IF NOT EXISTS public.parents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  email         text,
  phone         text,
  notes         text,
  gdpr_accept_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Przydatne indeksy
CREATE INDEX IF NOT EXISTS idx_parents_email ON public.parents (email);
CREATE INDEX IF NOT EXISTS idx_parents_last_first ON public.parents (last_name, first_name);


-- 2.2 Uczniowie
CREATE TABLE IF NOT EXISTS public.students (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  notes       text,
  created_by  uuid REFERENCES public.profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_active ON public.students (active);
CREATE INDEX IF NOT EXISTS idx_students_last_first ON public.students (last_name, first_name);


-- 2.3 Powiązanie Uczeń ↔ Rodzic (wielu-do-wielu)
CREATE TABLE IF NOT EXISTS public.student_parents (
  student_id  uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  parent_id   uuid NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  relation    public.kinship NOT NULL DEFAULT 'guardian',
  is_primary  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, parent_id)
);


-- 2.4 Przedmioty
CREATE TABLE IF NOT EXISTS public.subjects (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name      text NOT NULL UNIQUE,
  active    boolean NOT NULL DEFAULT true,
  color     text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subjects_active ON public.subjects (active);


-- 2.5 Zapisy ucznia na przedmiot (+ opcjonalnie przypisany tutor)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id  uuid NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  tutor_id    uuid REFERENCES public.tutors(id), -- gdy chcesz od razu przypiąć tutora
  rate        numeric(12,2),                       -- stawka jednostkowa (opcjonalnie)
  status      public.enrollment_status NOT NULL DEFAULT 'active',
  start_date  date NOT NULL DEFAULT CURRENT_DATE,
  end_date    date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Ułatwiające życie indeksy
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments (student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_subject ON public.enrollments (subject_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_tutor ON public.enrollments (tutor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments (status);
