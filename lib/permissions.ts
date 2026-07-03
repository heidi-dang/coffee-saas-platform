import type { SessionUser } from "./auth";

export function isPlatformAdmin(user: SessionUser): boolean {
  return user.role === "PLATFORM_ADMIN";
}

export function isCafeOwner(user: SessionUser): boolean {
  return user.role === "CAFE_OWNER";
}

export function isCafeManager(user: SessionUser): boolean {
  return user.role === "CAFE_MANAGER";
}

export function isCafeStaff(user: SessionUser): boolean {
  return user.role === "CAFE_STAFF";
}

export function isAdminUser(user: SessionUser): boolean {
  return ["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(user.role);
}

export function canManageMenu(user: SessionUser): boolean {
  return ["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(user.role);
}

export function canManageTables(user: SessionUser): boolean {
  return ["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(user.role);
}

export function canManageSettings(user: SessionUser): boolean {
  return ["PLATFORM_ADMIN", "CAFE_OWNER"].includes(user.role);
}

export function canViewOrders(_user: SessionUser): boolean {
  return true; // All admin roles can view orders
}

export function canUpdateOrderStatus(_user: SessionUser): boolean {
  return true; // All admin roles can update status
}

export function requireCafeId(user: SessionUser): string {
  if (!user.cafeId) {
    throw new Error("User does not belong to a cafe");
  }
  return user.cafeId;
}
