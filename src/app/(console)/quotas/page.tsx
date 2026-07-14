import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuotaProgress } from "@/components/ui/quota-progress";
import { demoQuotaUsage } from "@/lib/demo-data";

export default function QuotasPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Quotas" description="Demo quota checks for launch, allocation, and storage operations." />
      <Card>
        <CardHeader>
          <CardTitle>Project quota usage</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {demoQuotaUsage.map((quota) => (
            <QuotaProgress key={quota.label} {...quota} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
