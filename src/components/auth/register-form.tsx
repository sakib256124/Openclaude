"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  function registrationErrorMessage(payload: {
    error?: {
      message?: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };
  }) {
    const fieldErrors = payload.error?.fieldErrors;
    const firstFieldError = fieldErrors
      ? Object.values(fieldErrors).flat().find((message): message is string => Boolean(message))
      : null;

    return firstFieldError ?? payload.error?.message ?? "Registration failed.";
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    if (password !== confirmPassword) {
      setPending(false);
      setError("Passwords do not match.");
      return;
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setPending(false);
      setError(registrationErrorMessage(payload));
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl
    });

    setPending(false);

    if (result?.error) {
      window.location.assign("/login?registered=1");
      return;
    }

    window.location.assign(result?.url ?? callbackUrl);
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-primary transition focus:ring-2"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <p className="text-xs text-muted-foreground">Name will be created automatically from your email.</p>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            className="h-10 w-full rounded-md border bg-background px-3 pr-11 text-sm outline-none ring-primary transition focus:ring-2"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Minimum 5 characters.</p>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-primary transition focus:ring-2"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </div>
      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <Button className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <UserPlus />}
        Create account
      </Button>
    </form>
  );
}
