import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: Request) {
  const auth = await requireApiPermission("logs:view:own");

  if (!auth.ok) {
    return auth.response;
  }

  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page") ?? "1"), 1);
  const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? "25"), 5), 100);
  const search = url.searchParams.get("search")?.trim();
  const userId = url.searchParams.get("userId")?.trim();
  const action = url.searchParams.get("action")?.trim();
  const service = url.searchParams.get("service")?.trim();
  const resourceType = url.searchParams.get("resourceType")?.trim();
  const status = url.searchParams.get("status")?.trim();

  const where: Prisma.ActivityLogWhereInput = {};

  if (hasPermission(auth.user.role, "logs:view:all")) {
    if (userId) {
      where.userId = userId;
    }
  } else {
    where.userId = auth.user.id;
  }

  if (action) {
    where.action = { contains: action, mode: "insensitive" };
  }

  if (service) {
    where.service = service;
  }

  if (resourceType) {
    where.resourceType = resourceType;
  }

  if (status === "INFO" || status === "SUCCESS" || status === "FAILURE") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { resourceType: { contains: search, mode: "insensitive" } },
      { resourceName: { contains: search, mode: "insensitive" } },
      { safeMessage: { contains: search, mode: "insensitive" } }
    ];
  }

  const [total, logs] = await prisma.$transaction([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })
  ]);

  return NextResponse.json({
    logs,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
}
