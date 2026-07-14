import "server-only";
import { OpenCloudError } from "@/lib/openstack/errors";

export async function listServers(): Promise<never> {
  throw new OpenCloudError("SERVICE_UNAVAILABLE", "Nova integration is scheduled for Phase 4.", 501);
}
