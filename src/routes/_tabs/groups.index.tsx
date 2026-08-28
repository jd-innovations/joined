import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/groups")({
  head: () => ({
    meta: [
      { title: "Groups — Sideline" },
      { name: "description", content: "Your teams and groups in one place." },
      { property: "og:title", content: "Groups — Sideline" },
      { property: "og:description", content: "Your teams and groups in one place." },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Groups</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Team list and join-by-code coming next.
        </p>
      </div>
    </div>
  );
}
