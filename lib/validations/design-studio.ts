import { z } from "zod";

const hexColorRegex = /^#[0-9a-fA-F]{3,8}$/;

const hexColor = z.string().regex(hexColorRegex, "Invalid hex color");

export const themeSchema = z.object({
  primaryColor: hexColor,
  accentColor: hexColor,
  backgroundColor: hexColor,
  textColor: hexColor,
  logoUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
  heroImageUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
  fontFamily: z.string().max(100).optional(),
});

export const sectionTypeEnum = z.enum([
  "HERO",
  "ABOUT",
  "FEATURED_MENU",
  "GALLERY",
  "ANNOUNCEMENT",
  "CONTACT",
  "CUSTOM_TEXT",
]);

export const sectionContentSchema = z.object({
  text: z.string().max(5000).optional().or(z.null()),
  imageUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
  buttonLabel: z.string().max(100).optional().or(z.null()),
  buttonUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
  images: z.array(z.string().url()).max(20).optional(),
});

export const createSectionSchema = z.object({
  type: sectionTypeEnum,
  title: z.string().max(200).optional().or(z.null()),
  content: sectionContentSchema,
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const updateSectionSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  content: sectionContentSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
  type: sectionTypeEnum.optional(),
});
