-- Typy słownikowe (proste i wystarczające na MVP)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kinship') THEN
    CREATE TYPE public.kinship AS ENUM ('mother','father','guardian','other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
    CREATE TYPE public.enrollment_status AS ENUM ('active','paused','ended');
  END IF;
END$$;
