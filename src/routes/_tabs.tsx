import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  Users,
  CalendarDays,
  MessageCircle,
  ShoppingBag,
  User,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { fetchConversations } from "../lib/chat";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/messages", label: "Chat", icon: MessageCircle },
  { to: "/marketplace", label: "Market", icon: ShoppingBag },
  { to: "/me", label: "Me", icon: User },
];

function TabsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    enabled: Boolean(user),
  });
  const unread = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background md:max-w-2xl">
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border safe-area-inset-bottom">
        <div className="mx-auto flex w-full max-w-[430px] items-center justify-around px-1 py-2 md:max-w-2xl">
          {tabs.map((tab) => {
            const isActive =
              tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors"
                activeProps={{
                  className: "text-brand-primary",
                }}
                inactiveProps={{
                  className: "text-on-surface-tertiary hover:text-on-surface-secondary",
                }}
              >
                <span className="relative">
                  <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                  {tab.to === "/messages" && unread > 0 && (
                    <span className="absolute -right-2 -top-1 min-w-4 rounded-full bg-brand-primary px-1 text-center text-[9px] font-bold leading-4 text-on-brand-primary">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-brand-primary" : "text-on-surface-tertiary"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
