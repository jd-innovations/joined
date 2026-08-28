import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../../lib/theme";

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

function MePage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground">Me</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Profile, wallet, and settings coming next.
      </p>

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
    </div>
  );
}
