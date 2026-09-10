# Messaging for Sideline

Add real, iMessage-style chat: team group chats and one-to-one messages, with reactions, replies, and photo sharing. Since chat needs real people, this also turns on sign-in and saves data in the backend.

## Sign-in

- New public `/auth` page: email + password sign-up/sign-in, plus "Continue with Google".
- Each person gets a profile (display name, avatar) created automatically on first sign-in.
- Me page gains the signed-in name/avatar and a sign-out button.
- Team pages, schedule and marketplace stay open as they are today; only the Messages tab requires sign-in, showing a "Sign in to chat" prompt when signed out.

## Messages tab

- Conversation list: team chats and direct chats together, each row showing avatar/team badge, last message preview, time, and unread dot.
- New chat: pick a person from the teams you belong to for a direct chat; team chats appear automatically for each team you're in.
- Chat screen, iMessage style:
  - Bubbles right-aligned (dark) for you, left-aligned (grey) for others, grouped by sender with tails on the last bubble of a run, day dividers, and small timestamps.
  - Sender name + avatar in group chats.
  - Sticky composer with growing text field, photo button, and send button.
  - Messages arrive live without refreshing; "Delivered"/read state and typing-style feel kept simple.
- Reactions: long-press (or tap-hold on desktop) a bubble to open a small reaction bar with 6 emoji; taps toggle your reaction; counts render as a chip under the bubble, tap to see who reacted.
- Replies: swipe a bubble right or use the long-press menu to reply; the quoted message renders above the reply text and tapping it scrolls to the original.
- Long-press menu also offers Copy and Delete (own messages; deleted shows "Message deleted").
- Photos: one photo per message. Chosen photo is resized and compressed in the browser before upload (max 1600px long edge, JPEG ~0.75, plus a small blurred placeholder) so sending stays fast on mobile data. Photos render as rounded bubbles, tap for full-screen view. Photos stay in full colour, matching the app's monochrome-with-photos style.
- Unread badge on the Messages tab icon.

## Technical notes

- Backend tables: `profiles`, `conversations` (type: team | direct, optional group_id), `conversation_members`, `messages` (body, image_path, image_width/height, reply_to_id, deleted_at), `message_reactions` (unique per user+message+emoji), plus `last_read_at` on membership for unread counts.
- RLS scoped to membership via a `SECURITY DEFINER` helper (`is_conversation_member`) to avoid recursive policies; GRANTs for `authenticated` and `service_role` on every table.
- Realtime subscriptions on `messages` and `message_reactions` filtered by conversation.
- Private storage bucket `chat-images` with membership-scoped read policy and per-user upload paths; images signed on read.
- Client-side compression via canvas (`createImageBitmap` + `toBlob`), no server image processing.
- Reads/writes through the browser Supabase client with RLS; unread counts and conversation list via TanStack Query.
- Routes: `/auth`, `/messages` (list), `/messages/$conversationId` (thread), Messages added to the tab bar.
- Sign-in providers configured in the same change so Google works on first try.

## Notes

Teams and events are still demo data, so direct-message contacts come from the demo rosters until those move to the backend. Team membership backing the group chats is created for the teams you join in-app.
