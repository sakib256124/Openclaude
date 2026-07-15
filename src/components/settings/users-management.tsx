"use client";

import * as React from "react";
import { Check, KeyRound, Pencil, Plus, Search, ShieldCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "DEVELOPER" | "USER" | "VIEWER";
  isActive: boolean;
  lastLoginAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  activityCount: number;
};

type DraftUser = {
  name: string;
  email: string;
  password: string;
  role: ManagedUser["role"];
  isActive: boolean;
};

const emptyDraft: DraftUser = {
  name: "",
  email: "",
  password: "",
  role: "DEVELOPER",
  isActive: true
};

function formatDate(value: string | Date | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function UsersManagement({
  initialUsers,
  currentUserId
}: {
  initialUsers: ManagedUser[];
  currentUserId: string;
}) {
  const [users, setUsers] = React.useState(initialUsers);
  const [draft, setDraft] = React.useState<DraftUser>(emptyDraft);
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [activeFilter, setActiveFilter] = React.useState("ALL");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDrafts, setEditDrafts] = React.useState<Record<string, { name: string; email: string; role: ManagedUser["role"] }>>({});
  const [message, setMessage] = React.useState<string | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesQuery = `${user.name ?? ""} ${user.email}`.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesActive =
      activeFilter === "ALL" ||
      (activeFilter === "ACTIVE" && user.isActive) ||
      (activeFilter === "INACTIVE" && !user.isActive);

    return matchesQuery && matchesRole && matchesActive;
  });

  async function refreshUsers() {
    const response = await fetch("/api/users");
    const payload = (await response.json()) as { users: ManagedUser[] };
    setUsers(payload.users);
  }

  function startEditing(user: ManagedUser) {
    setEditingId(user.id);
    setEditDrafts((current) => ({
      ...current,
      [user.id]: {
        name: user.name ?? "",
        email: user.email,
        role: user.role
      }
    }));
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });

    if (!response.ok) {
      const payload = await response.json();
      setMessage(payload.error?.message ?? "Unable to create user.");
      return;
    }

    setDraft(emptyDraft);
    await refreshUsers();
    setMessage("User created.");
  }

  async function updateUser(user: ManagedUser, patch: Partial<ManagedUser>) {
    setMessage(null);

    if (patch.isActive === false && user.isActive) {
      const confirmed = window.confirm(`Disable ${user.email}? They will no longer be able to sign in.`);

      if (!confirmed) {
        return;
      }
    }

    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error?.message ?? "Unable to update user.");
      return;
    }

    await refreshUsers();
    setEditingId(null);
    setMessage("User updated.");
  }

  async function resetPassword(user: ManagedUser) {
    const password = window.prompt(`Enter a new temporary password for ${user.email}. Minimum 12 characters.`);

    if (!password) {
      return;
    }

    const response = await fetch(`/api/users/${user.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const payload = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Password reset." : payload.error?.message ?? "Unable to reset password.");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create user</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_160px_120px_auto]" onSubmit={createUser}>
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-primary focus:ring-2"
              placeholder="Name"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            />
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-primary focus:ring-2"
              placeholder="Email"
              type="email"
              value={draft.email}
              onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
              required
            />
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-primary focus:ring-2"
              placeholder="Temp password"
              type="password"
              value={draft.password}
              onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))}
              required
            />
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-primary focus:ring-2"
              value={draft.role}
              onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value as DraftUser["role"] }))}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="DEVELOPER">DEVELOPER</option>
              <option value="USER">USER</option>
              <option value="VIEWER">VIEWER</option>
            </select>
            <Button>
              <Plus />
              Create
            </Button>
          </form>
          {message ? <div className="mt-3 text-sm text-muted-foreground">{message}</div> : null}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2"
            placeholder="Search users"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-primary focus:ring-2"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="ALL">All roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="DEVELOPER">DEVELOPER</option>
          <option value="USER">USER</option>
          <option value="VIEWER">VIEWER</option>
        </select>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-primary focus:ring-2"
          value={activeFilter}
          onChange={(event) => setActiveFilter(event.target.value)}
        >
          <option value="ALL">All states</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="hidden grid-cols-[1.4fr_110px_110px_180px_110px_260px] border-b px-4 py-3 text-xs font-semibold uppercase text-muted-foreground lg:grid">
          <div>User</div>
          <div>Role</div>
          <div>Status</div>
          <div>Last login</div>
          <div>Activity</div>
          <div>Actions</div>
        </div>
        {filteredUsers.map((user) => {
          const editing = editingId === user.id;
          const editDraft = editDrafts[user.id] ?? {
            name: user.name ?? "",
            email: user.email,
            role: user.role
          };

          return (
            <div key={user.id} className="grid gap-3 border-b px-4 py-4 last:border-b-0 lg:grid-cols-[1.4fr_110px_110px_180px_110px_260px] lg:items-center">
              <div className="min-w-0">
                {editing ? (
                  <div className="grid gap-2">
                    <input
                      className="h-9 rounded-md border bg-background px-3 text-sm"
                      value={editDraft.name}
                      onChange={(event) =>
                        setEditDrafts((current) => ({
                          ...current,
                          [user.id]: { ...editDraft, name: event.target.value }
                        }))
                      }
                    />
                    <input
                      className="h-9 rounded-md border bg-background px-3 text-sm"
                      value={editDraft.email}
                      onChange={(event) =>
                        setEditDrafts((current) => ({
                          ...current,
                          [user.id]: { ...editDraft, email: event.target.value }
                        }))
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div className="truncate text-sm font-semibold">{user.name ?? "Unnamed user"}</div>
                    <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                  </>
                )}
              </div>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={editing ? editDraft.role : user.role}
                disabled={!editing}
                onChange={(event) => {
                  setEditDrafts((current) => ({
                    ...current,
                    [user.id]: { ...editDraft, role: event.target.value as ManagedUser["role"] }
                  }));
                }}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="DEVELOPER">DEVELOPER</option>
                <option value="USER">USER</option>
                <option value="VIEWER">VIEWER</option>
              </select>
              <Badge className={user.isActive ? "border-primary/40 text-primary" : "border-destructive/40 text-destructive"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
              <div className="text-sm text-muted-foreground">{formatDate(user.lastLoginAt)}</div>
              <div className="text-sm text-muted-foreground">{user.activityCount}</div>
              <div className="flex flex-wrap gap-2">
                {editing ? (
                  <Button size="sm" onClick={() => updateUser(user, editDraft)}>
                    <Check />
                    Save
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => startEditing(user)}>
                    <Pencil />
                    Edit
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => resetPassword(user)}>
                  <KeyRound />
                  Reset
                </Button>
                <Button
                  size="sm"
                  variant={user.isActive ? "destructive" : "secondary"}
                  disabled={user.id === currentUserId && user.isActive}
                  onClick={() => updateUser(user, { isActive: !user.isActive })}
                >
                  {user.isActive ? <UserX /> : <ShieldCheck />}
                  {user.isActive ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
