-- CreateTable
CREATE TABLE "LoyaltyProfile" (
    "id" TEXT NOT NULL,
    "cafeId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "stampsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoyaltyProfile_cafeId_phone_idx" ON "LoyaltyProfile"("cafeId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyProfile_cafeId_phone_key" ON "LoyaltyProfile"("cafeId", "phone");

-- AddForeignKey
ALTER TABLE "LoyaltyProfile" ADD CONSTRAINT "LoyaltyProfile_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
