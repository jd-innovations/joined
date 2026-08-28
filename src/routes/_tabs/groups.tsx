import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/groups")({
  component: () => <Outlet />,
});
