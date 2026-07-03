import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hashCustomerPassword,
  createCustomerToken,
  setCustomerSessionCookie,
  generateVerificationToken,
} from "@/lib/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await db.customer.findUnique({
      where: { email: emailLower },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    const passwordHash = await hashCustomerPassword(password);
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const customer = await db.customer.create({
      data: {
        email: emailLower,
        name: name?.trim() || null,
        passwordHash,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // In production, send an actual email here.
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `http://localhost:${process.env.PORT ?? 3000}`;
    const verifyUrl = `${appUrl}/api/customer/auth/verify?token=${verificationToken}`;
    console.log(`[Customer Signup] Verify email for ${emailLower}: ${verifyUrl}`);

    // Set session immediately (unverified)
    const sessionToken = await createCustomerToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      isVerified: false,
    });
    await setCustomerSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        isVerified: false,
      },
      // Only expose in non-production for dev convenience
      ...(process.env.NODE_ENV !== "production" && { devVerifyToken: verificationToken }),
    });
  } catch (err) {
    console.error("[Customer Signup]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
