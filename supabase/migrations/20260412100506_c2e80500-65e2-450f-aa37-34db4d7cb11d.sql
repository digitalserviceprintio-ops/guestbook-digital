
-- Add max_guests column to access_tokens
ALTER TABLE public.access_tokens
ADD COLUMN max_guests integer DEFAULT NULL;

-- Insert demo token
INSERT INTO public.access_tokens (token, label, role, max_guests, expires_at, is_active)
VALUES ('DEMO2026', 'Demo', 'operator', 20, NULL, true);
