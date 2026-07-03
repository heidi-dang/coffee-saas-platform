import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCustomerToken, setCustomerSessionCookie } from "@/lib/customer-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get("token");
  const redirectTo = searchParams.get("redirect") || "/";

  if (!token) {
    return NextResponse.redirect(new URL("/?error=missing_token", request.url));
  }

  const customer = await db.customer.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiry: { gt: new Date() },
    },
  });

  if (!customer) {
    return NextResponse.redirect(
      new URL(`${redirectTo}?error=invalid_or_expired_token`, request.url)
    );
  }

  const updated = await db.customer.update({
    where: { id: customer.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  // Refresh session cookie with verified=true
  const sessionToken = await createCustomerToken({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    isVerified: true,
  });
  await setCustomerSessionCookie(sessionToken);

  return NextResponse.redirect(new URL(`${redirectTo}?verified=1`, request.url));
}
