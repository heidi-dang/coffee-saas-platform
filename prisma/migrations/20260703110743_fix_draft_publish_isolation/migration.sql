-- Step 1: Add new columns as nullable
ALTER TABLE "CafePageSection"
  ADD COLUMN "draftTitle" TEXT,
  ADD COLUMN "publishedTitle" TEXT,
  ADD COLUMN "draftContent" JSONB,
  ADD COLUMN "publishedContent" JSONB,
  ADD COLUMN "isPublished" BOOLEAN DEFAULT false;

-- Step 2: Migrate existing data
UPDATE "CafePageSection"
SET
  "draftTitle" = "title",
  "draftContent" = "content",
  "publishedTitle" = CASE WHEN "status" = 'PUBLISHED' THEN "title" ELSE NULL END,
  "publishedContent" = CASE WHEN "status" = 'PUBLISHED' THEN "content" ELSE NULL END,
  "isPublished" = CASE WHEN "status" = 'PUBLISHED' THEN true ELSE false END;

-- Step 3: Set NOT NULL after data migration
ALTER TABLE "CafePageSection" ALTER COLUMN "draftContent" SET NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE "CafePageSection"
  DROP COLUMN "title",
  DROP COLUMN "content",
  DROP COLUMN "status";

-- Step 5: Drop old index and enum
DROP INDEX IF EXISTS "CafePageSection_cafeId_status_idx";
DROP TYPE IF EXISTS "PageSectionStatus";

-- Step 6: Create new index
CREATE INDEX "CafePageSection_cafeId_isPublished_idx" ON "CafePageSection"("cafeId", "isPublished");
