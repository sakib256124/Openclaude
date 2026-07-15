import { NextResponse } from "next/server";
import { getMultipassHealth } from "@/lib/multipass/multipass-cli";

export async function GET() {
  const health = await getMultipassHealth();
  return NextResponse.json({ health }, { status: health.configured ? 200 : 503 });
}
