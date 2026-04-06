ALTER TABLE public.guests ADD COLUMN owner_token text DEFAULT NULL;

CREATE INDEX idx_guests_owner_token ON public.guests(owner_token);