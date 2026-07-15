import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({
    floatingIps: [],
    capability: "Multipass exposes private/NAT addresses from each VM; floating IP allocation is not managed."
  });
}

export async function POST() {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    { error: { code: "UNSUPPORTED_BY_MULTIPASS", message: "Multipass does not allocate floating IPs.", requestId: null } },
    { status: 400 }
  );
}
