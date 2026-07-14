import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { GeneralSettingsForm } from "@/components/settings/general-settings-form";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function GeneralSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasPermission(user.role, "settings:manage")) {
    redirect("/unauthorized");
  }

  const [settings, preferences] = await Promise.all([
    prisma.applicationSetting.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" }
    }),
    prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Application defaults and account-specific console preferences." />
      <GeneralSettingsForm
        initialSettings={{
          defaultPageSize: settings.defaultPageSize,
          defaultRegion: settings.defaultRegion,
          defaultProject: settings.defaultProject,
          sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
          defaultRefreshSeconds: settings.defaultRefreshSeconds,
          estimatedBillingCurrency: settings.estimatedBillingCurrency,
          dateTimeFormat: settings.dateTimeFormat
        }}
        initialPreferences={{
          sidebarCollapsed: preferences.sidebarCollapsed,
          tableDensity: preferences.tableDensity,
          reducedMotion: preferences.reducedMotion,
          defaultRefreshSeconds: preferences.defaultRefreshSeconds,
          tablePageSize: preferences.tablePageSize
        }}
      />
    </div>
  );
}
