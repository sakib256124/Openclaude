import Link from "next/link";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { LogoMark } from "@/components/layout/logo-mark";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-md rounded-lg border bg-card p-8 shadow-2xl shadow-black/30">
        <div className="mb-8 flex items-center gap-3">
          <LogoMark />
          <div>
            <h1 className="text-xl font-semibold">Reset your password</h1>
            <p className="text-sm text-muted-foreground">Create a secure reset link for your account.</p>
          </div>
        </div>
        <ForgotPasswordForm />
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>Remembered it?</span>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
