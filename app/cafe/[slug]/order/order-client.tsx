"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { MenuItemModal } from "@/components/menu/menu-item-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, Coffee, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface OptionValue {
  id: string;
  name: string;
  priceCents: number;
  sortOrder: number;
}

interface MenuOption {
  id: string;
  name: string;
  type: "SINGLE" | "MULTIPLE";
  required: boolean;
  minSelect: number;
  maxSelect: number;
  values: OptionValue[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  isAvailable: boolean;
  stockQuantity: number | null;
  options: MenuOption[];
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface OrderClientProps {
  cafeName: string;
  cafeSlug: string;
  menuItems: MenuCategory[];
  tableToken?: string;
  preselectedTableId: string | null;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function OrderClient({
  cafeName,
  cafeSlug,
  menuItems,
  tableToken,
  preselectedTableId,
}: OrderClientProps) {
  const { addItem, itemCount } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items by search query
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const query = searchQuery.toLowerCase();
    return menuItems
      .map((cat) => {
        const items = cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        );
        return { ...cat, items };
      })
      .filter((cat) => cat.items.length > 0);
  }, [menuItems, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-amber-600/10">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/cafe/${cafeSlug}`}
              className="p-2 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-950 transition-colors active:scale-95"
              aria-label="Back to cafe homepage"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-extrabold text-base tracking-tight">{cafeName}</h1>
              {preselectedTableId ? (
                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                  Dine In — Table {preselectedTableId.slice(-2)}
                </p>
              ) : (
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5">
                  Takeaway / Pickup
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 pb-32">
        {/* Search menu bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-4 py-3 text-sm placeholder-stone-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all shadow-sm"
          />
        </div>

        {menuItems.length === 0 ? (
          <div className="text-center py-20 bg-stone-100/50 rounded-2xl border border-stone-200/50">
            <Coffee className="h-10 w-10 text-stone-300 mx-auto mb-4" />
            <h3 className="font-bold text-stone-800 mb-1">Menu coming soon</h3>
            <p className="text-stone-500 text-xs">We are preparing our winter selections.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Horizontal Category Navigation Bar */}
            {!searchQuery && (
              <div className="sticky top-[64px] z-30 bg-stone-50/90 backdrop-blur py-3 flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 border-b border-stone-200/50">
                {menuItems.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      const el = document.getElementById(`category-${cat.id}`);
                      if (el) {
                        const topOffset = el.getBoundingClientRect().top + window.scrollY - 130;
                        window.scrollTo({ top: topOffset, behavior: "smooth" });
                      }
                    }}
                    className="shrink-0 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 hover:border-stone-400 active:scale-95 transition-all shadow-sm"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-stone-400">No items match your search.</p>
              </div>
            ) : (
              <div className="space-y-10 pt-4">
                {filteredMenuItems.map((cat) => (
                  <section key={cat.id} id={`category-${cat.id}`} className="scroll-mt-36">
                    <h2 className="text-lg font-black text-stone-900 mb-4 border-b border-stone-200 pb-1.5 tracking-tight">
                      {cat.name}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {cat.items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          id={item.id}
                          name={item.name}
                          description={item.description}
                          priceCents={item.priceCents}
                          isAvailable={item.isAvailable}
                          stockQuantity={item.stockQuantity}
                          onCustomise={() => setSelectedItem(item)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t border-stone-200 z-40">
          <div className="max-w-4xl mx-auto">
            <Button
              className="w-full rounded-2xl bg-amber-800 hover:bg-amber-950 text-white font-bold py-6 text-base active:scale-[0.98] transition-all shadow-lg shadow-amber-900/10 flex items-center justify-center gap-2"
              size="lg"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              View Order ({itemCount} {itemCount === 1 ? "item" : "items"})
            </Button>
          </div>
        </div>
      )}

      {/* Item Customisation Modal */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={(params) => {
            addItem({
              id: generateId(),
              menuItemId: params.menuItemId,
              name: params.name,
              unitPriceCents: params.unitPriceCents,
              selectedOptions: params.selectedOptions,
              notes: params.notes,
              quantity: params.quantity,
            });
          }}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        cafeSlug={cafeSlug}
        tableToken={tableToken}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </div>
  );
}
