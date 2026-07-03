"use client";

import { useState } from "react";
import type { Category } from "@/lib/api/admin-menu-client";
import { CategoryRow } from "./category-row";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CategorySectionProps {
  categories: Category[];
  expandedCat: string | null;
  onToggleExpand: (catId: string) => void;
  onToggleCategory: (catId: string, isActive: boolean) => void;
  onDeleteCategory: (catId: string) => void;
  onAddCategory: (name: string) => void;
}

export function CategorySection({
  categories,
  expandedCat,
  onToggleExpand,
  onToggleCategory,
  onDeleteCategory,
  onAddCategory,
}: CategorySectionProps) {
  const [newCatName, setNewCatName] = useState("");

  const handleAdd = () => {
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName("");
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="font-semibold mb-3">Categories</h2>
      <div className="space-y-2 mb-4">
        {categories.map((cat) => (
          <CategoryRow
            key={cat.id}
            category={cat}
            isExpanded={expandedCat === cat.id}
            onToggle={() => onToggleExpand(cat.id)}
            onToggleActive={() => onToggleCategory(cat.id, cat.isActive)}
            onDelete={() => onDeleteCategory(cat.id)}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="New category name"
          className="max-w-xs"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
}
