-- AddCoreIndexes
-- Add composite index for order number uniqueness per cafe
CREATE UNIQUE INDEX IF NOT EXISTS "Order_cafeId_orderNumber_key" ON "Order"("cafeId", "orderNumber");

-- Add index for order queries by cafe and status
CREATE INDEX IF NOT EXISTS "Order_cafeId_status_idx" ON "Order"("cafeId", "status");

-- Add index for order queries by cafe and creation date
CREATE INDEX IF NOT EXISTS "Order_cafeId_createdAt_idx" ON "Order"("cafeId", "createdAt");

-- Add index for order queries by table
CREATE INDEX IF NOT EXISTS "Order_tableId_idx" ON "Order"("tableId");

-- Add index for menu category queries
CREATE INDEX IF NOT EXISTS "MenuCategory_cafeId_sortOrder_idx" ON "MenuCategory"("cafeId", "sortOrder");
CREATE INDEX IF NOT EXISTS "MenuCategory_cafeId_isActive_idx" ON "MenuCategory"("cafeId", "isActive");

-- Add index for menu item queries
CREATE INDEX IF NOT EXISTS "MenuItem_cafeId_categoryId_idx" ON "MenuItem"("cafeId", "categoryId");
CREATE INDEX IF NOT EXISTS "MenuItem_cafeId_isAvailable_idx" ON "MenuItem"("cafeId", "isAvailable");
CREATE INDEX IF NOT EXISTS "MenuItem_categoryId_sortOrder_idx" ON "MenuItem"("categoryId", "sortOrder");

-- Add unique constraint and index for cafe tables
CREATE UNIQUE INDEX IF NOT EXISTS "CafeTable_cafeId_tableNumber_key" ON "CafeTable"("cafeId", "tableNumber");
CREATE INDEX IF NOT EXISTS "CafeTable_cafeId_isActive_idx" ON "CafeTable"("cafeId", "isActive");
