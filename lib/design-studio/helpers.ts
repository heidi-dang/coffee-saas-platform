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
    isPublished: true,
  } as any;
}

export function getPublicSections(sections: CafePageSection[]): CafePageSection[] {
  return sections.filter((s) => s.isPublished && s.isVisible);
}

export function getDraftSections(sections: CafePageSection[]): CafePageSection[] {
  return sections.filter((s) => !s.isPublished);
}

export function getPublicTheme(
  theme: CafeTheme | null,
): Pick<
  CafeTheme,
  "primaryColor" | "accentColor" | "backgroundColor" | "textColor" | "logoUrl" | "heroImageUrl" | "fontFamily"
> | null {
  if (!theme?.publishedData) return null;
  const data = theme.publishedData as Record<string, unknown>;
  return {
    primaryColor: (data.primaryColor as string) || theme.primaryColor,
    accentColor: (data.accentColor as string) || theme.accentColor,
    backgroundColor: (data.backgroundColor as string) || theme.backgroundColor,
    textColor: (data.textColor as string) || theme.textColor,
    logoUrl: (data.logoUrl as string) || theme.logoUrl || null,
    heroImageUrl: (data.heroImageUrl as string) || theme.heroImageUrl || null,
    fontFamily: (data.fontFamily as string) || theme.fontFamily,
  };
}

export function hasPublishedDesign(theme: CafeTheme | null, sections: CafePageSection[]): boolean {
  return theme?.publishedData !== null && sections.some((s) => s.isPublished && s.isVisible);
}
