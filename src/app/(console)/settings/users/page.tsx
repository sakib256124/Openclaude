import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { UsersManagement, type ManagedUser } from "@/components/settings/users-management";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function UsersSettingsPage() {
  const user = await getCurrentUser();

  if (!user || !hasPermission(user.role, "users:manage")) {
    redirect("/unauthorized");
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { activityLogs: true }
      }
    }
  });

  const managedUsers: ManagedUser[] = users.map((managedUser) => ({
    id: managedUser.id,
    name: managedUser.name,
    email: managedUser.email,
    role: managedUser.role,
    isActive: managedUser.isActive,
    lastLoginAt: managedUser.lastLoginAt?.toISOString() ?? null,
    createdAt: managedUser.createdAt.toISOString(),
    updatedAt: managedUser.updatedAt.toISOString(),
    activityCount: managedUser._count.activityLogs
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Users and Roles" description="Manage console accounts, roles, activity, and account status." />
      <UsersManagement initialUsers={managedUsers} currentUserId={user.id} />
    </div>
  );
}
