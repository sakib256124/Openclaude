import { CheckCircle2, Circle } from "lucide-react";
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

const basicFields = [
  ["Instance name", "web-demo-03"],
  ["Description", "Frontend demo node"],
  ["Availability zone", "nova-a"],
  ["Number of instances", "1"]
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
  return (
    <section className="grid gap-4 xl:grid-cols-[300px_1fr]">
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
            {basicFields.map(([label, value]) => (
              <label key={label} className="space-y-[7px] text-[13px] font-semibold leading-[18px]">
                <span>{label}</span>
                <input
                  className="h-[42px] w-full rounded-md border bg-background px-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
                  value={value}
                  readOnly
                />
              </label>
            ))}
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
        <div className="flex justify-end">
          <Button size="lg">
            Review and Launch
          </Button>
        </div>
      </div>
    </section>
  );
}
