ALTER TABLE public.guests ADD COLUMN category TEXT NOT NULL DEFAULT 'pengantin' CHECK (category IN ('pengantin', 'orang_tua'));
ALTER TABLE public.guests DROP COLUMN phone;