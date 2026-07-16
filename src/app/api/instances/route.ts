import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { multipassErrorResponse } from "@/app/api/_utils/multipass";
import { recordLaunchedInstance, syncRuntimeInstances } from "@/lib/cloud/instances";
import { OpenCloudError } from "@/lib/multipass/errors";
import { createLocalInstance, listLocalInstances } from "@/lib/multipass/local-store";
import { launchMultipassInstance, listMultipassInstances } from "@/lib/multipass/multipass-cli";

const launchSchema = z.object({
  name: z.string().trim().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,62}$/),
  image: z.string().trim().min(1).optional(),
  cpus: z.coerce.number().int().min(1).max(8).optional(),
  memory: z.string().trim().regex(/^\d+[MG]$/i).optional(),
  disk: z.string().trim().regex(/^\d+[MG]$/i).optional(),
  cloudInit: z.string().trim().min(1).max(16_000).optional(),
  description: z.string().trim().max(240).optional(),
  availabilityZone: z.string().trim().max(80).optional(),
  instanceType: z.string().trim().max(40).optional(),
  operatingSystem: z.string().trim().max(80).optional(),
  networkId: z.string().trim().max(80).optional(),
  subnetId: z.string().trim().max(80).optional(),
  securityGroupId: z.string().trim().max(80).optional(),
  keyPairName: z.string().trim().max(120).optional()
});

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const instances = await listMultipassInstances();
    return NextResponse.json({ source: "multipass", instances: await syncRuntimeInstances(auth.user, instances) });
  } catch (error) {
    if (error instanceof OpenCloudError && error.code === "SERVICE_UNAVAILABLE") {
      return NextResponse.json({ source: "local", instances: await syncRuntimeInstances(auth.user, listLocalInstances()) });
    }

    return multipassErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = launchSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: "Multipass launch details are invalid.",
          fieldErrors: parsed.error.flatten().fieldErrors,
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  try {
    const instance = await launchMultipassInstance(parsed.data);
    const record = await recordLaunchedInstance({ user: auth.user, launch: parsed.data, runtime: instance });
    return NextResponse.json(
      {
        instance: instance
          ? { ...instance, instanceId: record?.instanceId, ownerEmail: record?.ownerEmail }
          : { name: parsed.data.name, instanceId: record?.instanceId, ownerEmail: record?.ownerEmail }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof OpenCloudError && error.code === "SERVICE_UNAVAILABLE") {
      const instance = createLocalInstance(parsed.data);
      const record = await recordLaunchedInstance({ user: auth.user, launch: parsed.data, runtime: instance });
      return NextResponse.json(
        { source: "local", instance: { ...instance, instanceId: record?.instanceId, ownerEmail: record?.ownerEmail } },
        { status: 201 }
      );
    }

    return multipassErrorResponse(error);
  }
}
