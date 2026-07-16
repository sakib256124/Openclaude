import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      preferences: {
        select: {
          theme: true,
          sidebarCollapsed: true,
          tableDensity: true,
          reducedMotion: true,
          defaultRefreshSeconds: true,
          tablePageSize: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="View the signed-in account and workspace preferences." />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{profile?.name ?? "Unnamed user"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Email</span>
              <span className="font-mono text-xs">{profile?.email ?? user.email}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Role</span>
              <Badge className="text-foreground">{profile?.role ?? user.role}</Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Status</span>
              <Badge className={profile?.isActive ? "border-primary/40 text-primary" : "border-destructive/40 text-destructive"}>
                {profile?.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Last login</span>
              <span>{formatDate(profile?.lastLoginAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(profile?.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Updated</span>
              <span>{formatDate(profile?.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Theme</span>
              <span>{profile?.preferences?.theme ?? "dark"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Sidebar</span>
              <span>{profile?.preferences?.sidebarCollapsed ? "Collapsed" : "Expanded"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Table density</span>
              <span>{profile?.preferences?.tableDensity ?? "comfortable"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Refresh</span>
              <span>{profile?.preferences?.defaultRefreshSeconds ?? 15}s</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Page size</span>
              <span>{profile?.preferences?.tablePageSize ?? 25}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Reduced motion</span>
              <span>{profile?.preferences?.reducedMotion ? "On" : "Off"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
