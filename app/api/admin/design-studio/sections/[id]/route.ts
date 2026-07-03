import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireDesignStudioAccess } from "@/lib/auth/guards";
import { updateSectionSchema } from "@/lib/validations/design-studio";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDesignStudioAccess();
    const cafeId = user.cafeId;
    const { id } = await params;

    const existing = await db.cafePageSection.findFirst({
      where: { id, cafeId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateSectionSchema.parse(body);

    const section = await db.cafePageSection.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json(section);
  } catch (e: any) {
    if (e.issues) {
      return NextResponse.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
    }
    const status = e.status || 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDesignStudioAccess();
    const cafeId = user.cafeId;
    const { id } = await params;

    const existing = await db.cafePageSection.findFirst({
      where: { id, cafeId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    await db.cafePageSection.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    const status = e.status || 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
