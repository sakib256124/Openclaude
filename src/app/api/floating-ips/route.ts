import { phaseNotImplemented } from "@/app/api/_utils/not-implemented";

export function GET() {
  return phaseNotImplemented("Network address list API", "Phase 6");
}

export function POST() {
  return phaseNotImplemented("Network address allocation API", "Phase 6", "resources:write");
}
