import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionBadge } from "@/components/ui/connection-badge";
import { StatusBadge } from "@/components/ui/status-badge";

export default function MultipassSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Multipass Host"
        description="Demo Ubuntu host, Multipass driver, socket, and connection test overview."
        actions={<ConnectionBadge status="healthy" />}
      />
      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Display name</span><span>Ubuntu Lab</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Host</span><span>localhost</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Driver</span><span>qemu</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Daemon</span><StatusBadge status="SUCCESS" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Multipass CLI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Binary</span><span className="font-mono text-xs">multipass</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Socket</span><span className="font-mono text-xs">default</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Access secret</span><span>Encrypted</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>VM services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Instance launch</span><StatusBadge status="SUCCESS" /></div>
            <div className="flex justify-between"><span>Image catalog</span><StatusBadge status="SUCCESS" /></div>
            <div className="flex justify-between"><span>Networking</span><StatusBadge status="SUCCESS" /></div>
            <div className="flex justify-between"><span>Storage mounts</span><StatusBadge status="SUCCESS" /></div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
