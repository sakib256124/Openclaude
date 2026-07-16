import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LogoMark } from "@/components/layout/logo-mark";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-md rounded-lg border bg-card p-8 shadow-2xl shadow-black/30">
        <div className="mb-8 flex items-center gap-3">
          <LogoMark />
          <div>
            <h1 className="text-xl font-semibold">Set a new password</h1>
            <p className="text-sm text-muted-foreground">Use a minimum of 5 characters.</p>
          </div>
        </div>
        <ResetPasswordForm token={params?.token ?? ""} />
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>Need another link?</span>
          <Button asChild variant="ghost" size="sm">
            <Link href="/forgot-password">Request reset</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
