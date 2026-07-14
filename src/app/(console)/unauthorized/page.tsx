import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PhasePlaceholder } from "@/components/layout/phase-placeholder";

export default function UnauthorizedPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Unauthorized" description="Protected route handling begins in Phase 2." />
      <PhasePlaceholder
        icon={ShieldAlert}
        title="Access not available"
        description="Your current role does not allow access to this area. Server route handlers enforce the same permission checks."
      />
    </div>
  );
}
