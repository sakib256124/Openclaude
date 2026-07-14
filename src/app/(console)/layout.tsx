import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ConsoleLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const notificationCount = await prisma.notification.count({
    where: { userId: user.id, readAt: null }
  });

  return (
    <AppShell user={user} notificationCount={notificationCount}>
      {children}
    </AppShell>
  );
}
