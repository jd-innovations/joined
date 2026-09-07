import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  MessageSquare,
  MapPin,
  CloudSun,
  Wind,
  Droplets,
  ChevronRight,
  Check,
  AlertCircle,
  HelpCircle,
  Users,
  CalendarDays,
} from "lucide-react";

import {
  currentUser,
  getLiveActivities,
  getNextEvent,
  getWeatherForUser,
  groups,
  actionItems,
  formatEventTime,
  formatRelativeTime,
} from "../../lib/data";

export const Route = createFileRoute("/_tabs/")({
  head: () => ({
    meta: [
      { title: "Home — Sideline" },
      {
        name: "description",
        content: "Your personalized team dashboard with weather, live activities, and upcoming events.",
      },
      { property: "og:title", content: "Home — Sideline" },
      {
        property: "og:description",
        content: "Your personalized team dashboard with weather, live activities, and upcoming events.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const nextEvent = getNextEvent();
  const liveActivities = getLiveActivities();
  const weather = getWeatherForUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="h-10 w-10 rounded-full border border-border object-cover"
            />
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <h1 className="text-lg font-bold text-foreground">
                {currentUser.displayName}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/messages"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary text-on-surface-secondary transition-colors hover:bg-surface-tertiary"
            >
              <MessageSquare className="h-5 w-5" />
            </Link>
            <Link
              to="/alerts"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary text-on-surface-secondary transition-colors hover:bg-surface-tertiary"
            >
              <Bell className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="space-y-5 px-4 pb-6 pt-4">
        {/* Weather widget */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-inverse via-surface-inverse to-surface-tertiary p-5 text-on-surface-inverse shadow-sm">
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">{weather.location}</p>
              <p className="mt-1 text-5xl font-bold tracking-tight">
                {weather.temp}°
              </p>
              <p className="mt-1 text-sm opacity-90">{weather.condition}</p>
              <div className="mt-4 flex items-center gap-4 text-xs opacity-80">
                <span className="flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5" /> 8 mph
                </span>
                <span className="flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5" /> 12%
                </span>
              </div>
            </div>
            <CloudSun className="h-16 w-16 opacity-90" />
          </div>
          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </section>

        {/* Live Activities */}
        {liveActivities.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Live Now
              </h2>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error" />
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {liveActivities.map((live) => (
                <Link
                  key={live.id}
                  to={`/schedule/$eventId`}
                  params={{ eventId: live.eventId }}
                  className="min-w-[260px] flex-1 rounded-2xl bg-surface-secondary p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-error px-2 py-0.5 text-[10px] font-bold uppercase text-on-error">
                      LIVE
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {live.update}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {live.title}
                  </p>
                  {live.score && (
                    <p className="mt-1 font-mono text-3xl font-bold text-foreground">
                      {live.score.us} — {live.score.them}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Next Up */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Next Up
          </h2>
          {nextEvent ? (
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src={nextEvent.coverUrl}
                alt={nextEvent.title}
                className="h-48 w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                <div className="flex items-center gap-2 text-xs font-medium opacity-90">
                  <span className="rounded-full bg-white/25 px-2 py-0.5 text-white backdrop-blur-md">
                    {nextEvent.type}
                  </span>
                  <span>{formatRelativeTime(nextEvent.startAt)}</span>
                </div>
                <h3 className="mt-1 text-xl font-bold">{nextEvent.title}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-sm opacity-90">
                  <MapPin className="h-3.5 w-3.5" /> {nextEvent.location.name}
                </p>
                <p className="mt-0.5 text-xs opacity-75">
                  {formatEventTime(nextEvent.startAt)}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <button className="flex-1 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-on-brand-primary transition-transform active:scale-95">
                    Going
                  </button>
                  <button className="flex-1 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-transform active:scale-95">
                    Maybe
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming events"
              subtitle="You're all caught up."
            />
          )}
        </section>

        {/* Needs You */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Needs You
          </h2>
          <div className="space-y-2">
            {actionItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl bg-surface-secondary p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tertiary text-on-brand-tertiary">
                  {item.type === "rsvp" && <AlertCircle className="h-5 w-5" />}
                  {item.type === "poll" && <HelpCircle className="h-5 w-5" />}
                  {item.type === "volunteer" && <Users className="h-5 w-5" />}
                  {item.type === "form" && <Check className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </section>

        {/* Your Teams */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Your Teams
            </h2>
            <Link
              to="/groups"
              className="text-xs font-semibold text-brand-primary"
            >
              See all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/groups/$groupId`}
                params={{ groupId: group.id }}
                className="min-w-[140px] flex-1 overflow-hidden rounded-2xl bg-surface-secondary"
              >
                <div className="h-20 overflow-hidden">
                  <img
                    src={group.coverUrl}
                    alt={group.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-foreground">
                    {group.emoji} {group.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {group.memberCount} members
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Join code CTA */}
        <section className="rounded-2xl bg-brand-tertiary p-4">
          <p className="text-sm font-semibold text-on-brand-tertiary">
            Have a group code?
          </p>
          <p className="text-xs text-on-brand-tertiary/80">
            Join a team in seconds without sharing your contact info.
          </p>
          <button className="mt-3 w-full rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-on-brand-primary transition-transform active:scale-95">
            Enter Group Code
          </button>
        </section>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof CalendarDays;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-surface-secondary py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-tertiary text-on-surface-tertiary">
        <Icon className="h-7 w-7" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}
