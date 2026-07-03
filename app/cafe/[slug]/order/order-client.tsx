"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { MenuItemModal } from "@/components/menu/menu-item-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

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
}: OrderClientProps) {
  const { addItem, itemCount } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{cafeName}</h1>
        <p className="text-sm text-muted-foreground">Place your order</p>
        {tableToken && (
          <p className="text-xs text-muted-foreground mt-1">
            Dine-in order
          </p>
        )}
      </header>

      {menuItems.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          Menu coming soon.
        </p>
      ) : (
        <div className="space-y-6">
          {menuItems.map((cat) => (
            <section key={cat.id}>
              <h2 className="text-xl font-semibold mb-3">{cat.name}</h2>
              <div className="space-y-3">
                {cat.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    priceCents={item.priceCents}
                    isAvailable={item.isAvailable}
                    onCustomise={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

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
              quantity: 1,
            });
          }}
        />
      )}

      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart ({itemCount})
          </Button>
        </div>
      )}

      <CartDrawer
        cafeSlug={cafeSlug}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </div>
  );
}
