import "server-only";
import { OpenCloudError } from "@/lib/openstack/errors";

export async function listImages(): Promise<never> {
  throw new OpenCloudError("SERVICE_UNAVAILABLE", "Glance integration is scheduled for Phase 5.", 501);
}
