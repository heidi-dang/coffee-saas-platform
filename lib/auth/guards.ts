import { getSession } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new AuthError("Unauthorized", 401);
  return user;
}

export async function requireCafeUser(): Promise<SessionUser & { cafeId: string }> {
  const user = await requireSession();
  if (!user.cafeId) throw new AuthError("User does not belong to a cafe", 403);
  return user as SessionUser & { cafeId: string };
}

export async function requireMenuAccess(): Promise<SessionUser & { cafeId: string }> {
  const user = await requireCafeUser();
  if (!["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(user.role)) {
    throw new AuthError("Forbidden", 403);
  }
  return user;
}

export async function requireTableAccess(): Promise<SessionUser & { cafeId: string }> {
  const user = await requireCafeUser();
  if (!["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(user.role)) {
    throw new AuthError("Forbidden", 403);
  }
  return user;
}

export async function requireSettingsAccess(): Promise<SessionUser & { cafeId: string }> {
  const user = await requireCafeUser();
  if (!["PLATFORM_ADMIN", "CAFE_OWNER"].includes(user.role)) {
    throw new AuthError("Forbidden", 403);
  }
  return user;
}

export async function requireOrdersAccess(): Promise<SessionUser & { cafeId: string }> {
  return requireCafeUser();
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
