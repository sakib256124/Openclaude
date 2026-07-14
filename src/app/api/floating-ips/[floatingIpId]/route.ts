import { phaseNotImplemented } from "@/app/api/_utils/not-implemented";

export function PATCH() {
  return phaseNotImplemented("Floating IP association API", "Phase 6", "resources:write");
}

export function DELETE() {
  return phaseNotImplemented("Floating IP release API", "Phase 6", "resources:write");
}
