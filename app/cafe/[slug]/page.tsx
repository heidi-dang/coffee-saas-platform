import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PublicPageRenderer } from "@/components/cafe/public-page-renderer";
import { hasPublishedDesign, getPublicTheme } from "@/lib/design-studio/helpers";
import type { Prisma } from "@/lib/generated/prisma/client";

type CafeWithMenu = Prisma.CafeGetPayload<{
  include: {
    categories: {
      include: { items: { include: { options: { include: { values: true } } } } };
    };
    theme: true;
    sections: {
      where: { isPublished: true };
      orderBy: { sortOrder: "asc" };
    };
  };
}>;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const cafe = await db.cafe.findUnique({ where: { slug } });
  if (!cafe) return { title: "Cafe Not Found" };
  return { title: cafe.name, description: `Order from ${cafe.name}` };
}

export default async function CafePage({ params }: PageProps) {
  const { slug } = await params;

  const cafe: CafeWithMenu | null = await db.cafe.findUnique({
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
      theme: true,
      sections: {
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!cafe) {
    notFound();
  }

  if (hasPublishedDesign(cafe.theme, cafe.sections) && cafe.theme) {
    return (
      <>
        <PublicPageRenderer theme={cafe.theme} sections={cafe.sections} />
        <div className="mx-auto max-w-4xl px-4 pb-8">
          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Menu</h2>
            {cafe.categories.map((cat) => (
              <div key={cat.id} className="mb-8">
                <h3 className="text-xl font-medium mb-3">{cat.name}</h3>
                <div className="grid gap-4">
                  {cat.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 flex items-start justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                      </div>
                      <span className="font-semibold whitespace-nowrap ml-4">
                        ${(item.priceCents / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{cafe.name}</h1>
        {cafe.address && (
          <p className="text-muted-foreground mt-1">{cafe.address}</p>
        )}
      </header>

      {cafe.categories.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          Menu coming soon.
        </p>
      ) : (
        <div className="space-y-8">
          {cafe.categories.map((cat) => (
            <section key={cat.id}>
              <h2 className="text-2xl font-semibold mb-4">{cat.name}</h2>
              <div className="grid gap-4">
                {cat.items.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No items available.
                  </p>
                )}
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 flex items-start justify-between ${!item.isAvailable ? "opacity-50" : ""}`}
                  >
                    <div>
                      <h3 className="font-medium">
                        {item.name}
                        {!item.isAvailable && (
                          <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            Unavailable
                          </span>
                        )}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-lg whitespace-nowrap ml-4">
                      ${(item.priceCents / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
