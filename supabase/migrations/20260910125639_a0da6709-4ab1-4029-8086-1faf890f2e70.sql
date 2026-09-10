CREATE OR REPLACE FUNCTION public.join_team_conversation(_team_key TEXT, _title TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _cid UUID;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT id INTO _cid FROM public.conversations WHERE team_key = _team_key;
  IF _cid IS NULL THEN
    INSERT INTO public.conversations (type, title, team_key, created_by)
    VALUES ('team', _title, _team_key, _uid)
    RETURNING id INTO _cid;
  END IF;

  INSERT INTO public.conversation_members (conversation_id, user_id)
  VALUES (_cid, _uid)
  ON CONFLICT DO NOTHING;

  RETURN _cid;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(_other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _key TEXT;
  _cid UUID;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _other_user_id IS NULL OR _other_user_id = _uid THEN RAISE EXCEPTION 'Invalid recipient'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _other_user_id) THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;

  _key := CASE WHEN _uid < _other_user_id
    THEN _uid::text || ':' || _other_user_id::text
    ELSE _other_user_id::text || ':' || _uid::text END;

  SELECT id INTO _cid FROM public.conversations WHERE direct_key = _key;
  IF _cid IS NULL THEN
    INSERT INTO public.conversations (type, direct_key, created_by)
    VALUES ('direct', _key, _uid)
    RETURNING id INTO _cid;
  END IF;

  INSERT INTO public.conversation_members (conversation_id, user_id)
  VALUES (_cid, _uid), (_cid, _other_user_id)
  ON CONFLICT DO NOTHING;

  RETURN _cid;
END;
$$;

CREATE OR REPLACE FUNCTION public.conversation_overview()
RETURNS TABLE (
  id UUID,
  type public.conversation_type,
  title TEXT,
  team_key TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_body TEXT,
  last_message_has_image BOOLEAN,
  last_message_sender_id UUID,
  unread_count INTEGER,
  other_user_id UUID,
  other_display_name TEXT,
  other_avatar_url TEXT,
  member_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.type,
    c.title,
    c.team_key,
    c.last_message_at,
    lm.body,
    (lm.image_path IS NOT NULL) AS last_message_has_image,
    lm.sender_id,
    (
      SELECT COUNT(*)::int FROM public.messages m
      WHERE m.conversation_id = c.id
        AND m.created_at > cm.last_read_at
        AND m.sender_id <> auth.uid()
    ) AS unread_count,
    op.id AS other_user_id,
    op.display_name AS other_display_name,
    op.avatar_url AS other_avatar_url,
    (SELECT COUNT(*)::int FROM public.conversation_members x WHERE x.conversation_id = c.id) AS member_count
  FROM public.conversation_members cm
  JOIN public.conversations c ON c.id = cm.conversation_id
  LEFT JOIN LATERAL (
    SELECT m.body, m.image_path, m.sender_id
    FROM public.messages m
    WHERE m.conversation_id = c.id AND m.deleted_at IS NULL
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON TRUE
  LEFT JOIN LATERAL (
    SELECT p.id, p.display_name, p.avatar_url
    FROM public.conversation_members cm2
    JOIN public.profiles p ON p.id = cm2.user_id
    WHERE cm2.conversation_id = c.id AND cm2.user_id <> auth.uid()
    LIMIT 1
  ) op ON c.type = 'direct'
  WHERE cm.user_id = auth.uid()
  ORDER BY c.last_message_at DESC
$$;

REVOKE ALL ON FUNCTION public.join_team_conversation(TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_or_create_direct_conversation(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.conversation_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_team_conversation(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_direct_conversation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.conversation_overview() TO authenticated;