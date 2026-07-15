import type { AppSessionUser } from "@/lib/auth";

export function isPersistableUser(user: AppSessionUser) {
  return !user.id.startsWith("local-user-");
}

export function ownerFields(user: AppSessionUser) {
  return {
    ownerUserId: isPersistableUser(user) ? user.id : null,
    ownerEmail: user.email
  };
}

export function ownedWhere(user: AppSessionUser) {
  if (user.role === "ADMIN") {
    return {};
  }

  if (isPersistableUser(user)) {
    return { OR: [{ ownerUserId: user.id }, { ownerUserId: null }] };
  }

  return { OR: [{ ownerEmail: user.email }, { ownerUserId: null }] };
}
