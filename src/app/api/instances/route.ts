import { phaseNotImplemented } from "@/app/api/_utils/not-implemented";

export function GET() {
  return phaseNotImplemented("Instance list API", "Phase 4");
}

export function POST() {
  return phaseNotImplemented("Instance launch API", "Phase 4", "resources:write");
}
