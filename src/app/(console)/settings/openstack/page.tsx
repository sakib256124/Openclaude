import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionBadge } from "@/components/ui/connection-badge";
import { StatusBadge } from "@/components/ui/status-badge";

export default function OpenStackSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cloud Connection"
        description="Demo Keystone application credential setup, secret rotation, and connection test overview."
        actions={<ConnectionBadge status="healthy" />}
      />
      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Display name</span><span>OpenCloud Lab</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span>RegionOne</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Interface</span><span>public</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">TLS verify</span><StatusBadge status="SUCCESS" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Keystone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Auth URL</span><span className="font-mono text-xs">https://openstack.example.com:5000/v3</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Credential ID</span><span className="font-mono text-xs">appcred-demo-7421</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Secret</span><span>Encrypted</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service catalog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Nova</span><StatusBadge status="SUCCESS" /></div>
            <div className="flex justify-between"><span>Glance</span><StatusBadge status="SUCCESS" /></div>
            <div className="flex justify-between"><span>Neutron</span><StatusBadge status="SUCCESS" /></div>
            <div className="flex justify-between"><span>Cinder</span><StatusBadge status="SUCCESS" /></div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
