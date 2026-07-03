"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/api/admin-menu-client";


interface MenuItemFormProps {
  categories: Category[];
  onSave: (data: { name: string; description?: string; priceCents: number; categoryId: string }) => void;
  onCancel: () => void;
}

export function MenuItemForm({ categories, onSave, onCancel }: MenuItemFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceCents, setPriceCents] = useState(0);
  const [categoryId, setCategoryId] = useState("");

  const handleSave = () => {
    if (!name || !categoryId) return;
    onSave({ name, description: description || undefined, priceCents, categoryId });
  };

  return (
    <div className="border rounded-lg p-4 mb-4 space-y-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <Input
        type="number"
        value={priceCents / 100}
        onChange={(e) =>
          setPriceCents(Math.round(parseFloat(e.target.value) * 100))
        }
        placeholder="Price"
      />
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
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
        <Button onClick={handleSave}>Save</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
