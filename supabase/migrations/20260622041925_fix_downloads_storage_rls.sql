-- Allow public to read from downloads bucket
CREATE POLICY "Public can read downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'downloads');

-- Allow authenticated users to upload to downloads bucket
CREATE POLICY "Authenticated users can upload downloads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'downloads');

-- Allow authenticated users to update files in downloads bucket
CREATE POLICY "Authenticated users can update downloads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'downloads')
WITH CHECK (bucket_id = 'downloads');

-- Allow authenticated users to delete from downloads bucket
CREATE POLICY "Authenticated users can delete downloads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'downloads');