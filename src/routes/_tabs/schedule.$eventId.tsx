import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CloudSun,
  MapPin,
  Users,
} from "lucide-react";

import {
  getEventById,
  getGroupById,
  getMembersForGroup,
  formatEventTime,
  formatRelativeTime,
  formatTimeOnly,
  rsvpLabels,
  type RsvpStatus,
} from "../../lib/data";

export const Route = createFileRoute("/_tabs/schedule/$eventId")({
  loader: ({ params }) => {
    const event = getEventById(params.eventId);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Event not found — Sideline" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.event.title} — Sideline`;
    const description = `${formatEventTime(loaderData.event.startAt)} at ${loaderData.event.location.name}. RSVP and check in with your team.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: EventNotFound,
  component: EventDetailPage,
});

function EventNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-bold text-foreground">Event not found</h1>
      <Link
        to="/schedule"
        className="mt-3 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-on-brand-primary"
      >
        Back to schedule
      </Link>
    </div>
  );
}

function EventDetailPage() {
  const { event } = Route.useLoaderData();
  const group = getGroupById(event.groupId);
  const roster = group ? getMembersForGroup(group.id) : [];
  const [rsvp, setRsvp] = useState<RsvpStatus | undefined>(event.rsvpStatus);
  const [checkedIn, setCheckedIn] = useState(false);

  const options: RsvpStatus[] = ["going", "maybe", "not_going"];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-56">
        <img
          src={event.coverUrl}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />
        <Link
          to="/schedule"
          aria-label="Back to schedule"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md safe-area-inset-top"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="rounded-full bg-brand-primary/90 px-2 py-0.5 capitalize">
              {event.type}
            </span>
            {event.isLive ? (
              <span className="rounded-full bg-error px-2 py-0.5 font-bold uppercase">
                Live
              </span>
            ) : (
              <span className="opacity-90">
                in {formatRelativeTime(event.startAt)}
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold">{event.title}</h1>
          {group && (
            <Link
              to="/groups/$groupId"
              params={{ groupId: group.id }}
              className="mt-1 inline-block text-sm underline decoration-white/40 opacity-90"
            >
              {group.emoji} {group.name}
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-5 px-4 pb-6 pt-4">
        {event.isLive && event.liveScore && (
          <section className="rounded-3xl bg-surface-secondary p-5 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Live score
            </p>
            <p className="mt-1 font-mono text-4xl font-bold text-brand-primary">
              {event.liveScore.us} — {event.liveScore.them}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {event.checkedInCount} checked in
            </p>
          </section>
        )}

        <section className="space-y-3 rounded-3xl bg-surface-secondary p-4">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {formatEventTime(event.startAt)}
              </p>
              <p className="text-xs text-muted-foreground">
                Ends {formatTimeOnly(event.endAt)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {event.location.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {event.location.address}
              </p>
            </div>
          </div>
          {event.weather && (
            <div className="flex items-start gap-3">
              <CloudSun className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {event.weather.temp}° ·{" "}
                  {event.weather.condition.replace("_", " ")}
                </p>
                <p className="text-xs capitalize text-muted-foreground">
                  Playability: {event.weather.playability}
                </p>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Your RSVP
          </h2>
          <div className="flex gap-2">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRsvp(option)}
                className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-transform active:scale-95 ${
                  rsvp === option
                    ? "bg-brand-primary text-on-brand-primary"
                    : "bg-surface-secondary text-on-surface-secondary"
                }`}
              >
                {rsvpLabels[option]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCheckedIn((v) => !v)}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-transform active:scale-95 ${
              checkedIn
                ? "bg-brand-tertiary text-on-brand-tertiary"
                : "border border-border bg-background text-foreground"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {checkedIn ? "Checked in" : "Check in at venue"}
          </button>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Attendance
            </h2>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {event.goingCount} going · {event.maybeCount} maybe ·{" "}
              {event.notGoingCount} out
            </p>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-2xl bg-surface-secondary">
            {roster.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3">
                <img
                  src={member.avatarUrl}
                  alt={member.displayName}
                  className="h-9 w-9 rounded-full object-cover"
                  loading="lazy"
                />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {member.displayName}
                </p>
                {member.rsvp && (
                  <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-semibold text-on-surface-tertiary">
                    {rsvpLabels[member.rsvp]}
                  </span>
                )}
              </div>
            ))}
            {roster.length === 0 && (
              <p className="p-4 text-xs text-muted-foreground">
                No roster available.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
