import crypto from "crypto";

export interface SignedTokenData {
  token: string;
  timestamp: number;
}

function getTableTokenSecret(): string | null {
  const secret = process.env.TABLE_TOKEN_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

const HEX_64 = /^[0-9a-fA-F]{64}$/;

function isValidHex64(s: string): boolean {
  return HEX_64.test(s);
}

export function generateTableSignature(cafeId: string, tableNumber: string, timestamp: number): string {
  const secret = getTableTokenSecret();
  if (!secret) {
    throw new Error("TABLE_TOKEN_SECRET is required (min 32 characters)");
  }
  return crypto
    .createHmac("sha256", secret)
    .update(`${cafeId}:${tableNumber}:${timestamp}`)
    .digest("hex");
}

export function verifyTableSignature(
  cafeId: string,
  tableNumber: string,
  timestamp: number,
  signature: string,
  expirationMs: number = 2 * 60 * 60 * 1000
): boolean {
  if (typeof signature !== "string" || typeof cafeId !== "string" || typeof tableNumber !== "string") {
    return false;
  }
  if (!Number.isFinite(timestamp)) {
    return false;
  }
  if (!isValidHex64(signature)) {
    return false;
  }
  if (signature !== signature.toLowerCase() && signature !== signature.toUpperCase()) {
    return false;
  }

  const now = Date.now();
  if (now - timestamp > expirationMs || timestamp - now > 5 * 60 * 1000) {
    return false;
  }

  let expectedSignature: string;
  try {
    expectedSignature = generateTableSignature(cafeId, tableNumber, timestamp);
  } catch {
    return false;
  }

  const sigBuf = Buffer.from(signature.toLowerCase(), "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");
  if (sigBuf.length !== expectedBuf.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}
