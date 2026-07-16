"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuotaProgress } from "@/components/ui/quota-progress";

const steps = [
  "Basic Information",
  "Source",
  "Compute",
  "Networking and Security",
  "Storage and Advanced Options",
  "Review and Launch"
];

const reviewRows = [
  ["Security group", "web-sg"],
  ["Key pair", "opencloud-admin-key"],
  ["Bootstrap", "User Data / cloud-init"]
];

const images = [
  { id: "24.04", os: "Ubuntu", label: "Ubuntu 24.04 LTS" },
  { id: "22.04", os: "Ubuntu", label: "Ubuntu 22.04 LTS" },
  { id: "debian", os: "Debian", label: "Debian lab image" }
];

const instanceTypes = [
  { id: "t2.micro", label: "t2.micro", purpose: "General purpose", cpus: 1, memory: "1G", disk: "10G" },
  { id: "m5.large", label: "m5.large", purpose: "Balanced web app", cpus: 2, memory: "8G", disk: "80G" },
  { id: "c5.large", label: "c5.large", purpose: "Compute optimized", cpus: 2, memory: "4G", disk: "40G" },
  { id: "r5.large", label: "r5.large", purpose: "Memory optimized", cpus: 2, memory: "16G", disk: "80G" },
  { id: "i3.large", label: "i3.large", purpose: "Storage optimized", cpus: 2, memory: "16G", disk: "120G" }
];

const defaultUserData = `#cloud-config
package_update: true
packages:
  - nginx
runcmd:
  - systemctl enable --now nginx
  - sh -c 'echo OpenCloud VM > /var/www/html/index.html'`;

export function LaunchInstanceForm() {
  const router = useRouter();
  const [instanceName, setInstanceName] = React.useState("web-app-01");
  const [description, setDescription] = React.useState("Frontend node");
  const [availabilityZone, setAvailabilityZone] = React.useState("local-a");
  const [instanceCount, setInstanceCount] = React.useState(1);
  const [image, setImage] = React.useState(images[0].id);
  const [instanceType, setInstanceType] = React.useState(instanceTypes[1].id);
  const [networkId, setNetworkId] = React.useState("vpc-local-multipass");
  const [subnetId, setSubnetId] = React.useState("subnet-local-a");
  const [securityGroupId, setSecurityGroupId] = React.useState("sg-web-default");
  const [keyPairName, setKeyPairName] = React.useState("opencloud-admin-key");
  const [cloudInit, setCloudInit] = React.useState(defaultUserData);
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const selectedImage = images.find((item) => item.id === image) ?? images[0];
  const selectedInstanceType = instanceTypes.find((item) => item.id === instanceType) ?? instanceTypes[0];
  const quotaMultiplier = Math.max(1, Math.min(10, instanceCount || 1));
  const currentReviewRows = [
    ["Image", selectedImage.label],
    [
      "Flavor",
      `${selectedInstanceType.label} - ${selectedInstanceType.cpus} vCPU / ${selectedInstanceType.memory} RAM`
    ],
    ["Network", `${networkId} / ${subnetId}`],
    ...reviewRows,
    ["Boot volume", `${selectedInstanceType.disk} SSD`]
  ];

  async function createInstance(name: string) {
    const response = await fetch("/api/instances", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        image,
        cpus: selectedInstanceType.cpus,
        memory: selectedInstanceType.memory,
        disk: selectedInstanceType.disk,
        cloudInit: cloudInit.trim() || undefined,
        description,
        availabilityZone,
        instanceType,
        operatingSystem: selectedImage.os,
        networkId,
        subnetId,
        securityGroupId,
        keyPairName
      })
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error?.message ?? "Instance launch failed.");
    }

    return data;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const count = Math.max(1, Math.min(10, instanceCount));
      const baseName = instanceName.trim();

      for (let index = 0; index < count; index += 1) {
        const nextName = count === 1 ? baseName : `${baseName}-${index + 1}`;
        await createInstance(nextName);
      }

      setMessage(`${count} instance${count > 1 ? "s" : ""} created.`);
      router.push("/instances");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Instance launch failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-4 xl:grid-cols-[300px_1fr]" onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Launch steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 text-sm leading-5 text-muted-foreground">
              {index === 0 ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}
              <span className={index === 0 ? "font-semibold text-foreground" : undefined}>{step}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-[18px] md:grid-cols-2">
            <label className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
              <span>Instance name</span>
              <input
                className="h-[42px] w-full rounded-md border bg-background px-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
                value={instanceName}
                pattern="[a-zA-Z0-9][a-zA-Z0-9-]{0,62}"
                required
                onChange={(event) => setInstanceName(event.target.value)}
              />
            </label>
            <label className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
              <span>Description</span>
              <input
                className="h-[42px] w-full rounded-md border bg-background px-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
            <label className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
              <span>Availability zone</span>
              <input
                className="h-[42px] w-full rounded-md border bg-background px-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
                value={availabilityZone}
                onChange={(event) => setAvailabilityZone(event.target.value)}
              />
            </label>
            <label className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
              <span>Number of instances</span>
              <input
                className="h-[42px] w-full rounded-md border bg-background px-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
                min={1}
                max={10}
                type="number"
                value={instanceCount}
                onChange={(event) => setInstanceCount(Number(event.target.value))}
              />
            </label>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Source and compute</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-[18px] md:grid-cols-2">
            <label className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
              <span>Operating system image</span>
              <select
                className="h-[42px] w-full rounded-md border bg-background px-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
                value={image}
                onChange={(event) => setImage(event.target.value)}
              >
                {images.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
              <span>Instance type</span>
              <select
                className="h-[42px] w-full rounded-md border bg-background px-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
                value={instanceType}
                onChange={(event) => setInstanceType(event.target.value)}
              >
                {instanceTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} - {item.purpose}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-md border bg-background p-3 text-sm">
              <div className="text-xs text-muted-foreground">Compute</div>
              <div className="mt-1 font-medium">
                {selectedInstanceType.cpus} vCPU / {selectedInstanceType.memory} RAM
              </div>
            </div>
            <div className="rounded-md border bg-background p-3 text-sm">
              <div className="text-xs text-muted-foreground">Storage</div>
              <div className="mt-1 font-medium">{selectedInstanceType.disk} boot disk</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Networking and security</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-[18px] md:grid-cols-2">
            <label className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
              <span>Network</span>
              <input
                className="h-[42px] w-full rounded-md border bg-background px-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
                value={networkId}
                onChange={(event) => setNetworkId(event.target.value)}
              />
            </label>
            <label className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
              <span>Subnet</span>
              <input
                className="h-[42px] w-full rounded-md border bg-background px-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
                value={subnetId}
                onChange={(event) => setSubnetId(event.target.value)}
              />
            </label>
            <label className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
              <span>Security group</span>
              <input
                className="h-[42px] w-full rounded-md border bg-background px-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
                value={securityGroupId}
                onChange={(event) => setSecurityGroupId(event.target.value)}
              />
            </label>
            <label className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
              <span>Key pair</span>
              <input
                className="h-[42px] w-full rounded-md border bg-background px-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
                value={keyPairName}
                onChange={(event) => setKeyPairName(event.target.value)}
              />
            </label>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Advanced options</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
              <span>User Data</span>
              <textarea
                className="min-h-[180px] w-full resize-y rounded-md border bg-background px-3 py-3 font-mono text-xs leading-5 outline-none focus:ring-2 focus:ring-ring"
                value={cloudInit}
                onChange={(event) => setCloudInit(event.target.value)}
              />
            </label>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Selected launch configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {currentReviewRows.map(([label, value]) => (
              <div key={label} className="rounded-md border bg-background p-3 text-sm">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="mt-1 font-medium">{value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quota impact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <QuotaProgress label="Instances" used={13 + quotaMultiplier} limit={24} />
            <QuotaProgress label="vCPUs" used={50 + selectedInstanceType.cpus * quotaMultiplier} limit={96} />
            <QuotaProgress label="RAM" used={200 + Number.parseInt(selectedInstanceType.memory, 10) * quotaMultiplier} limit={384} />
          </CardContent>
        </Card>
        {message ? (
          <div className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button size="lg" disabled={pending} type="submit">
            {pending ? <Loader2 className="animate-spin" /> : null}
            {pending ? "Launching" : "Review and Launch"}
          </Button>
        </div>
      </div>
    </form>
  );
}
