-- CreateEnum
CREATE TYPE "PageSectionType" AS ENUM ('HERO', 'ABOUT', 'FEATURED_MENU', 'GALLERY', 'ANNOUNCEMENT', 'CONTACT', 'CUSTOM_TEXT');

-- CreateEnum
CREATE TYPE "PageSectionStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "CafeTheme" (
    "id" TEXT NOT NULL,
    "cafeId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#111827',
    "accentColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#111827',
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "fontFamily" TEXT NOT NULL DEFAULT 'system',
    "draftData" JSONB,
    "publishedData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CafeTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CafePageSection" (
    "id" TEXT NOT NULL,
    "cafeId" TEXT NOT NULL,
    "type" "PageSectionType" NOT NULL,
    "title" TEXT,
    "content" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "status" "PageSectionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CafePageSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CafeTheme_cafeId_key" ON "CafeTheme"("cafeId");

-- CreateIndex
CREATE INDEX "CafeTheme_cafeId_idx" ON "CafeTheme"("cafeId");

-- CreateIndex
CREATE INDEX "CafePageSection_cafeId_status_idx" ON "CafePageSection"("cafeId", "status");

-- CreateIndex
CREATE INDEX "CafePageSection_cafeId_sortOrder_idx" ON "CafePageSection"("cafeId", "sortOrder");

-- AddForeignKey
ALTER TABLE "CafeTheme" ADD CONSTRAINT "CafeTheme_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CafePageSection" ADD CONSTRAINT "CafePageSection_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
