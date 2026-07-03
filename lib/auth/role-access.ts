export function validateJwtSecret(
  secret: string | undefined,
  env: string,
  appEnv?: string
): string | null {
  if (env === "production" || appEnv === "test") {
    if (!secret || secret.length < 32) {
      return "JWT_SECRET is required";
    }
  }
  return null;
}

export function canManageMenuByRole(role: string): boolean {
  return ["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(role);
}

export function canManageSettingsByRole(role: string): boolean {
  return ["PLATFORM_ADMIN", "CAFE_OWNER"].includes(role);
}

export function canManageTablesByRole(role: string): boolean {
  return ["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(role);
}

export function canViewOrdersByRole(_role: string): boolean {
  return true;
}
