import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import type { Permission } from "@/lib/permissions";

export async function phaseNotImplemented(
  feature: string,
  phase: string,
  permission: Permission = "resources:read"
) {
  const auth = await requireApiPermission(permission);

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    {
      error: {
        code: "PHASE_NOT_IMPLEMENTED",
        message: `${feature} is planned for ${phase}.`,
        requestId: null
      }
    },
    { status: 501 }
  );
}
