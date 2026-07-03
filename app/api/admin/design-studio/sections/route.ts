import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireDesignStudioAccess } from "@/lib/auth/guards";
import { createSectionSchema } from "@/lib/validations/design-studio";

export async function GET() {
  try {
    const user = await requireDesignStudioAccess();
    const cafeId = user.cafeId;

    const sections = await db.cafePageSection.findMany({
      where: { cafeId, draftDeletedAt: null },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(sections);
  } catch (e: any) {
    const status = e.status || 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDesignStudioAccess();
    const cafeId = user.cafeId;

    const body = await request.json();
    const parsed = createSectionSchema.parse(body);

    const section = await db.cafePageSection.create({
      data: {
        cafeId,
        type: parsed.type,
        draftTitle: parsed.title,
        draftContent: parsed.content,
        draftIsVisible: parsed.isVisible,
        sortOrder: parsed.sortOrder,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (e: any) {
    if (e.issues) {
      return NextResponse.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
    }
    const status = e.status || 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
