import type { CafeTheme, CafePageSection } from "@/lib/generated/prisma/client";

export function copyDraftThemeToPublished(theme: CafeTheme) {
  return {
    publishedData: theme.draftData ?? undefined,
  } as any;
}

export function copyDraftSectionToPublished(section: CafePageSection) {
  return {
    publishedTitle: section.draftTitle,
    publishedContent: section.draftContent,
    publishedIsVisible: section.draftIsVisible,
    publishedAt: new Date(),
  } as any;
}

export function getPublicSections(sections: CafePageSection[]): CafePageSection[] {
  return sections.filter(
    (s) => s.publishedContent != null && s.publishedIsVisible && s.deletedAt === null
  );
}

export function getDraftSections(sections: CafePageSection[]): CafePageSection[] {
  return sections.filter((s) => s.deletedAt === null);
}

export function getPublicTheme(theme: CafeTheme | null) {
  if (!theme?.publishedData) return null;
  const data = theme.publishedData as Record<string, unknown>;
  return {
    primaryColor: data.primaryColor as string,
    accentColor: data.accentColor as string,
    backgroundColor: data.backgroundColor as string,
    textColor: data.textColor as string,
    logoUrl: (data.logoUrl as string) ?? null,
    heroImageUrl: (data.heroImageUrl as string) ?? null,
    fontFamily: (data.fontFamily as string) ?? "system",
  };
}

export function hasPublishedDesign(theme: CafeTheme | null, sections: CafePageSection[]): boolean {
  return (
    theme?.publishedData !== null &&
    sections.some((s) => s.publishedContent != null && s.publishedIsVisible && s.deletedAt === null)
  );
}
