-- Step 1: Drop old index
DROP INDEX IF EXISTS "CafePageSection_cafeId_isPublished_idx";

-- Step 2: Add new columns as nullable/default
ALTER TABLE "CafePageSection"
  ADD COLUMN "draftIsVisible" BOOLEAN DEFAULT true,
  ADD COLUMN "publishedIsVisible" BOOLEAN DEFAULT false,
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Step 3: Migrate existing data
UPDATE "CafePageSection"
SET
  "draftIsVisible" = "isVisible",
  "publishedIsVisible" = CASE WHEN "isPublished" = true THEN true ELSE false END,
  "publishedAt" = CASE WHEN "isPublished" = true THEN NOW() ELSE NULL END;

-- Step 4: Set NOT NULL after data migration
ALTER TABLE "CafePageSection" ALTER COLUMN "draftIsVisible" SET NOT NULL;
ALTER TABLE "CafePageSection" ALTER COLUMN "publishedIsVisible" SET NOT NULL;

-- Step 5: Drop old columns
ALTER TABLE "CafePageSection"
  DROP COLUMN "isVisible",
  DROP COLUMN "isPublished";

-- Step 6: Create new indexes
CREATE INDEX "CafePageSection_cafeId_publishedAt_idx" ON "CafePageSection"("cafeId", "publishedAt");
CREATE INDEX "CafePageSection_cafeId_deletedAt_idx" ON "CafePageSection"("cafeId", "deletedAt");
