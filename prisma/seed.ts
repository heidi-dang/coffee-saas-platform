import { PrismaClient, UserRole, OptionType } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

function qrToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

async function seed() {
  const passwordHash = await bcrypt.hash("password123", 12);

  await db.user.upsert({
    where: { email: "admin@coffeeqr.app" },
    update: {},
    create: {
      email: "admin@coffeeqr.app",
      name: "Platform Admin",
      passwordHash,
      role: UserRole.PLATFORM_ADMIN,
    },
  });

  const cafe = await db.cafe.upsert({
    where: { slug: "demo-coffee" },
    update: {},
    create: {
      name: "Demo Coffee",
      slug: "demo-coffee",
      email: "hello@democoffee.com",
      phone: "+61412345678",
      address: "123 Coffee Lane, Melbourne VIC 3000",
      currency: "AUD",
      settings: { create: {} },
    },
  });

  await db.user.upsert({
    where: { email: "owner@democoffee.com" },
    update: {},
    create: {
      email: "owner@democoffee.com",
      name: "Cafe Owner",
      passwordHash,
      role: UserRole.CAFE_OWNER,
      cafeId: cafe.id,
    },
  });

  await db.user.upsert({
    where: { email: "staff@democoffee.com" },
    update: {},
    create: {
      email: "staff@democoffee.com",
      name: "Cafe Staff",
      passwordHash,
      role: UserRole.CAFE_STAFF,
      cafeId: cafe.id,
    },
  });

  // Clean up existing dependent data for idempotency
  await db.orderItem.deleteMany({ where: { order: { cafeId: cafe.id } } });
  await db.order.deleteMany({ where: { cafeId: cafe.id } });
  await db.menuItemOptionValue.deleteMany({
    where: { option: { menuItem: { cafeId: cafe.id } } },
  });
  await db.menuItemOption.deleteMany({
    where: { menuItem: { cafeId: cafe.id } },
  });
  await db.menuItem.deleteMany({ where: { cafeId: cafe.id } });
  await db.menuCategory.deleteMany({ where: { cafeId: cafe.id } });
  await db.cafeTable.deleteMany({ where: { cafeId: cafe.id } });

  const coffeeCat = await db.menuCategory.create({
    data: { cafeId: cafe.id, name: "Coffee", sortOrder: 1 },
  });
  await db.menuCategory.create({
    data: { cafeId: cafe.id, name: "Tea", sortOrder: 2 },
  });
  const coldCat = await db.menuCategory.create({
    data: { cafeId: cafe.id, name: "Cold Drinks", sortOrder: 3 },
  });
  const foodCat = await db.menuCategory.create({
    data: { cafeId: cafe.id, name: "Food", sortOrder: 4 },
  });
  await db.menuCategory.create({
    data: { cafeId: cafe.id, name: "Desserts", sortOrder: 5 },
  });

  const latte = await db.menuItem.create({
    data: {
      cafeId: cafe.id, categoryId: coffeeCat.id,
      name: "Latte", description: "Espresso with steamed milk",
      priceCents: 550, sortOrder: 1,
    },
  });
  const cappuccino = await db.menuItem.create({
    data: {
      cafeId: cafe.id, categoryId: coffeeCat.id,
      name: "Cappuccino", description: "Espresso with frothed milk and chocolate",
      priceCents: 550, sortOrder: 2,
    },
  });
  const flatWhite = await db.menuItem.create({
    data: {
      cafeId: cafe.id, categoryId: coffeeCat.id,
      name: "Flat White", description: "Espresso with smooth microfoam",
      priceCents: 550, sortOrder: 3,
    },
  });
  const longBlack = await db.menuItem.create({
    data: {
      cafeId: cafe.id, categoryId: coffeeCat.id,
      name: "Long Black", description: "Double espresso topped with hot water",
      priceCents: 450, sortOrder: 4,
    },
  });
  const icedLatte = await db.menuItem.create({
    data: {
      cafeId: cafe.id, categoryId: coldCat.id,
      name: "Iced Latte", description: "Espresso with cold milk and ice",
      priceCents: 650, sortOrder: 5,
    },
  });
  await db.menuItem.create({
    data: {
      cafeId: cafe.id, categoryId: foodCat.id,
      name: "Banana Bread", description: "Freshly baked banana bread",
      priceCents: 750, sortOrder: 6,
    },
  });
  await db.menuItem.create({
    data: {
      cafeId: cafe.id, categoryId: foodCat.id,
      name: "Croissant", description: "Butter croissant",
      priceCents: 650, sortOrder: 7,
    },
  });

  const coffeeItems = [latte, cappuccino, flatWhite, longBlack, icedLatte];

  for (const item of coffeeItems) {
    await db.menuItemOption.create({
      data: {
        menuItemId: item.id, name: "Size",
        type: OptionType.SINGLE, required: true, minSelect: 1, maxSelect: 1,
        values: {
          create: [
            { name: "Small", priceCents: 0, sortOrder: 1 },
            { name: "Medium", priceCents: 100, sortOrder: 2 },
            { name: "Large", priceCents: 200, sortOrder: 3 },
          ],
        },
      },
    });
    await db.menuItemOption.create({
      data: {
        menuItemId: item.id, name: "Milk",
        type: OptionType.SINGLE, required: false, minSelect: 0, maxSelect: 1,
        values: {
          create: [
            { name: "Full Cream", priceCents: 0, sortOrder: 1 },
            { name: "Skim", priceCents: 0, sortOrder: 2 },
            { name: "Soy", priceCents: 50, sortOrder: 3 },
            { name: "Oat", priceCents: 50, sortOrder: 4 },
            { name: "Almond", priceCents: 50, sortOrder: 5 },
          ],
        },
      },
    });
    await db.menuItemOption.create({
      data: {
        menuItemId: item.id, name: "Sugar",
        type: OptionType.SINGLE, required: false, minSelect: 0, maxSelect: 1,
        values: {
          create: [
            { name: "No Sugar", priceCents: 0, sortOrder: 1 },
            { name: "1 Sugar", priceCents: 0, sortOrder: 2 },
            { name: "2 Sugars", priceCents: 0, sortOrder: 3 },
          ],
        },
      },
    });
    await db.menuItemOption.create({
      data: {
        menuItemId: item.id, name: "Extras",
        type: OptionType.MULTIPLE, required: false, minSelect: 0, maxSelect: 3,
        values: {
          create: [
            { name: "Extra Shot", priceCents: 100, sortOrder: 1 },
            { name: "Vanilla Syrup", priceCents: 80, sortOrder: 2 },
            { name: "Caramel Syrup", priceCents: 80, sortOrder: 3 },
          ],
        },
      },
    });
  }

  for (let i = 1; i <= 10; i++) {
    await db.cafeTable.create({
      data: { cafeId: cafe.id, tableNumber: String(i), qrToken: qrToken() },
    });
  }

  console.log("Seed complete.");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
