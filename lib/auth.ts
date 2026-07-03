import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

let _jwtSecret: Uint8Array | null = null;

function getJwtSecret(): Uint8Array {
  if (_jwtSecret) return _jwtSecret;

  const secret = process.env.JWT_SECRET;
  const env = process.env.NODE_ENV;
  const appEnv = process.env.APP_ENV;

  if (env === "production" || appEnv === "test") {
    if (!secret || secret.length < 32) {
      throw new Error(
        `JWT_SECRET is required when NODE_ENV=${env} or APP_ENV=${appEnv}. Set a strong, unique JWT_SECRET (min 32 characters) in your environment.`
      );
    }
  }

  _jwtSecret = new TextEncoder().encode(
    secret || "coffee-saas-dev-secret-do-not-use-in-production"
  );
  return _jwtSecret;
}
const COOKIE_NAME = "session";
const SESSION_DURATION = 60 * 60 * 24; // 24 hours

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  cafeId: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getJwtSecret());
  return token;
}

export async function verifySession(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
