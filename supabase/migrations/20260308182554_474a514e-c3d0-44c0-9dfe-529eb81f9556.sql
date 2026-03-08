
CREATE POLICY "Anyone can update token last_used" ON public.access_tokens
  FOR UPDATE USING (true) WITH CHECK (true);
