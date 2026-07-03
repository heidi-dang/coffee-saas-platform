import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canManageSettings } from "@/lib/permissions";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageSettings(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cafe = await db.cafe.findUnique({
    where: { id: user.cafeId },
    include: { settings: true },
  });
  if (!cafe) {
    return NextResponse.json({ error: "Cafe not found" }, { status: 404 });
  }

  return NextResponse.json({ cafe, settings: cafe.settings });
}

export async function PATCH(request: Request) {
  const user = await getSession();
  if (!user || !user.cafeId || !canManageSettings(user as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const cafeData: any = {};
  if (body.name !== undefined) cafeData.name = body.name;
  if (body.phone !== undefined) cafeData.phone = body.phone;
  if (body.address !== undefined) cafeData.address = body.address;
  if (body.logoUrl !== undefined) cafeData.logoUrl = body.logoUrl;

  if (Object.keys(cafeData).length > 0) {
    await db.cafe.update({ where: { id: user.cafeId }, data: cafeData });
  }

  const settingsData: any = {};
  if (body.acceptDineIn !== undefined)
    settingsData.acceptDineIn = body.acceptDineIn;
  if (body.acceptTakeaway !== undefined)
    settingsData.acceptTakeaway = body.acceptTakeaway;
  if (body.acceptPickup !== undefined)
    settingsData.acceptPickup = body.acceptPickup;
  if (body.acceptPayAtCounter !== undefined)
    settingsData.acceptPayAtCounter = body.acceptPayAtCounter;
  if (body.acceptOnlinePayment !== undefined)
    settingsData.acceptOnlinePayment = body.acceptOnlinePayment;

  if (Object.keys(settingsData).length > 0) {
    await db.cafeSettings.upsert({
      where: { cafeId: user.cafeId },
      update: settingsData,
      create: { cafeId: user.cafeId, ...settingsData },
    });
  }

  return NextResponse.json({ success: true });
}
