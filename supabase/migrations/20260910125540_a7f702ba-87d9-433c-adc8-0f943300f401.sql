CREATE POLICY "chat_images_select_member" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-images'
  AND public.is_conversation_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

CREATE POLICY "chat_images_insert_member" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-images'
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND public.is_conversation_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

CREATE POLICY "chat_images_delete_own" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-images'
  AND (storage.foldername(name))[2] = auth.uid()::text
);