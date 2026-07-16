import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { getMultipassHealth } from "@/lib/multipass/multipass-cli";

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  const health = await getMultipassHealth();
  return NextResponse.json({ health }, { status: health.configured ? 200 : 503 });
}
