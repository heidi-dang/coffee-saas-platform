import { requireSettingsAccess } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, unauthorized, notFound, serverError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireSettingsAccess();

    const cafe = await db.cafe.findUnique({
      where: { id: user.cafeId },
      include: { settings: true },
    });
    if (!cafe) {
      return notFound("Cafe not found");
    }

    return ok({ cafe, settings: cafe.settings });
  } catch (error: any) {
    if (error.name === "AuthError") {
      return unauthorized(error.message);
    }
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSettingsAccess();

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
    if (body.acceptDineIn !== undefined) settingsData.acceptDineIn = body.acceptDineIn;
    if (body.acceptTakeaway !== undefined) settingsData.acceptTakeaway = body.acceptTakeaway;
    if (body.acceptPickup !== undefined) settingsData.acceptPickup = body.acceptPickup;
    if (body.acceptPayAtCounter !== undefined) settingsData.acceptPayAtCounter = body.acceptPayAtCounter;
    if (body.acceptOnlinePayment !== undefined) settingsData.acceptOnlinePayment = body.acceptOnlinePayment;

    if (Object.keys(settingsData).length > 0) {
      await db.cafeSettings.upsert({
        where: { cafeId: user.cafeId },
        update: settingsData,
        create: { cafeId: user.cafeId, ...settingsData },
      });
    }

    return ok({ success: true });
  } catch (error: any) {
    if (error.name === "AuthError") {
      return unauthorized(error.message);
    }
    return serverError(error);
  }
}
