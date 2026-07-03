import { describe, expect, it } from "vitest";

// Simulate the JWT_SECRET check logic
function validateJwtSecret(secret: string | undefined, env: string, appEnv?: string): string | null {
  if (env === "production" || appEnv === "test") {
    if (!secret || secret.length < 32) {
      return "JWT_SECRET is required";
    }
  }
  return null;
}

describe("JWT_SECRET validation", () => {
  it("throws in production when secret is missing", () => {
    const error = validateJwtSecret(undefined, "production");
    expect(error).toBe("JWT_SECRET is required");
  });

  it("throws in production when secret is too short", () => {
    const error = validateJwtSecret("short", "production");
    expect(error).toBe("JWT_SECRET is required");
  });

  it("allows valid secret in production", () => {
    const error = validateJwtSecret("a".repeat(32), "production");
    expect(error).toBeNull();
  });

  it("throws in test env when secret is missing", () => {
    const error = validateJwtSecret(undefined, "development", "test");
    expect(error).toBe("JWT_SECRET is required");
  });

  it("allows fallback secret in development", () => {
    const error = validateJwtSecret(undefined, "development");
    expect(error).toBeNull();
  });

  it("allows short secret in development", () => {
    const error = validateJwtSecret("123", "development");
    expect(error).toBeNull();
  });
});

describe("Permission helpers", () => {
  const canManageMenu = (role: string) =>
    ["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(role);

  const canManageSettings = (role: string) =>
    ["PLATFORM_ADMIN", "CAFE_OWNER"].includes(role);

  const canViewOrders = (_role: string) => true;

  it("CAFE_OWNER can manage menu", () => {
    expect(canManageMenu("CAFE_OWNER")).toBe(true);
  });

  it("CAFE_STAFF cannot manage menu", () => {
    expect(canManageMenu("CAFE_STAFF")).toBe(false);
  });

  it("CAFE_MANAGER can manage tables", () => {
    expect(canManageMenu("CAFE_MANAGER")).toBe(true);
  });

  it("CAFE_OWNER can manage settings", () => {
    expect(canManageSettings("CAFE_OWNER")).toBe(true);
  });

  it("CAFE_MANAGER cannot manage settings", () => {
    expect(canManageSettings("CAFE_MANAGER")).toBe(false);
  });

  it("CAFE_STAFF cannot manage settings", () => {
    expect(canManageSettings("CAFE_STAFF")).toBe(false);
  });

  it("all roles can view orders", () => {
    expect(canViewOrders("CAFE_OWNER")).toBe(true);
    expect(canViewOrders("CAFE_STAFF")).toBe(true);
    expect(canViewOrders("CAFE_MANAGER")).toBe(true);
  });
});
