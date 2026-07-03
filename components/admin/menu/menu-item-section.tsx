"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/api/admin-menu-client";
import { MenuItemRow } from "./menu-item-row";
import { MenuItemForm } from "./menu-item-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import type { Category } from "@/lib/api/admin-menu-client";

interface MenuItemSectionProps {
  items: MenuItem[];
  categories: Category[];
  onAddItem: (data: { name: string; description?: string; priceCents: number; categoryId: string }) => void;
  onToggleItem: (itemId: string, isAvailable: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onEditItem: (itemId: string, data: { name: string; description?: string; priceCents: number }) => void;
}

export function MenuItemSection({
  items,
  categories,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onEditItem,
}: MenuItemSectionProps) {
  const [showNewItem, setShowNewItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriceCents, setEditPriceCents] = useState(0);

  const handleSaveNew = (data: { name: string; description?: string; priceCents: number; categoryId: string }) => {
    onAddItem(data);
    setShowNewItem(false);
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDescription(item.description || "");
    setEditPriceCents(item.priceCents);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    onEditItem(editingItem.id, {
      name: editName,
      description: editDescription || undefined,
      priceCents: editPriceCents,
    });
    setEditingItem(null);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Menu Items</h2>
        <Button size="sm" onClick={() => setShowNewItem(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>

      {showNewItem && (
        <MenuItemForm
          categories={categories}
          onSave={handleSaveNew}
          onCancel={() => setShowNewItem(false)}
        />
      )}

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No menu items yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <MenuItemRow
              key={item.id}
              item={item}
              onEdit={() => startEdit(item)}
              onToggle={() => onToggleItem(item.id, item.isAvailable)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setEditingItem(null)}
          />
          <div className="relative bg-background w-full max-w-md rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Edit Item</h3>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <Input
              type="number"
              value={editPriceCents / 100}
              onChange={(e) =>
                setEditPriceCents(Math.round(parseFloat(e.target.value) * 100))
              }
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit}>Save</Button>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
