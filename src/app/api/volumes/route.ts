import { phaseNotImplemented } from "@/app/api/_utils/not-implemented";

export function GET() {
  return phaseNotImplemented("Volume list API", "Phase 7");
}

export function POST() {
  return phaseNotImplemented("Volume create API", "Phase 7", "resources:write");
}
