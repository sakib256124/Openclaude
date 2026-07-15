import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({
    volumes: [],
    capability: "Multipass supports instance disks and host directory mounts; standalone block volumes are not managed."
  });
}

export async function POST() {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    { error: { code: "UNSUPPORTED_BY_MULTIPASS", message: "Choose disk size when launching a Multipass VM.", requestId: null } },
    { status: 400 }
  );
}
