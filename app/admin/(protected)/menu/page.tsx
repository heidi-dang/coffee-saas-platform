"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface MenuOption {
  id: string;
  name: string;
  type: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  values: { id: string; name: string; priceCents: number; sortOrder: number }[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  isAvailable: boolean;
  sortOrder: number;
  categoryId: string;
  category: { name: string } | null;
  options: MenuOption[];
}

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    priceCents: 0,
    categoryId: "",
  });

  async function loadData() {
    const [catRes, itemRes] = await Promise.all([
      fetch("/api/admin/menu/categories"),
      fetch("/api/admin/menu/items"),
    ]);
    const catData = await catRes.json();
    const itemData = await itemRes.json();
    setCategories(catData.categories || []);
    setItems(itemData.items || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addCategory() {
    if (!newCatName.trim()) return;
    await fetch("/api/admin/menu/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName }),
    });
    setNewCatName("");
    loadData();
  }

  async function toggleCategory(catId: string, isActive: boolean) {
    await fetch(`/api/admin/menu/categories/${catId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    loadData();
  }

  async function deleteCategory(catId: string) {
    if (!confirm("Delete this category and all its items?")) return;
    await fetch(`/api/admin/menu/categories/${catId}`, { method: "DELETE" });
    loadData();
  }

  async function saveNewItem() {
    if (!newItem.name || !newItem.categoryId) return;
    await fetch("/api/admin/menu/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem.name,
        description: newItem.description || undefined,
        priceCents: newItem.priceCents,
        categoryId: newItem.categoryId,
      }),
    });
    setShowNewItem(false);
    setNewItem({ name: "", description: "", priceCents: 0, categoryId: "" });
    loadData();
  }

  async function toggleItemAvailability(itemId: string, isAvailable: boolean) {
    await fetch(`/api/admin/menu/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !isAvailable }),
    });
    loadData();
  }

  async function deleteItem(itemId: string) {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/admin/menu/items/${itemId}`, { method: "DELETE" });
    loadData();
  }

  async function saveItemEdit() {
    if (!editingItem) return;
    await fetch(`/api/admin/menu/items/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingItem.name,
        description: editingItem.description,
        priceCents: editingItem.priceCents,
      }),
    });
    setEditingItem(null);
    loadData();
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Menu Management</h1>

      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-3">Categories</h2>
          <div className="space-y-2 mb-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setExpandedCat(
                        expandedCat === cat.id ? null : cat.id
                      )
                    }
                  >
                    {expandedCat === cat.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <span
                    className={
                      cat.isActive ? "" : "text-muted-foreground line-through"
                    }
                  >
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCategory(cat.id, cat.isActive)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {cat.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-xs text-destructive hover:text-destructive/80"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name"
              className="max-w-xs"
            />
            <Button size="sm" onClick={addCategory}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Menu Items</h2>
            <Button size="sm" onClick={() => setShowNewItem(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          {showNewItem && (
            <div className="border rounded-lg p-4 mb-4 space-y-3">
              <Input
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="Item name"
              />
              <Textarea
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                placeholder="Description"
              />
              <Input
                type="number"
                value={newItem.priceCents / 100}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    priceCents: Math.round(parseFloat(e.target.value) * 100),
                  })
                }
                placeholder="Price"
              />
              <select
                value={newItem.categoryId}
                onChange={(e) =>
                  setNewItem({ ...newItem, categoryId: e.target.value })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <Button onClick={saveNewItem}>Save</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewItem(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No menu items yet.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-3 ${
                    !item.isAvailable ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {item.name}
                        {!item.isAvailable && (
                          <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            Unavailable
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.category?.name} — $
                        {(item.priceCents / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          toggleItemAvailability(
                            item.id,
                            item.isAvailable
                          )
                        }
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {item.isAvailable ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-xs text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {item.options.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        Options ({item.options.length})
                      </summary>
                      <div className="mt-2 space-y-1">
                        {item.options.map((opt) => (
                          <div
                            key={opt.id}
                            className="text-xs text-muted-foreground border-l-2 pl-2"
                          >
                            <p className="font-medium">
                              {opt.name} ({opt.type})
                              {opt.required && " *"}
                            </p>
                            <p>
                              {opt.values.map((v) => v.name).join(", ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setEditingItem(null)}
          />
          <div className="relative bg-background w-full max-w-md rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Edit Item</h3>
            <Input
              value={editingItem.name}
              onChange={(e) =>
                setEditingItem({ ...editingItem, name: e.target.value })
              }
            />
            <Textarea
              value={editingItem.description || ""}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  description: e.target.value,
                })
              }
            />
            <Input
              type="number"
              value={editingItem.priceCents / 100}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  priceCents: Math.round(parseFloat(e.target.value) * 100),
                })
              }
            />
            <div className="flex gap-2">
              <Button onClick={saveItemEdit}>Save</Button>
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
