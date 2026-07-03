import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getCustomerSession,
  generateVerificationToken,
} from "@/lib/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    if (session.isVerified) {
      return NextResponse.json({ error: "Email already verified." }, { status: 400 });
    }

    const customer = await db.customer.findUnique({ where: { id: session.id } });
    if (!customer) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.customer.update({
      where: { id: customer.id },
      data: { verificationToken, verificationTokenExpiry },
    });

    const { redirect } = (await request.json().catch(() => ({}))) as {
      redirect?: string;
    };
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `http://localhost:${process.env.PORT ?? 3000}`;
    const verifyUrl = `${appUrl}/api/customer/auth/verify?token=${verificationToken}${
      redirect ? `&redirect=${encodeURIComponent(redirect)}` : ""
    }`;

    console.log(`[Customer Resend] Verify email for ${customer.email}: ${verifyUrl}`);

    return NextResponse.json({
      success: true,
      ...(process.env.NODE_ENV !== "production" && { devVerifyToken: verificationToken }),
    });
  } catch (err) {
    console.error("[Customer Resend]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
