-- CreateTable
CREATE TABLE "OrderFeedback" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderFeedback_orderId_key" ON "OrderFeedback"("orderId");

-- AddForeignKey
ALTER TABLE "OrderFeedback" ADD CONSTRAINT "OrderFeedback_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
