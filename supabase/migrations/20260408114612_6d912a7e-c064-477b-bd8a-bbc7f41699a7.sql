ALTER TABLE public.wedding_settings ADD COLUMN owner_token text DEFAULT NULL;

-- Create a unique constraint so each token can only have one settings row
CREATE UNIQUE INDEX wedding_settings_owner_token_unique ON public.wedding_settings (owner_token) WHERE owner_token IS NOT NULL;