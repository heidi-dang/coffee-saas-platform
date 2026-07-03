import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const CUSTOMER_COOKIE_NAME = "customer_session";
const CUSTOMER_SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days

let _jwtSecret: Uint8Array | null = null;

function getJwtSecret(): Uint8Array {
  if (_jwtSecret) return _jwtSecret;
  const secret = process.env.JWT_SECRET;
  _jwtSecret = new TextEncoder().encode(
    secret || "coffee-saas-dev-secret-do-not-use-in-production"
  );
  return _jwtSecret;
}

export interface CustomerSession {
  id: string;
  email: string;
  name: string | null;
  isVerified: boolean;
}

export async function hashCustomerPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyCustomerPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createCustomerToken(
  customer: CustomerSession
): Promise<string> {
  return new SignJWT({ ...customer, _type: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CUSTOMER_SESSION_DURATION}s`)
    .sign(getJwtSecret());
}

export async function verifyCustomerToken(
  token: string
): Promise<CustomerSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload._type !== "customer") return null;
    return payload as unknown as CustomerSession;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export async function setCustomerSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CUSTOMER_SESSION_DURATION,
    path: "/",
  });
}

export async function clearCustomerSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
}

export function generateVerificationToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}
