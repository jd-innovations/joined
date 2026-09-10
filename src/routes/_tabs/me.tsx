import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, Monitor, LogOut } from "lucide-react";
import { useTheme } from "../../lib/theme";
import { useTextSize, type TextSize } from "../../lib/text-size";
import { useAuth } from "../../lib/auth";
import { initials } from "../../lib/chat";
import { supabase } from "../../integrations/supabase/client";

export const Route = createFileRoute("/_tabs/me")({
  head: () => ({
    meta: [
      { title: "Me — Sideline" },
      { name: "description", content: "Profile, wallet, and app settings." },
      { property: "og:title", content: "Me — Sideline" },
      { property: "og:description", content: "Profile, wallet, and app settings." },
    ],
  }),
  component: MePage,
});

const TEXT_SIZES: { value: TextSize; label: string; glyphPx: number }[] = [
  { value: "small", label: "Small", glyphPx: 12 },
  { value: "default", label: "Default", glyphPx: 15 },
  { value: "large", label: "Large", glyphPx: 18 },
  { value: "xlarge", label: "XL", glyphPx: 22 },
];

function MePage() {
  const { theme, setTheme } = useTheme();
  const { textSize, setTextSize } = useTextSize();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground">Me</h1>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-secondary p-4">
        <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-surface-tertiary text-sm font-semibold text-on-surface-secondary">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(profile?.display_name ?? "Guest")
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {profile?.display_name ?? (user ? "Member" : "Not signed in")}
          </p>
          <p className="truncate text-xs text-on-surface-tertiary">
            {user?.email ?? "Sign in to chat with your teams"}
          </p>
        </div>
        {user ? (
          <button
            onClick={() => void handleSignOut()}
            className="flex items-center gap-1.5 rounded-xl bg-surface-tertiary px-3 py-2 text-xs font-semibold text-on-surface-secondary"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        ) : (
          <Link
            to="/auth"
            className="rounded-xl bg-brand-primary px-3 py-2 text-xs font-semibold text-on-brand-primary"
          >
            Sign in
          </Link>
        )}
      </div>


      <div className="mt-6 rounded-2xl bg-surface-secondary p-4">
        <p className="text-sm font-semibold text-foreground">Appearance</p>
        <div className="mt-3 flex gap-2">
          {(["system", "light", "dark"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                theme === t
                  ? "bg-brand-primary text-on-brand-primary"
                  : "bg-surface-tertiary text-on-surface-secondary hover:bg-surface-tertiary/80"
              }`}
            >
              {t === "system" && <Monitor className="h-3.5 w-3.5" />}
              {t === "light" && <Sun className="h-3.5 w-3.5" />}
              {t === "dark" && <Moon className="h-3.5 w-3.5" />}
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-surface-secondary p-4">
        <p className="text-sm font-semibold text-foreground">Text size</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Scales all text across the app.
        </p>
        <div className="mt-3 flex gap-2">
          {TEXT_SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => setTextSize(s.value)}
              aria-pressed={textSize === s.value}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 transition-colors ${
                textSize === s.value
                  ? "bg-brand-primary text-on-brand-primary"
                  : "bg-surface-tertiary text-on-surface-secondary hover:bg-surface-tertiary/80"
              }`}
            >
              <span
                className="font-bold leading-none"
                style={{ fontSize: s.glyphPx }}
              >
                A
              </span>
              <span className="text-[10px] font-semibold">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
