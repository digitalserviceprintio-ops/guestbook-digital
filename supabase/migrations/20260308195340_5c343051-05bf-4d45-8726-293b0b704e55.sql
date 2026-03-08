CREATE TABLE public.app_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  changelog jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_maintenance boolean NOT NULL DEFAULT false,
  maintenance_message text DEFAULT '',
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view app_versions" ON public.app_versions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert app_versions" ON public.app_versions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update app_versions" ON public.app_versions FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.app_versions;