import { phaseNotImplemented } from "@/app/api/_utils/not-implemented";

export function DELETE() {
  return phaseNotImplemented("Volume delete API", "Phase 7", "resources:write");
}
