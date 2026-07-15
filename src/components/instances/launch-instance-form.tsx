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
  ["Image", "ubuntu-24.04-server"],
  ["Flavor", "m1.medium - 2 vCPU / 8 GB RAM"],
  ["Network", "private-app-net"],
  ["Security group", "web-sg"],
  ["Key pair", "opencloud-admin-key"],
  ["Boot volume", "80 GB SSD"]
];

export function LaunchInstanceForm() {
  const router = useRouter();
  const [instanceName, setInstanceName] = React.useState("web-app-01");
  const [description, setDescription] = React.useState("Frontend node");
  const [availabilityZone, setAvailabilityZone] = React.useState("nova-a");
  const [instanceCount, setInstanceCount] = React.useState(1);
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function createInstance(name: string) {
    const response = await fetch("/api/instances", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        image: "24.04",
        cpus: 2,
        memory: "8G",
        disk: "80G",
        description,
        availabilityZone
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
            <CardTitle>Selected launch configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {reviewRows.map(([label, value]) => (
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
            <QuotaProgress label="Instances" used={13} limit={24} />
            <QuotaProgress label="vCPUs" used={50} limit={96} />
            <QuotaProgress label="RAM" used={200} limit={384} />
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
