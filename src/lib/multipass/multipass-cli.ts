import "server-only";
import { OpenCloudError } from "@/lib/multipass/errors";

export async function runMultipassCommand(): Promise<never> {
  throw new OpenCloudError("SERVICE_UNAVAILABLE", "Multipass CLI integration is scheduled for Phase 3.", 501);
}
