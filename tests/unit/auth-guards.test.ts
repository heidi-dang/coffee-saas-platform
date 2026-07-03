import { describe, expect, it } from "vitest";
import { validateJwtSecret, canManageMenuByRole, canManageSettingsByRole, canViewOrdersByRole } from "@/lib/auth/role-access";

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
  it("CAFE_OWNER can manage menu", () => {
    expect(canManageMenuByRole("CAFE_OWNER")).toBe(true);
  });

  it("CAFE_STAFF cannot manage menu", () => {
    expect(canManageMenuByRole("CAFE_STAFF")).toBe(false);
  });

  it("CAFE_MANAGER can manage tables", () => {
    expect(canManageMenuByRole("CAFE_MANAGER")).toBe(true);
  });

  it("CAFE_OWNER can manage settings", () => {
    expect(canManageSettingsByRole("CAFE_OWNER")).toBe(true);
  });

  it("CAFE_MANAGER cannot manage settings", () => {
    expect(canManageSettingsByRole("CAFE_MANAGER")).toBe(false);
  });

  it("CAFE_STAFF cannot manage settings", () => {
    expect(canManageSettingsByRole("CAFE_STAFF")).toBe(false);
  });

  it("all roles can view orders", () => {
    expect(canViewOrdersByRole("CAFE_OWNER")).toBe(true);
    expect(canViewOrdersByRole("CAFE_STAFF")).toBe(true);
    expect(canViewOrdersByRole("CAFE_MANAGER")).toBe(true);
  });
});
