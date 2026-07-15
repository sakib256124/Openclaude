import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuotaProgress } from "@/components/ui/quota-progress";

export default function QuotasPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Quotas" description="Quota usage updates from created resources." />
      <Card>
        <CardHeader>
          <CardTitle>Project quota usage</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <QuotaProgress label="Instances" used={0} limit={24} />
          <QuotaProgress label="vCPUs" used={0} limit={96} />
          <QuotaProgress label="RAM" used={0} limit={384} />
        </CardContent>
      </Card>
    </div>
  );
}
