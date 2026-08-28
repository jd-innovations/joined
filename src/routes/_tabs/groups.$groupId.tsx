import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/groups/$groupId")({
  component: GroupDetailPage,
});

function GroupDetailPage() {
  const { groupId } = Route.useParams();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Group</h1>
        <p className="mt-2 text-sm text-muted-foreground">ID: {groupId}</p>
      </div>
    </div>
  );
}
