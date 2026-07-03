import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireDesignStudioAccess } from "@/lib/auth/guards";
import { copyDraftThemeToPublished, copyDraftSectionToPublished } from "@/lib/design-studio/helpers";

export async function POST() {
  try {
    const user = await requireDesignStudioAccess();
    const cafeId = user.cafeId;

    const theme = await db.cafeTheme.findUnique({ where: { cafeId } });
    if (!theme) {
      return NextResponse.json({ error: "No theme found to publish" }, { status: 400 });
    }

    const draftSections = await db.cafePageSection.findMany({
      where: { cafeId, isPublished: false },
      orderBy: { sortOrder: "asc" },
    });

    await db.$transaction([
      db.cafeTheme.update({
        where: { cafeId },
        data: copyDraftThemeToPublished(theme),
      }),
      ...draftSections.map((s) =>
        db.cafePageSection.update({
          where: { id: s.id },
          data: copyDraftSectionToPublished(s),
        })
      ),
    ]);

    return NextResponse.json({ success: true, sectionCount: draftSections.length });
  } catch (e: any) {
    const status = e.status || 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
