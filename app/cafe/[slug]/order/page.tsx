import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { OrderClient } from "./order-client";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tableToken?: string }>;
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { tableToken } = await searchParams;

  const cafe = await db.cafe.findUnique({
    where: { slug, isActive: true },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: {
              options: {
                include: { values: { orderBy: { sortOrder: "asc" } } },
                orderBy: { id: "asc" },
              },
            },
          },
        },
      },
      settings: true,
    },
  });

  if (!cafe) {
    notFound();
  }

  if (cafe.categories.every((c) => c.items.length === 0)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">{cafe.name}</h1>
        <p className="text-muted-foreground">Menu coming soon.</p>
      </div>
    );
  }

  let preselectedTableId: string | null = null;
  if (tableToken) {
    const table = await db.cafeTable.findUnique({
      where: { qrToken: tableToken, cafeId: cafe.id, isActive: true },
    });
    if (table) {
      preselectedTableId = table.id;
    }
  }

  const menuItems = cafe.categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    items: cat.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      priceCents: item.priceCents,
      isAvailable: item.isAvailable,
      options: item.options.map((opt) => ({
        id: opt.id,
        name: opt.name,
        type: opt.type as "SINGLE" | "MULTIPLE",
        required: opt.required,
        minSelect: opt.minSelect,
        maxSelect: opt.maxSelect,
        values: opt.values.map((v) => ({
          id: v.id,
          name: v.name,
          priceCents: v.priceCents,
          sortOrder: v.sortOrder,
        })),
      })),
    })),
  }));

  return (
    <OrderClient
      cafeName={cafe.name}
      cafeSlug={cafe.slug}
      menuItems={menuItems}
      tableToken={tableToken}
      preselectedTableId={preselectedTableId}
    />
  );
}
