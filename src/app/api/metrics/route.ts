import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { multipassErrorResponse } from "@/app/api/_utils/multipass";
import { listMultipassInstances } from "@/lib/multipass/multipass-cli";

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const instances = await listMultipassInstances();

    return NextResponse.json({
      source: "multipass",
      metrics: {
        totalInstances: instances.length,
        runningInstances: instances.filter((instance) => instance.state === "Running").length,
        stoppedInstances: instances.filter((instance) => instance.state !== "Running").length
      }
    });
  } catch (error) {
    return multipassErrorResponse(error);
  }
}
