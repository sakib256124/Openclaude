import "server-only";
import { OpenCloudError } from "@/lib/openstack/errors";

export async function listNetworks(): Promise<never> {
  throw new OpenCloudError("SERVICE_UNAVAILABLE", "Neutron integration is scheduled for Phase 6.", 501);
}
