
CREATE TABLE public.access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can verify tokens" ON public.access_tokens
  FOR SELECT USING (true);
