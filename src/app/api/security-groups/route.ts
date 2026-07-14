import { phaseNotImplemented } from "@/app/api/_utils/not-implemented";

export function GET() {
  return phaseNotImplemented("Security group list API", "Phase 6");
}

export function POST() {
  return phaseNotImplemented("Security group create API", "Phase 6", "resources:write");
}
