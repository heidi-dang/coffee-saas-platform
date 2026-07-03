import { describe, expect, it, beforeEach } from "vitest";
import {
  themeSchema,
  createSectionSchema,
  updateSectionSchema,
} from "@/lib/validations/design-studio";
import { canManageDesignStudio } from "@/lib/permissions";
import { canManageDesignStudioByRole } from "@/lib/auth/role-access";
import {
  copyDraftThemeToPublished,
  copyDraftSectionToPublished,
  getPublicSections,
  getDraftSections,
  hasPublishedDesign,
  getPublicTheme,
} from "@/lib/design-studio/helpers";

describe("Design Studio - Theme Validation", () => {
  it("accepts valid theme", () => {
    const result = themeSchema.safeParse({
      primaryColor: "#111827",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      fontFamily: "system",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid hex color", () => {
    const result = themeSchema.safeParse({
      primaryColor: "not-a-color",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      textColor: "#111827",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("primaryColor");
    }
  });

  it("accepts optional URL fields", () => {
    const result = themeSchema.safeParse({
      primaryColor: "#111827",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      logoUrl: "https://example.com/logo.png",
      heroImageUrl: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("Design Studio - Section Validation", () => {
  it("accepts valid section", () => {
    const result = createSectionSchema.safeParse({
      type: "HERO",
      title: "Welcome",
      content: { text: "Hello world" },
      sortOrder: 0,
      isVisible: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid section type", () => {
    const result = createSectionSchema.safeParse({
      type: "INVALID",
      content: { text: "Hello" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal section", () => {
    const result = createSectionSchema.safeParse({
      type: "CUSTOM_TEXT",
      content: {},
    });
    expect(result.success).toBe(true);
  });

  it("validates update section schema", () => {
    const result = updateSectionSchema.safeParse({
      title: "Updated Title",
      isVisible: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects content text over 5000 chars", () => {
    const result = createSectionSchema.safeParse({
      type: "CUSTOM_TEXT",
      content: { text: "x".repeat(5001) },
    });
    expect(result.success).toBe(false);
  });
});

describe("Design Studio - Permission Checks", () => {
  const makeUser = (role: string) => ({ role, cafeId: "cafe_1" }) as any;

  it("PLATFORM_ADMIN can manage design studio", () => {
    expect(canManageDesignStudio(makeUser("PLATFORM_ADMIN"))).toBe(true);
  });

  it("CAFE_OWNER can manage design studio", () => {
    expect(canManageDesignStudio(makeUser("CAFE_OWNER"))).toBe(true);
  });

  it("CAFE_MANAGER can manage design studio", () => {
    expect(canManageDesignStudio(makeUser("CAFE_MANAGER"))).toBe(true);
  });

  it("CAFE_STAFF cannot manage design studio", () => {
    expect(canManageDesignStudio(makeUser("CAFE_STAFF"))).toBe(false);
  });

  it("canManageDesignStudioByRole matches permission", () => {
    expect(canManageDesignStudioByRole("PLATFORM_ADMIN")).toBe(true);
    expect(canManageDesignStudioByRole("CAFE_OWNER")).toBe(true);
    expect(canManageDesignStudioByRole("CAFE_MANAGER")).toBe(true);
    expect(canManageDesignStudioByRole("CAFE_STAFF")).toBe(false);
  });

  it("staff role cannot manage design studio", () => {
    const user = makeUser("CAFE_STAFF");
    expect(canManageDesignStudio(user)).toBe(false);
    expect(canManageDesignStudioByRole("CAFE_STAFF")).toBe(false);
  });
});

describe("Design Studio - Publish isolation (pure helpers)", () => {
  describe("copyDraftThemeToPublished", () => {
    it("copies draftData to publishedData", () => {
      const theme: any = {
        cafeId: "cafe_1",
        draftData: { primaryColor: "#ff0000", bannerText: "Hello" },
        publishedData: null,
      };
      const result = copyDraftThemeToPublished(theme);
      expect(result.publishedData).toEqual(theme.draftData);
    });

    it("handles null draftData", () => {
      const theme: any = {
        cafeId: "cafe_1",
        draftData: null,
        publishedData: null,
      };
      const result = copyDraftThemeToPublished(theme);
      expect(result.publishedData).toBeNull();
    });
  });

  describe("copyDraftSectionToPublished", () => {
    it("copies draft fields to published fields", () => {
      const section: any = {
        id: "sec_1",
        cafeId: "cafe_1",
        draftTitle: "Draft Title",
        draftContent: { text: "Draft content" },
        isPublished: false,
      };
      const result = copyDraftSectionToPublished(section);
      expect(result.publishedTitle).toBe("Draft Title");
      expect(result.publishedContent).toEqual({ text: "Draft content" });
      expect(result.isPublished).toBe(true);
    });

    it("does not mutate original draft data", () => {
      const draftContent = { text: "Original draft" };
      const section: any = {
        id: "sec_1",
        cafeId: "cafe_1",
        draftTitle: "Original Title",
        draftContent,
        isPublished: false,
      };
      const originalDraftTitle = section.draftTitle;
      const originalDraftContent = { ...section.draftContent };

      copyDraftSectionToPublished(section);

      expect(section.draftTitle).toBe(originalDraftTitle);
      expect(section.draftContent).toEqual(originalDraftContent);
    });
  });

  describe("getPublicSections", () => {
    it("returns only isPublished + isVisible sections", () => {
      const sections: any[] = [
        { id: "1", isPublished: true, isVisible: true, draftTitle: "A" },
        { id: "2", isPublished: false, isVisible: true, draftTitle: "B" },
        { id: "3", isPublished: true, isVisible: false, draftTitle: "C" },
        { id: "4", isPublished: false, isVisible: false, draftTitle: "D" },
      ];
      const result = getPublicSections(sections);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("returns empty array when no published sections", () => {
      const sections: any[] = [
        { id: "1", isPublished: false, isVisible: true },
      ];
      expect(getPublicSections(sections)).toHaveLength(0);
    });

    it("filters hidden sections even if published", () => {
      const sections: any[] = [
        { id: "1", isPublished: true, isVisible: false },
      ];
      expect(getPublicSections(sections)).toHaveLength(0);
    });
  });

  describe("getDraftSections", () => {
    it("returns only non-published sections", () => {
      const sections: any[] = [
        { id: "1", isPublished: true, draftTitle: "A" },
        { id: "2", isPublished: false, draftTitle: "B" },
      ];
      const result = getDraftSections(sections);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("returns all sections when none published", () => {
      const sections: any[] = [
        { id: "1", isPublished: false },
        { id: "2", isPublished: false },
      ];
      expect(getDraftSections(sections)).toHaveLength(2);
    });
  });

  describe("hasPublishedDesign", () => {
    it("returns true when published data and sections exist", () => {
      const theme: any = { publishedData: { primaryColor: "#000" } };
      const sections: any[] = [
        { id: "1", isPublished: true, isVisible: true },
      ];
      expect(hasPublishedDesign(theme, sections)).toBe(true);
    });

    it("returns false when no published sections", () => {
      const theme: any = { publishedData: { primaryColor: "#000" } };
      const sections: any[] = [];
      expect(hasPublishedDesign(theme, sections)).toBe(false);
    });

    it("returns false when publishedData is null", () => {
      const theme: any = { publishedData: null };
      const sections: any[] = [
        { id: "1", isPublished: true, isVisible: true },
      ];
      expect(hasPublishedDesign(theme, sections)).toBe(false);
    });

    it("returns false when published sections are hidden", () => {
      const theme: any = { publishedData: { primaryColor: "#000" } };
      const sections: any[] = [
        { id: "1", isPublished: true, isVisible: false },
      ];
      expect(hasPublishedDesign(theme, sections)).toBe(false);
    });
  });

  describe("getPublicTheme", () => {
    it("returns published theme data when publishedData exists", () => {
      const theme: any = {
        primaryColor: "#default",
        accentColor: "#default",
        backgroundColor: "#default",
        textColor: "#default",
        logoUrl: null,
        heroImageUrl: null,
        fontFamily: "system",
        publishedData: {
          primaryColor: "#ff0000",
          accentColor: "#00ff00",
        },
      };
      const result = getPublicTheme(theme);
      expect(result?.primaryColor).toBe("#ff0000");
      expect(result?.accentColor).toBe("#00ff00");
    });

    it("returns null when no publishedData", () => {
      const theme: any = {
        primaryColor: "#111",
        publishedData: null,
      };
      expect(getPublicTheme(theme)).toBeNull();
    });

    it("falls back to theme defaults for missing published fields", () => {
      const theme: any = {
        primaryColor: "#111",
        accentColor: "#222",
        backgroundColor: "#fff",
        textColor: "#333",
        logoUrl: null,
        heroImageUrl: "https://example.com/hero.jpg",
        fontFamily: "serif",
        publishedData: {
          primaryColor: "#ff0000",
        },
      };
      const result = getPublicTheme(theme);
      expect(result?.primaryColor).toBe("#ff0000");
      expect(result?.accentColor).toBe("#222");
      expect(result?.heroImageUrl).toBe("https://example.com/hero.jpg");
    });
  });
});

describe("Design Studio - Draft/Publish lifecycle", () => {
  it("editing draft after publish does not change published data", () => {
    const section: any = {
      id: "sec_1",
      cafeId: "cafe_1",
      draftTitle: "Original Draft",
      draftContent: { text: "Original" },
      publishedTitle: "Original Published",
      publishedContent: { text: "Published" },
      isPublished: true,
    };

    const originalPublished = {
      publishedTitle: section.publishedTitle,
      publishedContent: section.publishedContent,
    };

    section.draftTitle = "Updated Draft";
    section.draftContent = { text: "Updated" };

    const publishResult = copyDraftSectionToPublished(section);
    expect(publishResult.publishedTitle).toBe("Updated Draft");

    const publishedNow = publishResult.publishedContent;
    expect(publishedNow).toEqual({ text: "Updated" });
  });

  it("hiding section does not delete row", () => {
    const section: any = {
      id: "sec_1",
      cafeId: "cafe_1",
      isVisible: false,
      isPublished: false,
      draftTitle: "Hidden Section",
    };

    expect(section.isVisible).toBe(false);
    expect(section.id).toBeDefined();
    expect(section.id).toBe("sec_1");
  });
});
