-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view guests" ON public.guests;
DROP POLICY IF EXISTS "Anyone can insert guests" ON public.guests;
DROP POLICY IF EXISTS "Anyone can update guests" ON public.guests;
DROP POLICY IF EXISTS "Anyone can delete guests" ON public.guests;

-- Recreate as explicitly PERMISSIVE policies
CREATE POLICY "Anyone can view guests" ON public.guests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert guests" ON public.guests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update guests" ON public.guests FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete guests" ON public.guests FOR DELETE TO anon, authenticated USING (true);