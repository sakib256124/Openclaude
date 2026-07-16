import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/layout/logo-mark";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

type RegisterPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const callbackUrl = params?.callbackUrl?.startsWith("/") ? params.callbackUrl : "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-md rounded-lg border bg-card p-8 shadow-2xl shadow-black/30">
        <div className="mb-8 flex items-center gap-3">
          <LogoMark />
          <div>
            <h1 className="text-xl font-semibold">Create OpenCloud account</h1>
            <p className="text-sm text-muted-foreground">Register to access the compute console.</p>
          </div>
        </div>
        <RegisterForm callbackUrl={callbackUrl} />
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>Already have an account?</span>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
