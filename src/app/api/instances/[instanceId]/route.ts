import { phaseNotImplemented } from "@/app/api/_utils/not-implemented";

export function GET() {
  return phaseNotImplemented("Instance details API", "Phase 4");
}

export function DELETE() {
  return phaseNotImplemented("Instance delete API", "Phase 4", "resources:write");
}
