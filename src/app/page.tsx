import Link from "next/link";
import { ArrowRight, Cloud, Cpu, Database, HardDrive, LogIn, Network, Shield, UserPlus } from "lucide-react";
import { LogoMark } from "@/components/layout/logo-mark";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

const demoAccounts = [
  { label: "Admin", email: "admin@gmai.com", password: "11111", role: "ADMIN" },
  { label: "Dev 1", email: "dev1@gmail.com", password: "11111", role: "DEVELOPER" },
  { label: "Dev 2", email: "dev2@gmail.com", password: "11111", role: "DEVELOPER" },
  { label: "Viewer", email: "user2@gmail.com", password: "11111", role: "VIEWER" }
] as const;

const modules = [
  { label: "Compute", icon: Cpu },
  { label: "Network", icon: Network },
  { label: "Storage", icon: HardDrive },
  { label: "Access", icon: Shield }
] as const;

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-base font-semibold leading-5">OpenCloud</div>
              <div className="text-xs text-muted-foreground">Compute Console</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/login">
                <LogIn />
                Sign in
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">
                <UserPlus />
                Register
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-md border bg-[var(--surface-elevated)] px-3 py-2 text-sm text-muted-foreground">
            <Cloud className="h-4 w-4 text-primary" />
            Ubuntu Multipass lab console
          </div>

          <div className="max-w-3xl space-y-5">
            <h1 className="text-5xl font-semibold leading-[1.08]">
              Manage local cloud resources from one console.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Start here without signing in. The protected console opens when dashboard, launch, or admin actions are selected.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={user ? "/dashboard" : "/login"}>
                <ArrowRight />
                {user ? "Open console" : "Open dashboard"}
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/register">
                <UserPlus />
                Create account
              </Link>
            </Button>
          </div>

          <div className="grid max-w-3xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => (
              <div key={module.label} className="flex items-center gap-3 rounded-md border bg-[var(--surface-elevated)] p-4">
                <module.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">{module.label}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border bg-[var(--surface-elevated)] p-5 shadow-2xl shadow-black/20">
          <div className="flex items-start justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-semibold">Demo access</h2>
              <p className="mt-1 text-sm text-muted-foreground">Use these accounts for role testing.</p>
            </div>
            <Database className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-4 space-y-2">
              {demoAccounts.map((account) => (
                <div key={account.email} className="rounded-md border bg-background p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{account.label}</span>
                    <span className="rounded-sm border px-2 py-0.5 text-xs font-semibold text-primary">
                      {account.role}
                    </span>
                  </div>
                  <div className="mt-2 text-muted-foreground">{account.email}</div>
                  <div className="font-mono text-xs text-muted-foreground">{account.password}</div>
                </div>
              ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
