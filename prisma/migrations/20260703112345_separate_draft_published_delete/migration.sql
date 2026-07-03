-- Step 1: Drop old index
DROP INDEX IF EXISTS "CafePageSection_cafeId_deletedAt_idx";

-- Step 2: Add new columns
ALTER TABLE "CafePageSection"
  ADD COLUMN "draftDeletedAt" TIMESTAMP(3),
  ADD COLUMN "publishedDeletedAt" TIMESTAMP(3);

-- Step 3: Migrate existing data
UPDATE "CafePageSection"
SET
  "draftDeletedAt" = "deletedAt",
  "publishedDeletedAt" = CASE WHEN "deletedAt" IS NOT NULL AND "publishedAt" IS NOT NULL THEN "deletedAt" ELSE NULL END;

-- Step 4: Drop old column
ALTER TABLE "CafePageSection" DROP COLUMN "deletedAt";

-- Step 5: Create new indexes
CREATE INDEX "CafePageSection_cafeId_draftDeletedAt_idx" ON "CafePageSection"("cafeId", "draftDeletedAt");
CREATE INDEX "CafePageSection_cafeId_publishedDeletedAt_idx" ON "CafePageSection"("cafeId", "publishedDeletedAt");
