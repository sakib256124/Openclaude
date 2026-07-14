import { PageHeader } from "@/components/layout/page-header";
import { ActivityLogView, type ActivityLogRow } from "@/components/activity/activity-log-view";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function ActivityLogsPage() {
  const user = await getCurrentUser();

  const logs: ActivityLogRow[] = user
    ? await prisma.activityLog.findMany({
        where: hasPermission(user.role, "logs:view:all") ? undefined : { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      }).then((rows) =>
        rows.map((log) => ({
          id: log.id,
          action: log.action,
          resourceType: log.resourceType,
          resourceId: log.resourceId,
          resourceName: log.resourceName,
          service: log.service,
          status: log.status,
          safeMessage: log.safeMessage,
          requestId: log.requestId,
          createdAt: log.createdAt.toISOString(),
          user: log.user
        }))
      )
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Activity logs" description="Search, filter, inspect, and export safe application audit events." />
      <ActivityLogView initialLogs={logs} />
    </div>
  );
}
