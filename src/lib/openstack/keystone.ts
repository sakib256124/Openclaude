import "server-only";
import { OpenCloudError } from "@/lib/openstack/errors";

export async function authenticateWithApplicationCredential(): Promise<never> {
  throw new OpenCloudError("SERVICE_UNAVAILABLE", "Keystone integration is scheduled for Phase 3.", 501);
}
