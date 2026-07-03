"use client";

import { useState } from "react";
import { CategorySection } from "./category-section";
import { MenuItemSection } from "./menu-item-section";
import { useAdminMenu } from "@/hooks/admin/use-admin-menu";

export default function AdminMenuPage() {
  const {
    categories,
    items,
    loading,
    addCategory,
    toggleCategory,
    deleteCategory,
    addItem,
    toggleItem,
    deleteItem,
    saveItemEdit,
  } = useAdminMenu();

  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Menu Management</h1>
      <div className="space-y-6">
        <CategorySection
          categories={categories}
          expandedCat={expandedCat}
          onToggleExpand={(catId) =>
            setExpandedCat(expandedCat === catId ? null : catId)
          }
          onToggleCategory={toggleCategory}
          onDeleteCategory={deleteCategory}
          onAddCategory={addCategory}
        />

        <MenuItemSection
          items={items}
          categories={categories}
          onAddItem={addItem}
          onToggleItem={toggleItem}
          onDeleteItem={deleteItem}
          onEditItem={saveItemEdit}
        />
      </div>
    </div>
  );
}
