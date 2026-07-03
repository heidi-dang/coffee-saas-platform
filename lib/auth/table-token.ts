import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "fallback-secret-for-table-tokens-at-least-32-chars";

export interface SignedTokenData {
  token: string;
  timestamp: number;
}

export function generateTableSignature(cafeId: string, tableNumber: string, timestamp: number): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(`${cafeId}:${tableNumber}:${timestamp}`)
    .digest("hex");
}

export function verifyTableSignature(
  cafeId: string,
  tableNumber: string,
  timestamp: number,
  signature: string,
  expirationMs: number = 2 * 60 * 60 * 1000 // 2 hours
): boolean {
  // Check expiration
  const now = Date.now();
  if (now - timestamp > expirationMs || timestamp - now > 5 * 60 * 1000) {
    // Expired or from far future (allow 5 min clock drift)
    return false;
  }

  const expectedSignature = generateTableSignature(cafeId, tableNumber, timestamp);
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}
