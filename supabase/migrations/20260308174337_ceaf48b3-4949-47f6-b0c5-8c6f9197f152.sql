CREATE TABLE public.wedding_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  groom_name text NOT NULL DEFAULT 'Ahmad',
  bride_name text NOT NULL DEFAULT 'Siti',
  event_date text NOT NULL DEFAULT '2026-06-15',
  akad_time text NOT NULL DEFAULT '08:00',
  resepsi_time text NOT NULL DEFAULT '10:00',
  end_time text NOT NULL DEFAULT '14:00',
  venue_name text NOT NULL DEFAULT 'Gedung Serbaguna Mawar',
  venue_address text NOT NULL DEFAULT 'Jl. Mawar No. 123, Jakarta Selatan',
  invitation_text text NOT NULL DEFAULT 'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.',
  closing_text text NOT NULL DEFAULT 'Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir.',
  hero_image_url text DEFAULT '',
  rsvp_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wedding_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.wedding_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update settings" ON public.wedding_settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert settings" ON public.wedding_settings FOR INSERT WITH CHECK (true);

INSERT INTO public.wedding_settings (id) VALUES (gen_random_uuid());

CREATE TRIGGER update_wedding_settings_updated_at
  BEFORE UPDATE ON public.wedding_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();