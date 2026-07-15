import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { multipassErrorResponse } from "@/app/api/_utils/multipass";
import { recordInstanceAction } from "@/lib/cloud/instances";
import { OpenCloudError } from "@/lib/multipass/errors";
import { runLocalInstanceAction } from "@/lib/multipass/local-store";
import { runMultipassInstanceAction } from "@/lib/multipass/multipass-cli";
import { normalizeMultipassName } from "@/lib/multipass/normalizers";

const actionSchema = z.object({
  action: z.enum(["start", "stop", "restart", "suspend"])
});

type Params = {
  params: Promise<{ instanceId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { instanceId } = await params;
  const name = normalizeMultipassName(instanceId);
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));

  if (!name || !parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid Multipass action request.", requestId: null } }, { status: 400 });
  }

  try {
    const instance = await runMultipassInstanceAction(name, parsed.data.action);
    await recordInstanceAction({ name, runtime: instance });
    return NextResponse.json({ instance });
  } catch (error) {
    if (error instanceof OpenCloudError && error.code === "SERVICE_UNAVAILABLE") {
      const instance = runLocalInstanceAction(name, parsed.data.action);

      if (!instance) {
        return NextResponse.json({ error: { code: "NOT_FOUND", message: "Instance was not found.", requestId: null } }, { status: 404 });
      }

      await recordInstanceAction({ name, runtime: instance });
      return NextResponse.json({ source: "local", instance });
    }

    return multipassErrorResponse(error);
  }
}
