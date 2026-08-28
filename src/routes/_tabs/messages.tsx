import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Team messaging coming next.
        </p>
      </div>
    </div>
  );
}
