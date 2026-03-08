-- Create guests table
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  number_of_guests INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'belum_konfirmasi' CHECK (status IN ('hadir', 'tidak_hadir', 'belum_konfirmasi')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Public read/write access (no auth for guest book)
CREATE POLICY "Anyone can view guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert guests" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update guests" ON public.guests FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete guests" ON public.guests FOR DELETE USING (true);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON public.guests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();