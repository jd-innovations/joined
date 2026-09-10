import { supabase } from "../integrations/supabase/client";

export interface ConversationOverview {
  id: string;
  type: "team" | "direct";
  title: string | null;
  team_key: string | null;
  last_message_at: string;
  last_message_body: string | null;
  last_message_has_image: boolean | null;
  last_message_sender_id: string | null;
  unread_count: number;
  other_user_id: string | null;
  other_display_name: string | null;
  other_avatar_url: string | null;
  member_count: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  image_path: string | null;
  image_width: number | null;
  image_height: number | null;
  reply_to_id: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

export interface Person {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export const REACTION_EMOJI = ["❤️", "👍", "👎", "😂", "‼️", "❓"] as const;

export async function fetchConversations(): Promise<ConversationOverview[]> {
  const { data, error } = await supabase.rpc("conversation_overview");
  if (error) throw error;
  return (data ?? []) as ConversationOverview[];
}

export async function joinTeamConversation(
  teamKey: string,
  title: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("join_team_conversation", {
    _team_key: teamKey,
    _title: title,
  });
  if (error) throw error;
  return data as string;
}

export async function startDirectConversation(
  otherUserId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("get_or_create_direct_conversation", {
    _other_user_id: otherUserId,
  });
  if (error) throw error;
  return data as string;
}

export async function fetchConversation(id: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, type, title, team_key")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, conversation_id, sender_id, body, image_path, image_width, image_height, reply_to_id, deleted_at, created_at",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function fetchReactions(conversationId: string): Promise<Reaction[]> {
  const { data, error } = await supabase
    .from("message_reactions")
    .select("id, message_id, user_id, emoji")
    .eq("conversation_id", conversationId);
  if (error) throw error;
  return (data ?? []) as Reaction[];
}

export async function fetchMembers(conversationId: string): Promise<Person[]> {
  const { data: memberRows, error: memberError } = await supabase
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", conversationId);
  if (memberError) throw memberError;
  const ids = (memberRows ?? []).map((r) => r.user_id);
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", ids);
  if (error) throw error;
  return (data ?? []) as Person[];
}

export async function fetchPeople(excludeUserId: string): Promise<Person[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .neq("id", excludeUserId)
    .order("display_name", { ascending: true })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as Person[];
}

export async function sendMessage(input: {
  conversationId: string;
  senderId: string;
  body?: string | null;
  replyToId?: string | null;
  image?: { blob: Blob; width: number; height: number } | null;
}): Promise<void> {
  let imagePath: string | null = null;

  if (input.image) {
    const path = `${input.conversationId}/${input.senderId}/${crypto.randomUUID()}.jpg`;
    const { error: upErr } = await supabase.storage
      .from("chat-images")
      .upload(path, input.image.blob, {
        contentType: input.image.blob.type || "image/jpeg",
        upsert: false,
      });
    if (upErr) throw upErr;
    imagePath = path;
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: input.conversationId,
    sender_id: input.senderId,
    body: input.body?.trim() ? input.body.trim() : null,
    image_path: imagePath,
    image_width: input.image?.width ?? null,
    image_height: input.image?.height ?? null,
    reply_to_id: input.replyToId ?? null,
  });
  if (error) throw error;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ deleted_at: new Date().toISOString(), body: null, image_path: null })
    .eq("id", messageId);
  if (error) throw error;
}

export async function toggleReaction(input: {
  messageId: string;
  conversationId: string;
  userId: string;
  emoji: string;
  existingId?: string | null;
}): Promise<void> {
  if (input.existingId) {
    const { error } = await supabase
      .from("message_reactions")
      .delete()
      .eq("id", input.existingId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("message_reactions").insert({
    message_id: input.messageId,
    conversation_id: input.conversationId,
    user_id: input.userId,
    emoji: input.emoji,
  });
  if (error) throw error;
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
}

export async function signedImageUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from("chat-images")
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

/** Deterministic UTC clock, matching the rest of the app. */
export function chatTime(iso: string): string {
  const d = new Date(iso);
  const h24 = d.getUTCHours();
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(d.getUTCMinutes()).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayKey(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

export function chatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 86_400_000));
  const key = dayKey(d);
  if (key === today) return "Today";
  if (key === yesterday) return "Yesterday";
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
