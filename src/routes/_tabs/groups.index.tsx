import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, KeyRound, Plus, Users } from "lucide-react";

import {
  groups,
  getUpcomingEvents,
  getMembersForGroup,
  formatEventTime,
} from "../../lib/data";

export const Route = createFileRoute("/_tabs/groups/")({
  head: () => ({
    meta: [
      { title: "Groups — Sideline" },
      {
        name: "description",
        content:
          "All your teams and groups in one place — rosters, join codes and upcoming events.",
      },
      { property: "og:title", content: "Groups — Sideline" },
      {
        property: "og:description",
        content:
          "All your teams and groups in one place — rosters, join codes and upcoming events.",
      },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  const [code, setCode] = useState("");
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  const handleJoin = () => {
    const match = groups.find(
      (g) => g.joinCode.toLowerCase() === code.trim().toLowerCase(),
    );
    setJoinMessage(
      match
        ? `You're already a member of ${match.name}.`
        : code.trim()
          ? "No group found with that code."
          : "Enter a group code first.",
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-strong border-b border-border safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {groups.length} groups
            </p>
            <h1 className="text-lg font-bold text-foreground">Groups</h1>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-on-brand-primary transition-transform active:scale-95"
            aria-label="Create a group"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="space-y-5 px-4 pb-6 pt-4">
        <section className="rounded-2xl bg-brand-tertiary p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-on-brand-tertiary">
            <KeyRound className="h-4 w-4" /> Join with a group code
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="FIRE7"
              aria-label="Group code"
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-sm uppercase tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <button
              type="button"
              onClick={handleJoin}
              className="rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-on-brand-primary transition-transform active:scale-95"
            >
              Join
            </button>
          </div>
          {joinMessage && (
            <p className="mt-2 text-xs text-on-brand-tertiary/80">
              {joinMessage}
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Your Teams
          </h2>
          {groups.map((group) => {
            const upcoming = getUpcomingEvents(group.id);
            const next = upcoming[0];
            const roster = getMembersForGroup(group.id);
            return (
              <Link
                key={group.id}
                to="/groups/$groupId"
                params={{ groupId: group.id }}
                className="block overflow-hidden rounded-3xl bg-surface-secondary transition-transform active:scale-[0.99]"
              >
                <div className="relative h-28">
                  <img
                    src={group.coverUrl}
                    alt={group.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {group.isPremium && (
                    <span className="absolute right-3 top-3 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-bold uppercase text-on-brand-primary">
                      Premium
                    </span>
                  )}
                  <div className="absolute bottom-3 left-4 text-white">
                    <p className="text-base font-bold">
                      {group.emoji} {group.name}
                    </p>
                    <p className="text-xs opacity-90 capitalize">
                      {group.sport}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {group.memberCount} members · {roster.length} active
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                      {next
                        ? `${next.title} · ${formatEventTime(next.startAt)}`
                        : "No upcoming events"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
