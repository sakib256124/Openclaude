import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function VolumeDetailsPage({
  params
}: {
  params: Promise<{ volumeId: string }>;
}) {
  const { volumeId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader title="Volume details" description={`Volume ${volumeId}`} />
      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status="in-use" /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span>500 GB</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>ssd</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Zone</span><span>nova-a</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attachment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Instance</span><span>db-primary-01</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Device</span><span className="font-mono">/dev/vdb</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Attached</span><span>2026-07-12</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Snapshots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>db-primary-nightly</span><StatusBadge status="available" /></div>
            <div className="flex justify-between"><span>db-primary-weekly</span><StatusBadge status="available" /></div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
