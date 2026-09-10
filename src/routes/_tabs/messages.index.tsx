import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, PenSquare, Users, X } from "lucide-react";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../lib/auth";
import { groups } from "../../lib/data";
import {
  chatTime,
  fetchConversations,
  fetchPeople,
  initials,
  joinTeamConversation,
  startDirectConversation,
  type ConversationOverview,
} from "../../lib/chat";

export const Route = createFileRoute("/_tabs/messages/")({
  head: () => ({
    meta: [
      { title: "Messages — Sideline" },
      {
        name: "description",
        content: "Team chats and direct messages with your teammates.",
      },
      { property: "og:title", content: "Messages — Sideline" },
      {
        property: "og:description",
        content: "Team chats and direct messages with your teammates.",
      },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-on-surface-tertiary" />
      </div>
    );
  }

  if (!user) return <SignedOut />;
  return <ConversationList userId={user.id} />;
}

function SignedOut() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-secondary">
        <Users className="h-6 w-6 text-on-surface-secondary" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-foreground">Messages</h1>
      <p className="mt-2 max-w-xs text-sm text-on-surface-tertiary">
        Sign in to chat with your teams and message teammates one-to-one.
      </p>
      <Link
        to="/auth"
        className="mt-6 rounded-2xl bg-brand-primary px-6 py-3 text-sm font-semibold text-on-brand-primary"
      >
        Sign in to chat
      </Link>
    </div>
  );
}

function ConversationList({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sheet, setSheet] = useState(false);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  useEffect(() => {
    const channel = supabase
      .channel("conversations-overview")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const openTeam = useMutation({
    mutationFn: (g: { id: string; name: string }) =>
      joinTeamConversation(g.id, g.name),
    onSuccess: (id) => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      void navigate({ to: "/messages/$conversationId", params: { conversationId: id } });
    },
  });

  const openDirect = useMutation({
    mutationFn: (otherId: string) => startDirectConversation(otherId),
    onSuccess: (id) => {
      setSheet(false);
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      void navigate({ to: "/messages/$conversationId", params: { conversationId: id } });
    },
  });

  const joinedTeamKeys = new Set(
    conversations.filter((c) => c.team_key).map((c) => c.team_key as string),
  );
  const availableTeams = groups.filter((g) => !joinedTeamKeys.has(g.id));

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-20 glass px-4 pb-3 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
          <button
            onClick={() => setSheet(true)}
            aria-label="New message"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary text-foreground"
          >
            <PenSquare className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-on-surface-tertiary" />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {conversations.map((c) => (
            <ConversationRow key={c.id} conversation={c} userId={userId} />
          ))}
          {conversations.length === 0 && (
            <p className="px-4 py-8 text-sm text-on-surface-tertiary">
              No chats yet. Join a team chat below or start a direct message.
            </p>
          )}
        </div>
      )}

      {availableTeams.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-on-surface-tertiary">
            Team chats
          </h2>
          <div className="mt-3 space-y-2">
            {availableTeams.map((g) => (
              <button
                key={g.id}
                onClick={() => openTeam.mutate({ id: g.id, name: g.name })}
                disabled={openTeam.isPending}
                className="flex w-full items-center gap-3 rounded-2xl bg-surface-secondary p-3 text-left disabled:opacity-60"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-tertiary text-lg">
                  {g.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {g.name}
                  </span>
                  <span className="block text-xs text-on-surface-tertiary">
                    {g.memberCount} members · Join chat
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {sheet && (
        <NewDirectSheet
          userId={userId}
          onClose={() => setSheet(false)}
          onPick={(id) => openDirect.mutate(id)}
          busy={openDirect.isPending}
        />
      )}
    </div>
  );
}

function ConversationRow({
  conversation: c,
  userId,
}: {
  conversation: ConversationOverview;
  userId: string;
}) {
  const name =
    c.type === "direct" ? (c.other_display_name ?? "Direct message") : (c.title ?? "Team chat");
  const preview = c.last_message_body
    ? c.last_message_body
    : c.last_message_has_image
      ? "📷 Photo"
      : "No messages yet";
  const emoji = c.team_key ? groups.find((g) => g.id === c.team_key)?.emoji : null;

  return (
    <Link
      to="/messages/$conversationId"
      params={{ conversationId: c.id }}
      className="flex items-center gap-3 px-4 py-3 active:bg-surface-secondary"
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-tertiary text-sm font-semibold text-on-surface-secondary">
        {emoji ? (
          <span className="text-lg">{emoji}</span>
        ) : c.other_avatar_url ? (
          <img src={c.other_avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          initials(name)
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{name}</span>
          <span className="shrink-0 text-[11px] text-on-surface-tertiary">
            {chatTime(c.last_message_at)}
          </span>
        </span>
        <span className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={`truncate text-xs ${
              c.unread_count > 0
                ? "font-semibold text-foreground"
                : "text-on-surface-tertiary"
            }`}
          >
            {c.last_message_sender_id === userId ? "You: " : ""}
            {preview}
          </span>
          {c.unread_count > 0 && (
            <span className="shrink-0 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-on-brand-primary">
              {c.unread_count}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}

function NewDirectSheet({
  userId,
  onClose,
  onPick,
  busy,
}: {
  userId: string;
  onClose: () => void;
  onPick: (id: string) => void;
  busy: boolean;
}) {
  const { data: people = [], isLoading } = useQuery({
    queryKey: ["people", userId],
    queryFn: () => fetchPeople(userId),
  });

  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-black/50" onClick={onClose}>
      <div
        className="max-h-[70vh] w-full overflow-y-auto rounded-t-3xl bg-background p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">New message</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 text-on-surface-tertiary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-on-surface-tertiary" />
          </div>
        ) : people.length === 0 ? (
          <p className="py-8 text-sm text-on-surface-tertiary">
            No other members yet. Once teammates sign in, they'll show up here.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-border">
            {people.map((p) => (
              <button
                key={p.id}
                onClick={() => onPick(p.id)}
                disabled={busy}
                className="flex w-full items-center gap-3 py-3 text-left disabled:opacity-60"
              >
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-tertiary text-xs font-semibold text-on-surface-secondary">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(p.display_name)
                  )}
                </span>
                <span className="text-sm font-medium text-foreground">{p.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
