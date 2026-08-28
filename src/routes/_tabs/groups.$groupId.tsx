import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Copy, MapPin, Users } from "lucide-react";

import {
  getEventsForGroup,
  getGroupById,
  getMembersForGroup,
  formatEventTime,
  rsvpLabels,
} from "../../lib/data";

export const Route = createFileRoute("/_tabs/groups/$groupId")({
  loader: ({ params }) => {
    const group = getGroupById(params.groupId);
    if (!group) throw notFound();
    return { group };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Group not found — Sideline" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.group.name} — Sideline`;
    const description = `Roster, schedule and join code for ${loaderData.group.name}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: GroupNotFound,
  component: GroupDetailPage,
});

function GroupNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-bold text-foreground">Group not found</h1>
      <Link
        to="/groups"
        className="mt-3 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-on-brand-primary"
      >
        Back to groups
      </Link>
    </div>
  );
}

function GroupDetailPage() {
  const { group } = Route.useLoaderData();
  const roster = getMembersForGroup(group.id);
  const groupEvents = getEventsForGroup(group.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-56">
        <img
          src={group.coverUrl}
          alt={group.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />
        <Link
          to="/groups"
          aria-label="Back to groups"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md safe-area-inset-top"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs uppercase tracking-wide opacity-80">
            {group.sport}
          </p>
          <h1 className="text-2xl font-bold">
            {group.emoji} {group.name}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm opacity-90">
            <Users className="h-3.5 w-3.5" /> {group.memberCount} members
          </p>
        </div>
      </div>

      <div className="space-y-5 px-4 pb-6 pt-4">
        <section className="flex items-center gap-3 rounded-2xl bg-surface-secondary p-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Join code</p>
            <p className="font-mono text-xl font-bold tracking-widest text-foreground">
              {group.joinCode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(group.joinCode)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-3 py-2 text-xs font-semibold text-on-brand-primary transition-transform active:scale-95"
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </button>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Schedule
            </h2>
            <Link
              to="/schedule"
              className="text-xs font-semibold text-brand-primary"
            >
              Full calendar
            </Link>
          </div>
          {groupEvents.length > 0 ? (
            <div className="space-y-2">
              {groupEvents.map((event) => (
                <Link
                  key={event.id}
                  to="/schedule/$eventId"
                  params={{ eventId: event.id }}
                  className="flex items-center gap-3 rounded-2xl bg-surface-secondary p-3 transition-transform active:scale-[0.99]"
                >
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-tertiary text-on-brand-tertiary">
                    <span className="text-[10px] uppercase">
                      {new Date(event.startAt).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-sm font-bold leading-none">
                      {new Date(event.startAt).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {event.title}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {event.location.name}
                    </p>
                  </div>
                  {event.isLive ? (
                    <span className="rounded-full bg-error px-2 py-0.5 text-[10px] font-bold uppercase text-on-error">
                      Live
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {formatEventTime(event.startAt).split(",")[0]}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-3xl bg-surface-secondary py-10 text-center">
              <CalendarDays className="h-7 w-7 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold text-foreground">
                Nothing scheduled
              </p>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Roster
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl bg-surface-secondary">
            {roster.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3">
                <img
                  src={member.avatarUrl}
                  alt={member.displayName}
                  className="h-10 w-10 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {member.displayName}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {member.role}
                  </p>
                </div>
                {member.rsvp && (
                  <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-semibold text-on-surface-tertiary">
                    {rsvpLabels[member.rsvp]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
