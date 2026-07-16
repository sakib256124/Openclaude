"use client";

import Link from "next/link";
import * as React from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [resetUrl, setResetUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    setResetUrl(null);

    const response = await fetch("/api/password/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const payload = await response.json().catch(() => ({}));
    setPending(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "Unable to create a reset link.");
      return;
    }

    setMessage("If the account exists, a password reset link has been prepared.");
    setResetUrl(payload.resetUrl ?? null);
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
      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="space-y-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
          <p>{message}</p>
          {resetUrl ? (
            <Link className="block break-all font-mono text-xs text-primary hover:underline" href={resetUrl}>
              {resetUrl}
            </Link>
          ) : null}
        </div>
      ) : null}
      <Button className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Mail />}
        Send reset link
      </Button>
    </form>
  );
}
