import { phaseNotImplemented } from "@/app/api/_utils/not-implemented";

export function GET() {
  return phaseNotImplemented("Floating IP list API", "Phase 6");
}

export function POST() {
  return phaseNotImplemented("Floating IP allocation API", "Phase 6", "resources:write");
}
