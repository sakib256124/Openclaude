import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";

export async function DELETE() {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    { error: { code: "UNSUPPORTED_BY_MULTIPASS", message: "Configure firewall rules through Ubuntu, not Multipass.", requestId: null } },
    { status: 400 }
  );
}
