import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../src/lib/password";
import { hasPermission } from "../../src/lib/permissions";
import { createUserSchema, generalSettingsSchema, registerUserSchema } from "../../src/lib/validators";

describe("Phase 2 authentication and authorization helpers", () => {
  it("hashes passwords without storing plaintext and verifies matches", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(hash).not.toBe("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("enforces write and administration permissions by role", () => {
    expect(hasPermission("ADMIN", "users:manage")).toBe(true);
    expect(hasPermission("USER", "resources:write")).toBe(true);
    expect(hasPermission("VIEWER", "resources:write")).toBe(false);
  });

  it("validates user creation and application settings inputs", () => {
    expect(
      createUserSchema.safeParse({
        email: "ADMIN@EXAMPLE.COM",
        password: "long-enough-password",
        role: "ADMIN"
      }).success
    ).toBe(true);

    expect(
      generalSettingsSchema.safeParse({
        defaultPageSize: 20,
        sessionTimeoutMinutes: 60,
        defaultRefreshSeconds: 15,
        estimatedBillingCurrency: "USD",
        dateTimeFormat: "yyyy-MM-dd HH:mm"
      }).success
    ).toBe(true);

    const registeredUser = registerUserSchema.safeParse({
      name: "",
      email: "NEW@EXAMPLE.COM",
      password: "long-enough-password"
    });

    expect(registeredUser.success).toBe(true);
    if (!registeredUser.success) {
      throw new Error("Expected register user payload to be valid.");
    }
    expect(registeredUser.data).toMatchObject({
      name: undefined,
      email: "new@example.com"
    });
  });
});
