import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function NetworkDetailsPage({
  params
}: {
  params: Promise<{ networkId: string }>;
}) {
  const { networkId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader title="Network details" description={`Network ${networkId}`} />
      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status="UP" /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">CIDR</span><span className="font-mono">10.10.1.0/24</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Gateway</span><span className="font-mono">10.10.1.1</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Router</span><span>router-main</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Connected ports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>web-prod-01</span><span className="font-mono text-xs">10.10.1.21</span></div>
            <div className="flex justify-between"><span>api-prod-02</span><span className="font-mono text-xs">10.10.1.34</span></div>
            <div className="flex justify-between"><span>vpn-gateway-01</span><span className="font-mono text-xs">10.10.1.10</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Allocation pools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Start</span><span className="font-mono">10.10.1.20</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">End</span><span className="font-mono">10.10.1.240</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Used ports</span><span>8</span></div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
