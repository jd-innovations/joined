import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Users } from "lucide-react";

import {
  groups,
  getUpcomingEvents,
  getPastEvents,
  groupEventsByDay,
  formatTimeOnly,
  getGroupById,
} from "../../lib/data";

export const Route = createFileRoute("/_tabs/schedule/")({
  head: () => ({
    meta: [
      { title: "Schedule — Sideline" },
      {
        name: "description",
        content:
          "One calendar for every team — practices, games and meetups with RSVPs at a glance.",
      },
      { property: "og:title", content: "Schedule — Sideline" },
      {
        property: "og:description",
        content:
          "One calendar for every team — practices, games and meetups with RSVPs at a glance.",
      },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const list =
    tab === "upcoming"
      ? getUpcomingEvents(groupFilter ?? undefined)
      : getPastEvents().filter((e) =>
          groupFilter ? e.groupId === groupFilter : true,
        );
  const days = groupEventsByDay(list);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-strong border-b border-border safe-area-inset-top">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">Schedule</h1>
          <div className="mt-3 flex gap-1 rounded-xl bg-surface-secondary p-1">
            {(["upcoming", "past"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-colors ${
                  tab === t
                    ? "bg-brand-primary text-on-brand-primary"
                    : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
            <FilterChip
              active={groupFilter === null}
              onClick={() => setGroupFilter(null)}
              label="All teams"
            />
            {groups.map((g) => (
              <FilterChip
                key={g.id}
                active={groupFilter === g.id}
                onClick={() => setGroupFilter(g.id)}
                label={`${g.emoji} ${g.name}`}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4 pb-6 pt-4">
        {days.length === 0 && (
          <div className="flex flex-col items-center rounded-3xl bg-surface-secondary py-12 text-center">
            <CalendarDays className="h-7 w-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Nothing here yet
            </p>
            <p className="text-xs text-muted-foreground">
              {tab === "upcoming"
                ? "No upcoming events for this filter."
                : "No past events for this filter."}
            </p>
          </div>
        )}

        {days.map((day) => (
          <section key={day.label}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {day.label}
            </h2>
            <div className="space-y-2">
              {day.events.map((event) => {
                const group = getGroupById(event.groupId);
                return (
                  <Link
                    key={event.id}
                    to="/schedule/$eventId"
                    params={{ eventId: event.id }}
                    className="flex gap-3 rounded-2xl bg-surface-secondary p-3 transition-transform active:scale-[0.99]"
                  >
                    <div className="w-14 shrink-0 text-center">
                      <p className="text-sm font-bold text-foreground">
                        {formatTimeOnly(event.startAt).replace(" ", "")}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        {event.type}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {event.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {group ? `${group.emoji} ${group.name}` : "Team"}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3" /> {event.location.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {event.goingCount}
                        </span>
                      </div>
                    </div>
                    {event.isLive && (
                      <span className="h-fit rounded-full bg-error px-2 py-0.5 text-[10px] font-bold uppercase text-on-error">
                        Live
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-brand-primary text-on-brand-primary"
          : "bg-surface-secondary text-on-surface-secondary"
      }`}
    >
      {label}
    </button>
  );
}
