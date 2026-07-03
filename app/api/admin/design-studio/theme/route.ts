import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireDesignStudioAccess } from "@/lib/auth/guards";
import { themeSchema } from "@/lib/validations/design-studio";

export async function GET() {
  try {
    const user = await requireDesignStudioAccess();
    const cafeId = user.cafeId;

    let theme = await db.cafeTheme.findUnique({ where: { cafeId } });

    if (!theme) {
      theme = await db.cafeTheme.create({
        data: { cafeId },
      });
    }

    return NextResponse.json(theme);
  } catch (e: any) {
    const status = e.status || 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireDesignStudioAccess();
    const cafeId = user.cafeId;

    const body = await request.json();
    const parsed = themeSchema.parse(body);

    const theme = await db.cafeTheme.upsert({
      where: { cafeId },
      update: {
        primaryColor: parsed.primaryColor,
        accentColor: parsed.accentColor,
        backgroundColor: parsed.backgroundColor,
        textColor: parsed.textColor,
        logoUrl: parsed.logoUrl || null,
        heroImageUrl: parsed.heroImageUrl || null,
        fontFamily: parsed.fontFamily ?? undefined,
        draftData: body,
      },
      create: {
        cafeId,
        ...parsed,
        logoUrl: parsed.logoUrl || null,
        heroImageUrl: parsed.heroImageUrl || null,
        draftData: body,
      },
    });

    return NextResponse.json(theme);
  } catch (e: any) {
    if (e.issues) {
      return NextResponse.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
    }
    const status = e.status || 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
