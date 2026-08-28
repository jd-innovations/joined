import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — Sideline" },
      { name: "description", content: "Your unified team calendar." },
      { property: "og:title", content: "Schedule — Sideline" },
      { property: "og:description", content: "Your unified team calendar." },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Unified calendar and event details coming next.
        </p>
      </div>
    </div>
  );
}
