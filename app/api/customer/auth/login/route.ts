import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyCustomerPassword,
  createCustomerToken,
  setCustomerSessionCookie,
} from "@/lib/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const customer = await db.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    const passwordOk =
      customer && (await verifyCustomerPassword(password, customer.passwordHash));

    if (!customer || !passwordOk) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    const sessionToken = await createCustomerToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      isVerified: customer.isVerified,
    });

    await setCustomerSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        isVerified: customer.isVerified,
      },
    });
  } catch (err) {
    console.error("[Customer Login]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
