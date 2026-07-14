import "server-only";
import type { ActivityStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function recordActivity(input: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  service?: string;
  status: ActivityStatus;
  safeMessage: string;
  requestId?: string;
  metadata?: Prisma.InputJsonObject;
}) {
  return prisma.activityLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      resourceName: input.resourceName,
      service: input.service,
      status: input.status,
      safeMessage: input.safeMessage,
      requestId: input.requestId,
      metadata: input.metadata
    }
  });
}
