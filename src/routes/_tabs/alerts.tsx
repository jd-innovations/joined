import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/alerts")({
  component: AlertsPage,
});

function AlertsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Notifications and reminders coming next.
        </p>
      </div>
    </div>
  );
}
