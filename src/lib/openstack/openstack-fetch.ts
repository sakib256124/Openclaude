import "server-only";
import { OpenCloudError } from "@/lib/openstack/errors";

export async function openStackFetch(): Promise<never> {
  throw new OpenCloudError("SERVICE_UNAVAILABLE", "OpenStack fetch integration is scheduled for Phase 3.", 501);
}
