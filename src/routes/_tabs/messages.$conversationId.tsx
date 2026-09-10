import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ArrowLeft,
  Copy,
  ImagePlus,
  Loader2,
  Reply,
  SendHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../lib/auth";
import { groups } from "../../lib/data";
import { compressImage, type CompressedImage } from "../../lib/image-compress";
import { ChatImage } from "../../components/chat/ChatImage";
import {
  chatDayLabel,
  chatTime,
  deleteMessage,
  fetchConversation,
  fetchMembers,
  fetchMessages,
  fetchReactions,
  initials,
  markConversationRead,
  REACTION_EMOJI,
  sendMessage,
  toggleReaction,
  type ChatMessage,
  type Person,
  type Reaction,
} from "../../lib/chat";

export const Route = createFileRoute("/_tabs/messages/$conversationId")({
  head: () => ({
    meta: [
      { title: "Chat — Sideline" },
      { name: "description", content: "Your Sideline conversation." },
      { property: "og:title", content: "Chat — Sideline" },
      { property: "og:description", content: "Your Sideline conversation." },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { conversationId } = Route.useParams();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-on-surface-tertiary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-on-surface-tertiary">Sign in to view this chat.</p>
        <Link
          to="/auth"
          className="mt-4 rounded-2xl bg-brand-primary px-6 py-3 text-sm font-semibold text-on-brand-primary"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return <Thread conversationId={conversationId} userId={user.id} />;
}

function Thread({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}) {
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [pendingImage, setPendingImage] = useState<CompressedImage | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [reactorsFor, setReactorsFor] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const { data: conversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => fetchConversation(conversationId),
  });
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
  });
  const { data: reactions = [] } = useQuery({
    queryKey: ["reactions", conversationId],
    queryFn: () => fetchReactions(conversationId),
  });
  const { data: members = [] } = useQuery({
    queryKey: ["members", conversationId],
    queryFn: () => fetchMembers(conversationId),
  });

  const peopleById = useMemo(() => {
    const map = new Map<string, Person>();
    for (const m of members) map.set(m.id, m);
    return map;
  }, [members]);

  const messagesById = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    for (const m of messages) map.set(m.id, m);
    return map;
  }, [messages]);

  const reactionsByMessage = useMemo(() => {
    const map = new Map<string, Reaction[]>();
    for (const r of reactions) {
      const list = map.get(r.message_id);
      if (list) list.push(r);
      else map.set(r.message_id, [r]);
    }
    return map;
  }, [reactions]);

  // Live updates
  useEffect(() => {
    const channel = supabase
      .channel(`thread-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
          void queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["reactions", conversationId] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Mark read whenever the thread updates
  useEffect(() => {
    void markConversationRead(conversationId, userId).then(() => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });
  }, [conversationId, userId, messages.length, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const reactMutation = useMutation({
    mutationFn: (input: { messageId: string; emoji: string; existingId?: string | null }) =>
      toggleReaction({
        messageId: input.messageId,
        conversationId,
        userId,
        emoji: input.emoji,
        existingId: input.existingId ?? null,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["reactions", conversationId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] }),
  });

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPendingImage(await compressImage(file));
  }

  async function handleSend() {
    if (sending) return;
    if (!draft.trim() && !pendingImage) return;
    setSending(true);
    try {
      await sendMessage({
        conversationId,
        senderId: userId,
        body: draft,
        replyToId: replyTo?.id ?? null,
        image: pendingImage
          ? {
              blob: pendingImage.blob,
              width: pendingImage.width,
              height: pendingImage.height,
            }
          : null,
      });
      setDraft("");
      setReplyTo(null);
      setPendingImage(null);
      await queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } finally {
      setSending(false);
    }
  }

  const isTeam = conversation?.type === "team";
  const teamEmoji = conversation?.team_key
    ? groups.find((g) => g.id === conversation.team_key)?.emoji
    : null;
  const otherPerson = members.find((m) => m.id !== userId);
  const title = isTeam
    ? (conversation?.title ?? "Team chat")
    : (otherPerson?.display_name ?? "Direct message");

  const activeMenuMessage = menuFor ? messagesById.get(menuFor) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 glass flex items-center gap-3 border-b border-border px-3 py-3">
        <Link to="/messages" aria-label="Back" className="p-1 text-on-surface-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface-tertiary text-xs font-semibold text-on-surface-secondary">
          {teamEmoji ? (
            <span className="text-base">{teamEmoji}</span>
          ) : otherPerson?.avatar_url ? (
            <img src={otherPerson.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(title)
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="text-[11px] text-on-surface-tertiary">
            {isTeam ? `${members.length} in this chat` : "Direct message"}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-1 px-3 pb-44 pt-3">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-on-surface-tertiary" />
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <p className="py-10 text-center text-sm text-on-surface-tertiary">
            No messages yet. Say hello.
          </p>
        )}

        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const showDay =
            !prev || chatDayLabel(prev.created_at) !== chatDayLabel(m.created_at);
          const mine = m.sender_id === userId;
          const startOfRun = !prev || prev.sender_id !== m.sender_id || showDay;
          const endOfRun =
            !next ||
            next.sender_id !== m.sender_id ||
            chatDayLabel(next.created_at) !== chatDayLabel(m.created_at);

          return (
            <div key={m.id}>
              {showDay && (
                <p className="py-3 text-center text-[11px] font-medium text-on-surface-tertiary">
                  {chatDayLabel(m.created_at)}
                </p>
              )}
              <Bubble
                message={m}
                mine={mine}
                startOfRun={startOfRun}
                endOfRun={endOfRun}
                showSender={isTeam && !mine && startOfRun}
                sender={peopleById.get(m.sender_id) ?? null}
                repliedTo={m.reply_to_id ? (messagesById.get(m.reply_to_id) ?? null) : null}
                repliedToSender={
                  m.reply_to_id
                    ? (peopleById.get(messagesById.get(m.reply_to_id)?.sender_id ?? "") ?? null)
                    : null
                }
                reactions={reactionsByMessage.get(m.id) ?? []}
                userId={userId}
                onOpenMenu={() => setMenuFor(m.id)}
                onReply={() => setReplyTo(m)}
                onToggleReaction={(emoji, existingId) =>
                  reactMutation.mutate({ messageId: m.id, emoji, existingId })
                }
                onShowReactors={() => setReactorsFor(m.id)}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="fixed bottom-[68px] left-0 right-0 z-30 mx-auto w-full max-w-[430px] glass border-t border-border px-3 py-2 md:max-w-2xl">
        {replyTo && (
          <div className="mb-2 flex items-center gap-2 rounded-xl bg-surface-secondary px-3 py-2">
            <span className="h-8 w-0.5 rounded bg-on-surface-tertiary" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-on-surface-secondary">
                Replying to{" "}
                {replyTo.sender_id === userId
                  ? "yourself"
                  : (peopleById.get(replyTo.sender_id)?.display_name ?? "member")}
              </span>
              <span className="block truncate text-xs text-on-surface-tertiary">
                {replyTo.body ?? "Photo"}
              </span>
            </span>
            <button onClick={() => setReplyTo(null)} aria-label="Cancel reply">
              <X className="h-4 w-4 text-on-surface-tertiary" />
            </button>
          </div>
        )}

        {pendingImage && (
          <div className="mb-2 flex items-center gap-2">
            <img
              src={pendingImage.previewUrl}
              alt="Selected photo"
              className="h-16 w-16 rounded-xl object-cover"
            />
            <button
              onClick={() => setPendingImage(null)}
              className="text-xs font-medium text-on-surface-tertiary"
            >
              Remove photo
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePick}
          />
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Add photo"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-on-surface-secondary"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            rows={1}
            placeholder="Message"
            className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl bg-surface-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-on-surface-tertiary focus:outline-none"
          />
          <button
            onClick={() => void handleSend()}
            disabled={sending || (!draft.trim() && !pendingImage)}
            aria-label="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-on-brand-primary disabled:opacity-40"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Long-press menu */}
      {activeMenuMessage && (
        <div
          className="fixed inset-0 z-[95] flex items-end bg-black/50"
          onClick={() => setMenuFor(null)}
        >
          <div
            className="w-full rounded-t-3xl bg-background p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center gap-2 pb-3">
              {REACTION_EMOJI.map((emoji) => {
                const existing = (reactionsByMessage.get(activeMenuMessage.id) ?? []).find(
                  (r) => r.user_id === userId && r.emoji === emoji,
                );
                return (
                  <button
                    key={emoji}
                    onClick={() => {
                      reactMutation.mutate({
                        messageId: activeMenuMessage.id,
                        emoji,
                        existingId: existing?.id ?? null,
                      });
                      setMenuFor(null);
                    }}
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${
                      existing ? "bg-surface-inverse" : "bg-surface-secondary"
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
            <div className="divide-y divide-border">
              <button
                onClick={() => {
                  setReplyTo(activeMenuMessage);
                  setMenuFor(null);
                }}
                className="flex w-full items-center gap-3 py-3 text-sm font-medium text-foreground"
              >
                <Reply className="h-4 w-4" /> Reply
              </button>
              {activeMenuMessage.body && (
                <button
                  onClick={() => {
                    void navigator.clipboard?.writeText(activeMenuMessage.body ?? "");
                    setMenuFor(null);
                  }}
                  className="flex w-full items-center gap-3 py-3 text-sm font-medium text-foreground"
                >
                  <Copy className="h-4 w-4" /> Copy
                </button>
              )}
              {activeMenuMessage.sender_id === userId && !activeMenuMessage.deleted_at && (
                <button
                  onClick={() => {
                    deleteMutation.mutate(activeMenuMessage.id);
                    setMenuFor(null);
                  }}
                  className="flex w-full items-center gap-3 py-3 text-sm font-medium text-foreground"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Who reacted */}
      {reactorsFor && (
        <div
          className="fixed inset-0 z-[95] flex items-end bg-black/50"
          onClick={() => setReactorsFor(null)}
        >
          <div
            className="w-full rounded-t-3xl bg-background p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-bold text-foreground">Reactions</h2>
            <div className="mt-3 divide-y divide-border">
              {(reactionsByMessage.get(reactorsFor) ?? []).map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-2.5">
                  <span className="text-lg">{r.emoji}</span>
                  <span className="text-sm text-foreground">
                    {r.user_id === userId
                      ? "You"
                      : (peopleById.get(r.user_id)?.display_name ?? "Member")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({
  message,
  mine,
  startOfRun,
  endOfRun,
  showSender,
  sender,
  repliedTo,
  repliedToSender,
  reactions,
  userId,
  onOpenMenu,
  onReply,
  onToggleReaction,
  onShowReactors,
}: {
  message: ChatMessage;
  mine: boolean;
  startOfRun: boolean;
  endOfRun: boolean;
  showSender: boolean;
  sender: Person | null;
  repliedTo: ChatMessage | null;
  repliedToSender: Person | null;
  reactions: Reaction[];
  userId: string;
  onOpenMenu: () => void;
  onReply: () => void;
  onToggleReaction: (emoji: string, existingId: string | null) => void;
  onShowReactors: () => void;
}) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startX = useRef(0);
  const [swipe, setSwipe] = useState(0);

  function clearPress() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    startX.current = e.clientX;
    pressTimer.current = setTimeout(() => {
      onOpenMenu();
      pressTimer.current = null;
    }, 450);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 6) clearPress();
    if (dx > 0) setSwipe(Math.min(dx, 64));
  }

  function onPointerUp() {
    clearPress();
    if (swipe > 44) onReply();
    setSwipe(0);
  }

  const grouped = new Map<string, Reaction[]>();
  for (const r of reactions) {
    const list = grouped.get(r.emoji);
    if (list) list.push(r);
    else grouped.set(r.emoji, [r]);
  }

  const deleted = Boolean(message.deleted_at);
  const bubbleTone = mine
    ? "bg-surface-inverse text-on-surface-inverse"
    : "bg-surface-secondary text-foreground";
  const corner = mine
    ? endOfRun
      ? "rounded-br-md"
      : ""
    : endOfRun
      ? "rounded-bl-md"
      : "";

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} ${startOfRun ? "mt-2" : ""}`}>
      <div className="flex max-w-[78%] items-end gap-2">
        {!mine && (
          <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-surface-tertiary text-[10px] font-semibold text-on-surface-secondary">
            {endOfRun ? (
              sender?.avatar_url ? (
                <img src={sender.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  {initials(sender?.display_name ?? "M")}
                </span>
              )
            ) : null}
          </span>
        )}

        <div className="min-w-0">
          {showSender && (
            <p className="mb-1 pl-1 text-[11px] font-medium text-on-surface-tertiary">
              {sender?.display_name ?? "Member"}
            </p>
          )}

          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenMenu();
            }}
            style={{ transform: `translateX(${swipe}px)` }}
            className={`select-none rounded-3xl px-3.5 py-2 transition-transform ${bubbleTone} ${corner}`}
          >
            {repliedTo && (
              <div
                className={`mb-1.5 rounded-2xl px-2.5 py-1.5 text-[11px] ${
                  mine ? "bg-white/15" : "bg-surface-tertiary"
                }`}
              >
                <span className="block font-semibold">
                  {repliedTo.sender_id === userId
                    ? "You"
                    : (repliedToSender?.display_name ?? "Member")}
                </span>
                <span className="line-clamp-2 opacity-80">
                  {repliedTo.deleted_at ? "Message deleted" : (repliedTo.body ?? "Photo")}
                </span>
              </div>
            )}

            {deleted ? (
              <p className="text-sm italic opacity-70">Message deleted</p>
            ) : (
              <>
                {message.image_path && (
                  <ChatImage
                    path={message.image_path}
                    width={message.image_width}
                    height={message.image_height}
                    className={message.body ? "mb-1.5 w-56" : "w-56"}
                  />
                )}
                {message.body && (
                  <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">
                    {message.body}
                  </p>
                )}
              </>
            )}

            {endOfRun && (
              <p
                className={`mt-1 text-[10px] ${mine ? "opacity-60" : "text-on-surface-tertiary"}`}
              >
                {chatTime(message.created_at)}
              </p>
            )}
          </div>

          {grouped.size > 0 && (
            <div className={`mt-1 flex gap-1 ${mine ? "justify-end" : "justify-start"}`}>
              {[...grouped.entries()].map(([emoji, list]) => {
                const own = list.find((r) => r.user_id === userId);
                return (
                  <button
                    key={emoji}
                    onClick={() => onToggleReaction(emoji, own?.id ?? null)}
                    onDoubleClick={onShowReactors}
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
                      own
                        ? "border-transparent bg-surface-inverse text-on-surface-inverse"
                        : "border-border bg-surface-secondary text-on-surface-secondary"
                    }`}
                  >
                    <span>{emoji}</span>
                    {list.length > 1 && <span>{list.length}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
