import { InstanceActions } from "@/components/instances/instance-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuotaProgress } from "@/components/ui/quota-progress";
import { StatusBadge } from "@/components/ui/status-badge";

export function InstanceDetails({ instanceId }: { instanceId: string }) {
  return (
    <section className="space-y-4">
      <InstanceActions />
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">UUID</dt>
              <dd className="mt-1 font-mono">{instanceId}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <StatusBadge status="ACTIVE" />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Metrics</dt>
              <dd className="mt-1">CPU 42%, RAM 58%, Disk 44%</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Flavor</dt>
              <dd className="mt-1">m1.medium - 2 vCPU / 8 GB RAM</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Image</dt>
              <dd className="mt-1">ubuntu-24.04-server</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Network</dt>
              <dd className="mt-1 font-mono">10.10.1.21 / 203.0.113.21</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Networking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Network</span><span>private-app-net</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Security group</span><span>web-sg</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Floating IP</span><span className="font-mono text-xs">203.0.113.21</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Root disk</span><span>80 GB SSD</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Attached volume</span><span>api-logs</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Snapshot</span><span>web-prod-01-pre-release</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <QuotaProgress label="CPU" used={42} limit={100} />
            <QuotaProgress label="RAM" used={58} limit={100} />
            <QuotaProgress label="Disk" used={44} limit={100} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
