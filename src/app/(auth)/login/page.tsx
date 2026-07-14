import { redirect } from "next/navigation";
import { LogoMark } from "@/components/layout/logo-mark";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
            <h1 className="text-xl font-semibold">OpenCloud Compute Console</h1>
            <p className="text-sm text-muted-foreground">Sign in with your OpenCloud account.</p>
          </div>
        </div>
        <LoginForm callbackUrl={callbackUrl} />
      </section>
    </main>
  );
}
