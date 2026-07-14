import {
  Activity,
  BarChart3,
  Camera,
  CloudCog,
  CreditCard,
  Gauge,
  Globe2,
  HardDrive,
  Images,
  KeyRound,
  LayoutDashboard,
  Network,
  Plus,
  Server,
  Settings,
  Shield,
  SlidersHorizontal,
  UserCog
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavigationGroup = {
  id: string;
  label: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    id: "primary",
    label: "Primary",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/instances", label: "Instances", icon: Server },
      { href: "/instances/launch", label: "Launch Instance", icon: Plus }
    ]
  },
  {
    id: "compute",
    label: "Compute",
    items: [
      { href: "/images", label: "Images", icon: Images },
      { href: "/key-pairs", label: "Key Pairs", icon: KeyRound },
      { href: "/snapshots", label: "Snapshots", icon: Camera }
    ]
  },
  {
    id: "network",
    label: "Network",
    items: [
      { href: "/networks", label: "Networks", icon: Network },
      { href: "/floating-ips", label: "Floating IPs", icon: Globe2 },
      { href: "/security-groups", label: "Security Groups", icon: Shield }
    ]
  },
  {
    id: "storage",
    label: "Storage",
    items: [
      { href: "/volumes", label: "Volumes", icon: HardDrive },
      { href: "/volume-snapshots", label: "Volume Snapshots", icon: Camera }
    ]
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/monitoring", label: "Monitoring", icon: BarChart3 },
      { href: "/billing", label: "Billing", icon: CreditCard },
      { href: "/activity-logs", label: "Activity Logs", icon: Activity },
      { href: "/quotas", label: "Quotas", icon: Gauge }
    ]
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { href: "/settings/openstack", label: "Cloud Connection", icon: CloudCog },
      { href: "/settings/users", label: "Users and Roles", icon: UserCog },
      { href: "/settings/general", label: "Settings", icon: Settings },
      { href: "/settings/general#preferences", label: "Preferences", icon: SlidersHorizontal }
    ]
  }
];
