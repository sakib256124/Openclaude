import "server-only";
import { OpenCloudError } from "@/lib/openstack/errors";

export async function getMetrics(): Promise<never> {
  throw new OpenCloudError("TELEMETRY_UNAVAILABLE", "Telemetry integration is scheduled for Phase 8.", 501);
}
