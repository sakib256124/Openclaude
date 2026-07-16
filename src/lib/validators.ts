import { z } from "zod";

export const multipassDriverSchema = z.enum(["qemu", "lxd", "hyperv", "virtualbox"]);
export const roleSchema = z.enum(["ADMIN", "DEVELOPER", "USER", "VIEWER"]);

const optionalNameSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).max(120).optional()
);
const optionalNullableNameSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).max(120).nullable().optional()
);
const emailSchema = z.string().trim().email().max(255).transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(12).max(128);

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.string().min(1),
  CREDENTIAL_ENCRYPTION_KEY: z.string().min(32),
  MULTIPASS_DEFAULT_HOST: z.string().default("localhost"),
  MULTIPASS_DEFAULT_DRIVER: multipassDriverSchema.default("qemu"),
  MULTIPASS_BIN: z.string().default("multipass"),
  MULTIPASS_DEFAULT_IMAGE: z.string().default("24.04"),
  MULTIPASS_DEFAULT_CPUS: z.coerce.number().int().positive().default(1),
  MULTIPASS_DEFAULT_MEMORY: z.string().default("2G"),
  MULTIPASS_DEFAULT_DISK: z.string().default("10G"),
  MULTIPASS_SOCKET_PATH: z.string().optional(),
  MULTIPASS_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  MULTIPASS_LAUNCH_TIMEOUT_MS: z.coerce.number().int().positive().default(180_000),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(120)
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const createUserSchema = z.object({
  name: optionalNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema.default("DEVELOPER"),
  isActive: z.boolean().default(true)
});

export const registerUserSchema = z.object({
  name: optionalNameSchema,
  email: emailSchema,
  password: passwordSchema
});

export const updateUserSchema = z.object({
  name: optionalNullableNameSchema,
  email: emailSchema.optional(),
  role: roleSchema.optional(),
  isActive: z.boolean().optional()
});

export const resetPasswordSchema = z.object({
  password: passwordSchema
});

export const generalSettingsSchema = z.object({
  defaultPageSize: z.coerce.number().int().min(5).max(100),
  defaultRegion: z.string().trim().max(120).nullable().optional(),
  defaultProject: z.string().trim().max(120).nullable().optional(),
  sessionTimeoutMinutes: z.coerce.number().int().min(15).max(24 * 60),
  defaultRefreshSeconds: z.coerce.number().int().min(5).max(3600),
  estimatedBillingCurrency: z.string().trim().min(3).max(3),
  dateTimeFormat: z.string().trim().min(3).max(80),
  notificationDefaults: z.record(z.boolean()).optional()
});

export const userPreferenceSchema = z.object({
  sidebarCollapsed: z.boolean().optional(),
  expandedNavigation: z.record(z.boolean()).optional(),
  tableDensity: z.enum(["compact", "comfortable", "spacious"]).optional(),
  visibleTableColumns: z.record(z.array(z.string())).optional(),
  defaultFilters: z.record(z.unknown()).optional(),
  notificationPreferences: z.record(z.boolean()).optional(),
  reducedMotion: z.boolean().optional(),
  defaultLaunchChoices: z.record(z.unknown()).optional(),
  defaultRefreshSeconds: z.coerce.number().int().min(5).max(3600).optional(),
  tablePageSize: z.coerce.number().int().min(5).max(100).optional()
});
