import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PublicPageRenderer } from "@/components/cafe/public-page-renderer";
import { hasPublishedDesign, getPublicTheme } from "@/lib/design-studio/helpers";
import type { Prisma } from "@/lib/generated/prisma/client";
import Link from "next/link";
import { Coffee, MapPin, Phone, Clock, ArrowRight, ChevronRight } from "lucide-react";

type CafeWithMenu = Prisma.CafeGetPayload<{
  include: {
    categories: {
      include: { items: { include: { options: { include: { values: true } } } } };
    };
    theme: true;
    sections: {
      where: { publishedAt: { not: null }; publishedDeletedAt: null };
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
        where: { publishedAt: { not: null }, publishedDeletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!cafe) {
    notFound();
  }

  const hasDesign = hasPublishedDesign(cafe.theme, cafe.sections);
  const publicTheme = getPublicTheme(cafe.theme);

  // Set up custom theme styles
  const themeStyle: React.CSSProperties = {
    backgroundColor: publicTheme?.backgroundColor ?? "#FAF9F6", // elegant warm cream default
    color: publicTheme?.textColor ?? "#1C1917", // warm charcoal default
    fontFamily: publicTheme?.fontFamily === "system" ? undefined : publicTheme?.fontFamily,
  };

  const accentColor = publicTheme?.accentColor ?? "#D97706"; // warm amber default
  const primaryColor = publicTheme?.primaryColor ?? "#78350F"; // rich espresso default

  // Published theme layout
  if (hasDesign && publicTheme) {
    return (
      <div style={themeStyle} className="min-h-screen flex flex-col pb-24 selection:bg-amber-500/30">
        {/* Theme Header */}
        <header className="sticky top-0 z-40 border-b bg-inherit backdrop-blur-md bg-opacity-70 py-4 px-6 flex items-center justify-between" style={{ borderColor: `${accentColor}15` }}>
          <div className="flex items-center gap-3">
            {publicTheme.logoUrl ? (
              <img src={publicTheme.logoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <Coffee className="h-5 w-5" />
              </div>
            )}
            <div>
              <h1 className="font-extrabold text-lg tracking-tight">{cafe.name}</h1>
              {cafe.address && <p className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {cafe.address}</p>}
            </div>
          </div>
          <Link
            href={`/cafe/${cafe.slug}/order`}
            style={{ backgroundColor: accentColor }}
            className="inline-flex h-10 items-center justify-center rounded-xl text-white px-5 text-sm font-bold shadow-lg shadow-amber-950/10 active:scale-95 transition-all hover:opacity-90"
          >
            Order Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </header>

        {/* Hero image banner */}
        {publicTheme.heroImageUrl && (
          <div className="w-full h-48 sm:h-64 md:h-72 overflow-hidden relative">
            <img src={publicTheme.heroImageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Page Sections from Design Studio */}
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <PublicPageRenderer theme={cafe.theme!} sections={cafe.sections} />
        </div>

        {/* Menu Section wrapped inside custom theme */}
        <div className="w-full max-w-4xl mx-auto px-4 mt-4">
          <section className="border-t pt-8" style={{ borderColor: `${accentColor}15` }}>
            <h2 className="text-3xl font-black mb-8 tracking-tight flex items-center gap-2">
              Our Menu
            </h2>
            {cafe.categories.length === 0 ? (
              <p className="opacity-60 text-center py-12 text-sm">Menu coming soon.</p>
            ) : (
              <div className="space-y-12">
                {cafe.categories.map((cat) => (
                  <div key={cat.id}>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 tracking-tight opacity-90 border-b pb-2" style={{ borderColor: `${accentColor}15` }}>
                      {cat.name}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {cat.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-md"
                          style={{ borderColor: `${accentColor}15`, backgroundColor: `${accentColor}03` }}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h4 className="font-bold text-base tracking-tight">{item.name}</h4>
                              <span className="font-black text-base whitespace-nowrap">
                                ${(item.priceCents / 100).toFixed(2)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs opacity-75 leading-relaxed line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between pt-2 border-t" style={{ borderColor: `${accentColor}10` }}>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </span>
                            <Link
                              href={`/cafe/${cafe.slug}/order`}
                              style={{ color: accentColor }}
                              className="text-xs font-bold inline-flex items-center gap-1 hover:underline"
                            >
                              Add to Order
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // Fallback layout (if no published design exists)
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col pb-24 selection:bg-amber-600/10">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/80 backdrop-blur-md py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight">{cafe.name}</h1>
            {cafe.address && <p className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {cafe.address}</p>}
          </div>
        </div>
        <Link
          href={`/cafe/${cafe.slug}/order`}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-700 text-white px-5 text-sm font-bold shadow-lg shadow-amber-900/10 active:scale-95 transition-all hover:bg-amber-800"
        >
          Order Now
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </header>

      <div className="w-full max-w-4xl mx-auto px-4 py-10 flex-1">
        <div className="mb-12 border-b border-stone-200/80 pb-6">
          <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-2">Welcome to {cafe.name}</h2>
          <p className="text-stone-500 text-sm">
            Scan QR code at your table, browse our menu below, and customize your winter beverages.
          </p>
        </div>

        {cafe.categories.length === 0 ? (
          <div className="text-center py-20 bg-stone-100/50 rounded-2xl border border-stone-200/50">
            <Coffee className="h-10 w-10 text-stone-300 mx-auto mb-4" />
            <h3 className="font-bold text-stone-800 mb-1">Menu coming soon</h3>
            <p className="text-stone-500 text-xs max-w-xs mx-auto">We are preparing our winter selections. Stay tuned!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {cafe.categories.map((cat) => (
              <div key={cat.id}>
                <h3 className="text-xl font-bold text-stone-800 mb-4 border-b border-stone-200 pb-2 tracking-tight">
                  {cat.name}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {cat.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border border-stone-200/80 bg-white flex flex-col justify-between shadow-sm transition-all hover:shadow-md hover:border-stone-300 ${!item.isAvailable ? "opacity-60" : ""}`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-bold text-stone-900 text-base tracking-tight">{item.name}</h4>
                          <span className="font-black text-stone-900 text-base whitespace-nowrap">
                            ${(item.priceCents / 100).toFixed(2)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-stone-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                        <Link
                          href={`/cafe/${cafe.slug}/order`}
                          className="text-xs font-bold text-amber-800 inline-flex items-center gap-1 hover:underline"
                        >
                          Add to Order
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
