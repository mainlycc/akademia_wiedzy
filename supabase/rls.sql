-- 4.1 Włącz RLS
ALTER TABLE public.parents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments      ENABLE ROW LEVEL SECURITY;

-- 4.2 Helper: warunek "czy użytkownik jest adminem"
-- (nie tworzymy funkcji; używamy inline EXISTS w politykach)

-- ===== POLITYKI: ADMIN (pełny dostęp) =====
-- parents
DROP POLICY IF EXISTS admin_all_parents ON public.parents;
CREATE POLICY admin_all_parents
  ON public.parents
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- students
DROP POLICY IF EXISTS admin_all_students ON public.students;
CREATE POLICY admin_all_students
  ON public.students
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- student_parents
DROP POLICY IF EXISTS admin_all_student_parents ON public.student_parents;
CREATE POLICY admin_all_student_parents
  ON public.student_parents
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- subjects
DROP POLICY IF EXISTS admin_all_subjects ON public.subjects;
CREATE POLICY admin_all_subjects
  ON public.subjects
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- enrollments
DROP POLICY IF EXISTS admin_all_enrollments ON public.enrollments;
CREATE POLICY admin_all_enrollments
  ON public.enrollments
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===== POLITYKI: TUTOR (odczyt) =====
-- Tutor może czytać listę uczniów (MVP; później zawęzisz do „swoich”)
DROP POLICY IF EXISTS tutor_read_students ON public.students;
CREATE POLICY tutor_read_students
  ON public.students
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'tutor')
  );

-- Tutor może czytać przedmioty
DROP POLICY IF EXISTS tutor_read_subjects ON public.subjects;
CREATE POLICY tutor_read_subjects
  ON public.subjects
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'tutor')
  );

-- Tutor może czytać tylko te zapisy, gdzie jest przypisany jako tutor_id
DROP POLICY IF EXISTS tutor_read_own_enrollments ON public.enrollments;
CREATE POLICY tutor_read_own_enrollments
  ON public.enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'tutor'
    )
    AND (
      tutor_id IN (
        SELECT t.id FROM public.tutors t 
        WHERE t.profile_id = auth.uid()
      )
    )
  );

-- (Opcjonalnie) Tutor może widzieć powiązania student_parents tylko dla swoich uczniów
-- Na MVP można pominąć – dane rodziców są wrażliwe.
