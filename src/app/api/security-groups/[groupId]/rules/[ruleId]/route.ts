import { phaseNotImplemented } from "@/app/api/_utils/not-implemented";

export function DELETE() {
  return phaseNotImplemented("Security group rule delete API", "Phase 6", "resources:write");
}
