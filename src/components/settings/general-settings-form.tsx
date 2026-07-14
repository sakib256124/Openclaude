"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type GeneralSettings = {
  defaultPageSize: number;
  defaultRegion: string | null;
  defaultProject: string | null;
  sessionTimeoutMinutes: number;
  defaultRefreshSeconds: number;
  estimatedBillingCurrency: string;
  dateTimeFormat: string;
};

type UserPreferences = {
  sidebarCollapsed: boolean;
  tableDensity: string;
  reducedMotion: boolean;
  defaultRefreshSeconds: number;
  tablePageSize: number;
};

export function GeneralSettingsForm({
  initialSettings,
  initialPreferences
}: {
  initialSettings: GeneralSettings;
  initialPreferences: UserPreferences;
}) {
  const [settings, setSettings] = React.useState(initialSettings);
  const [preferences, setPreferences] = React.useState(initialPreferences);
  const [message, setMessage] = React.useState<string | null>(null);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/settings/general", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });

    setMessage(response.ok ? "Settings saved." : "Unable to save settings.");
  }

  async function savePreferences(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences)
    });

    setMessage(response.ok ? "Preferences saved." : "Unable to save preferences.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Application defaults</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={saveSettings}>
            <label className="grid gap-2 text-sm">
              Default page size
              <input
                className="h-10 rounded-md border bg-background px-3"
                type="number"
                min={5}
                max={100}
                value={settings.defaultPageSize}
                onChange={(event) => setSettings((current) => ({ ...current, defaultPageSize: Number(event.target.value) }))}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Default host
              <input
                className="h-10 rounded-md border bg-background px-3"
                value={settings.defaultRegion ?? ""}
                onChange={(event) => setSettings((current) => ({ ...current, defaultRegion: event.target.value }))}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Default workspace
              <input
                className="h-10 rounded-md border bg-background px-3"
                value={settings.defaultProject ?? ""}
                onChange={(event) => setSettings((current) => ({ ...current, defaultProject: event.target.value }))}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Session timeout minutes
              <input
                className="h-10 rounded-md border bg-background px-3"
                type="number"
                min={15}
                value={settings.sessionTimeoutMinutes}
                onChange={(event) => setSettings((current) => ({ ...current, sessionTimeoutMinutes: Number(event.target.value) }))}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Refresh interval seconds
              <input
                className="h-10 rounded-md border bg-background px-3"
                type="number"
                min={5}
                value={settings.defaultRefreshSeconds}
                onChange={(event) => setSettings((current) => ({ ...current, defaultRefreshSeconds: Number(event.target.value) }))}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Estimated-billing currency
              <input
                className="h-10 rounded-md border bg-background px-3 uppercase"
                maxLength={3}
                value={settings.estimatedBillingCurrency}
                onChange={(event) => setSettings((current) => ({ ...current, estimatedBillingCurrency: event.target.value.toUpperCase() }))}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Date and time format
              <input
                className="h-10 rounded-md border bg-background px-3"
                value={settings.dateTimeFormat}
                onChange={(event) => setSettings((current) => ({ ...current, dateTimeFormat: event.target.value }))}
              />
            </label>
            <Button>
              <Save />
              Save settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={savePreferences}>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={preferences.sidebarCollapsed}
                onChange={(event) => setPreferences((current) => ({ ...current, sidebarCollapsed: event.target.checked }))}
              />
              Collapse sidebar by default
            </label>
            <label className="grid gap-2 text-sm">
              Table density
              <select
                className="h-10 rounded-md border bg-background px-3"
                value={preferences.tableDensity}
                onChange={(event) => setPreferences((current) => ({ ...current, tableDensity: event.target.value }))}
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(event) => setPreferences((current) => ({ ...current, reducedMotion: event.target.checked }))}
              />
              Reduced motion
            </label>
            <label className="grid gap-2 text-sm">
              Preferred page size
              <input
                className="h-10 rounded-md border bg-background px-3"
                type="number"
                min={5}
                max={100}
                value={preferences.tablePageSize}
                onChange={(event) => setPreferences((current) => ({ ...current, tablePageSize: Number(event.target.value) }))}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Preferred refresh seconds
              <input
                className="h-10 rounded-md border bg-background px-3"
                type="number"
                min={5}
                value={preferences.defaultRefreshSeconds}
                onChange={(event) => setPreferences((current) => ({ ...current, defaultRefreshSeconds: Number(event.target.value) }))}
              />
            </label>
            <Button variant="secondary">
              <Save />
              Save preferences
            </Button>
          </form>
          {message ? <div className="mt-3 text-sm text-muted-foreground">{message}</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
