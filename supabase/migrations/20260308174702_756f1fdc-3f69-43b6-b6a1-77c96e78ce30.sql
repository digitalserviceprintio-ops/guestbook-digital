INSERT INTO storage.buckets (id, name, public) VALUES ('wedding-photos', 'wedding-photos', true);

CREATE POLICY "Anyone can upload wedding photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'wedding-photos');
CREATE POLICY "Anyone can view wedding photos" ON storage.objects FOR SELECT USING (bucket_id = 'wedding-photos');
CREATE POLICY "Anyone can update wedding photos" ON storage.objects FOR UPDATE USING (bucket_id = 'wedding-photos');
CREATE POLICY "Anyone can delete wedding photos" ON storage.objects FOR DELETE USING (bucket_id = 'wedding-photos');