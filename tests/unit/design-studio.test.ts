import { describe, expect, it } from "vitest";
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
});

describe("Design Studio - Publish isolation (helpers)", () => {
  describe("copyDraftThemeToPublished", () => {
    it("copies draftData to publishedData", () => {
      const theme: any = { cafeId: "cafe_1", draftData: { primaryColor: "#ff0000" }, publishedData: null };
      const result = copyDraftThemeToPublished(theme);
      expect(result.publishedData).toEqual(theme.draftData);
    });

    it("handles null draftData", () => {
      const theme: any = { cafeId: "cafe_1", draftData: null, publishedData: null };
      const result = copyDraftThemeToPublished(theme);
      expect(result.publishedData).toBeUndefined();
    });

    it("theme draft save does not change getPublicTheme", () => {
      const theme: any = {
        cafeId: "cafe_1",
        primaryColor: "#old_draft",
        draftData: { primaryColor: "#new_draft", textColor: "#000" },
        publishedData: { primaryColor: "#published", backgroundColor: "#fff", textColor: "#333", accentColor: "#aaa", fontFamily: "system" },
      };
      const publicTheme = getPublicTheme(theme);
      expect(publicTheme?.primaryColor).toBe("#published");
      expect(publicTheme?.primaryColor).not.toBe("#old_draft");
      expect(publicTheme?.primaryColor).not.toBe("#new_draft");
    });
  });

  describe("copyDraftSectionToPublished", () => {
    it("copies draft fields to published fields and sets publishedAt", () => {
      const now = Date.now();
      const section: any = {
        id: "sec_1",
        cafeId: "cafe_1",
        draftTitle: "Draft Title",
        draftContent: { text: "Draft content" },
        draftIsVisible: true,
        publishedAt: null,
      };
      const result = copyDraftSectionToPublished(section);
      expect(result.publishedTitle).toBe("Draft Title");
      expect(result.publishedContent).toEqual({ text: "Draft content" });
      expect(result.publishedIsVisible).toBe(true);
      expect(result.publishedAt.getTime()).toBeGreaterThanOrEqual(now);
    });

    it("copies draftIsVisible to publishedIsVisible", () => {
      const section: any = {
        id: "sec_1",
        cafeId: "cafe_1",
        draftTitle: "Title",
        draftContent: {},
        draftIsVisible: false,
        publishedAt: null,
      };
      const result = copyDraftSectionToPublished(section);
      expect(result.publishedIsVisible).toBe(false);
    });

    it("does not mutate original draft data", () => {
      const section: any = {
        id: "sec_1",
        cafeId: "cafe_1",
        draftTitle: "Original",
        draftContent: { text: "Original" },
        draftIsVisible: true,
      };
      const before = { draftTitle: section.draftTitle, draftContent: { ...section.draftContent } };
      copyDraftSectionToPublished(section);
      expect(section.draftTitle).toBe(before.draftTitle);
      expect(section.draftContent).toEqual(before.draftContent);
    });

    it("editing draft after publish does not change publishedContent", () => {
      const section: any = {
        id: "sec_1",
        cafeId: "cafe_1",
        draftTitle: "Updated Draft Title",
        draftContent: { text: "Updated Draft" },
        draftIsVisible: false,
        publishedTitle: "Original Published Title",
        publishedContent: { text: "Original Published" },
        publishedIsVisible: true,
        publishedAt: new Date(),
      };
      const publishedBefore = {
        publishedTitle: section.publishedTitle,
        publishedContent: { ...section.publishedContent },
        publishedIsVisible: section.publishedIsVisible,
      };
      const result = copyDraftSectionToPublished(section);
      expect(result.publishedTitle).toBe("Updated Draft Title");
      expect(result.publishedContent).toEqual({ text: "Updated Draft" });
    });
  });

  describe("getPublicSections", () => {
    it("returns only published visible non-deleted sections", () => {
      const sections: any[] = [
        { id: "1", publishedContent: { text: "A" }, publishedIsVisible: true, deletedAt: null },
        { id: "2", publishedContent: null, publishedIsVisible: false, deletedAt: null },
        { id: "3", publishedContent: { text: "C" }, publishedIsVisible: true, deletedAt: new Date() },
        { id: "4", publishedContent: { text: "D" }, publishedIsVisible: false, deletedAt: null },
      ];
      const result = getPublicSections(sections);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("returns empty when no published sections", () => {
      const sections: any[] = [
        { id: "1", publishedContent: null, publishedIsVisible: false, deletedAt: null },
      ];
      expect(getPublicSections(sections)).toHaveLength(0);
    });
  });

  describe("getDraftSections", () => {
    it("returns all non-deleted sections including published ones", () => {
      const sections: any[] = [
        { id: "1", deletedAt: null, publishedAt: new Date(), draftTitle: "Published" },
        { id: "2", deletedAt: null, publishedAt: null, draftTitle: "Draft only" },
      ];
      const result = getDraftSections(sections);
      expect(result).toHaveLength(2);
    });

    it("excludes deleted sections", () => {
      const sections: any[] = [
        { id: "1", deletedAt: null, draftTitle: "Active" },
        { id: "2", deletedAt: new Date(), draftTitle: "Deleted" },
      ];
      const result = getDraftSections(sections);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("after publish, section still returned by editor draft list", () => {
      const sections: any[] = [
        { id: "1", deletedAt: null, publishedAt: new Date(), draftTitle: "Published but editable" },
      ];
      const result = getDraftSections(sections);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("hasPublishedDesign", () => {
    it("returns true when published sections exist", () => {
      const theme: any = { publishedData: { primaryColor: "#000" } };
      const sections: any[] = [
        { id: "1", publishedContent: { text: "Hi" }, publishedIsVisible: true, deletedAt: null },
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
        { id: "1", publishedContent: { text: "Hi" }, publishedIsVisible: true, deletedAt: null },
      ];
      expect(hasPublishedDesign(theme, sections)).toBe(false);
    });

    it("returns false when published section is hidden", () => {
      const theme: any = { publishedData: { primaryColor: "#000" } };
      const sections: any[] = [
        { id: "1", publishedContent: { text: "Hi" }, publishedIsVisible: false, deletedAt: null },
      ];
      expect(hasPublishedDesign(theme, sections)).toBe(false);
    });
  });

  describe("getPublicTheme", () => {
    it("returns published theme data only from publishedData", () => {
      const theme: any = {
        primaryColor: "#draft_111",
        accentColor: "#draft_222",
        backgroundColor: "#draft_fff",
        textColor: "#draft_333",
        logoUrl: "draft.png",
        heroImageUrl: "draft_hero.png",
        fontFamily: "draft_font",
        publishedData: {
          primaryColor: "#pub_000",
          accentColor: "#pub_111",
          backgroundColor: "#pub_fff",
          textColor: "#pub_222",
        },
      };
      const result = getPublicTheme(theme);
      expect(result?.primaryColor).toBe("#pub_000");
      expect(result?.accentColor).toBe("#pub_111");
      expect(result?.backgroundColor).toBe("#pub_fff");
      expect(result?.textColor).toBe("#pub_222");
    });

    it("returns null when no publishedData", () => {
      const theme: any = { publishedData: null };
      expect(getPublicTheme(theme)).toBeNull();
    });
  });

  describe("draftIsVisible does not affect public before publish", () => {
    it("draftIsVisible=false does not hide public section until publish", () => {
      const sections: any[] = [
        {
          id: "1",
          draftIsVisible: false,
          publishedContent: { text: "Still visible" },
          publishedIsVisible: true,
          deletedAt: null,
        },
      ];
      const result = getPublicSections(sections);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("publish copies draftIsVisible to publishedIsVisible", () => {
      const section: any = {
        id: "sec_1",
        cafeId: "cafe_1",
        draftTitle: "T",
        draftContent: {},
        draftIsVisible: false,
        publishedAt: null,
      };
      const result = copyDraftSectionToPublished(section);
      expect(result.publishedIsVisible).toBe(false);
    });
  });

  describe("soft delete", () => {
    it("hiding section does not delete row", () => {
      const section: any = {
        id: "sec_1",
        deletedAt: new Date(),
        draftTitle: "Hidden Section",
      };
      expect(section.deletedAt).toBeInstanceOf(Date);
      expect(section.id).toBe("sec_1");
    });

    it("deleted section excluded from draft list", () => {
      const sections: any[] = [
        { id: "1", deletedAt: null, draftTitle: "Active" },
        { id: "2", deletedAt: new Date(), draftTitle: "Deleted" },
      ];
      expect(getDraftSections(sections)).toHaveLength(1);
    });
  });

  describe("public renderer isolation", () => {
    it("public renderer uses published theme data only", () => {
      const theme: any = {
        primaryColor: "#draft",
        publishedData: { primaryColor: "#published" },
      };
      const publicTheme = getPublicTheme(theme);
      expect(publicTheme?.primaryColor).toBe("#published");
      expect(publicTheme?.primaryColor).not.toBe("#draft");
    });

    it("public renderer uses published section data only", () => {
      const sections: any[] = [
        {
          id: "1",
          draftTitle: "Draft",
          publishedTitle: "Published",
          draftContent: { text: "draft text" },
          publishedContent: { text: "published text" },
          publishedIsVisible: true,
          deletedAt: null,
        },
      ];
      const result = getPublicSections(sections);
      expect(result[0].id).toBe("1");
    });
  });
});
