import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { lovable } from "../integrations/lovable/index";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Sideline" },
      {
        name: "description",
        content: "Sign in to Sideline to message your teams and teammates.",
      },
      { property: "og:title", content: "Sign in — Sideline" },
      {
        property: "og:description",
        content: "Sign in to Sideline to message your teams and teammates.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (session) void navigate({ to: "/messages", replace: true });
  }, [session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (err) throw err;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    setBusy(false);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background px-5 py-6 md:max-w-md">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-tertiary"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mt-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-on-surface-tertiary">
          Sign in to message your teams and teammates.
        </p>
      </div>

      <button
        onClick={handleGoogle}
        disabled={busy}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface-secondary px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-tertiary disabled:opacity-60"
      >
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-on-surface-tertiary">
          or
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="w-full rounded-2xl bg-surface-secondary px-4 py-3.5 text-sm text-foreground placeholder:text-on-surface-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          className="w-full rounded-2xl bg-surface-secondary px-4 py-3.5 text-sm text-foreground placeholder:text-on-surface-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          minLength={6}
          placeholder="Password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className="w-full rounded-2xl bg-surface-secondary px-4 py-3.5 text-sm text-foreground placeholder:text-on-surface-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />

        {error && <p className="text-sm text-foreground">{error}</p>}
        {notice && <p className="text-sm text-on-surface-tertiary">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3.5 text-sm font-semibold text-on-brand-primary transition-opacity disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setNotice(null);
        }}
        className="mt-6 text-sm text-on-surface-tertiary"
      >
        {mode === "signin"
          ? "New to Sideline? Create an account"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
