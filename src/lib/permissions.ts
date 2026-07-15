import type { Role } from "@prisma/client";

const roleRank: Record<Role, number> = {
  VIEWER: 1,
  DEVELOPER: 2,
  USER: 2,
  ADMIN: 3
};

export type Permission =
  | "users:manage"
  | "cloud:manage"
  | "pricing:manage"
  | "logs:view:all"
  | "logs:view:own"
  | "resources:read"
  | "resources:write"
  | "settings:manage"
  | "preferences:manage";

const permissionsByRole: Record<Role, Permission[]> = {
  ADMIN: [
    "users:manage",
    "cloud:manage",
    "pricing:manage",
    "logs:view:all",
    "logs:view:own",
    "resources:read",
    "resources:write",
    "settings:manage",
    "preferences:manage"
  ],
  DEVELOPER: ["logs:view:own", "resources:read", "resources:write", "preferences:manage"],
  USER: ["logs:view:own", "resources:read", "resources:write", "preferences:manage"],
  VIEWER: ["logs:view:own", "resources:read", "preferences:manage"]
};

export function canAccessRole(userRole: Role, requiredRole: Role) {
  return roleRank[userRole] >= roleRank[requiredRole];
}

export function hasPermission(userRole: Role, permission: Permission) {
  return permissionsByRole[userRole].includes(permission);
}
