import "server-only";
import { OpenCloudError } from "@/lib/openstack/errors";

export async function listVolumes(): Promise<never> {
  throw new OpenCloudError("SERVICE_UNAVAILABLE", "Cinder integration is scheduled for Phase 7.", 501);
}
