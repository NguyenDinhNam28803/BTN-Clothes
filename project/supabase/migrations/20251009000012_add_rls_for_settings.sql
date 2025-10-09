CREATE POLICY "Allow public read access to settings"
ON public.settings
FOR SELECT
USING (true);
