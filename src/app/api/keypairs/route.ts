import { phaseNotImplemented } from "@/app/api/_utils/not-implemented";

export function GET() {
  return phaseNotImplemented("Key pair list API", "Phase 4");
}

export function POST() {
  return phaseNotImplemented("Key pair create API", "Phase 4", "resources:write");
}
