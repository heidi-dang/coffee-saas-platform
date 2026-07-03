import { useState, useEffect, useCallback } from "react";
import { createCategory, deleteCategory, toggleCategory, fetchCategories, fetchMenuItems, createMenuItem, deleteMenuItem, updateMenuItem } from "@/lib/api/admin-menu-client";
import type { Category, MenuItem } from "@/lib/api/admin-menu-client";

export function useAdminMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [catData, itemData] = await Promise.all([
        fetchCategories(),
        fetchMenuItems(),
      ]);
      setCategories(catData.categories);
      setItems(itemData.items);
    } catch (err) {
      console.error("Failed to load menu data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addCategory = async (name: string) => {
    await createCategory(name);
    await loadData();
  };

  const handleToggleCategory = async (catId: string, isActive: boolean) => {
    await toggleCategory(catId, isActive);
    await loadData();
  };

  const handleDeleteCategory = async (catId: string) => {
    await deleteCategory(catId);
    await loadData();
  };

  const addItem = async (data: { name: string; description?: string; priceCents: number; categoryId: string }) => {
    await createMenuItem(data);
    await loadData();
  };

  const handleToggleItem = async (itemId: string, isAvailable: boolean) => {
    await updateMenuItem(itemId, { isAvailable: !isAvailable } as any);
    await loadData();
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteMenuItem(itemId);
    await loadData();
  };

  const saveItemEdit = async (itemId: string, data: { name: string; description?: string; priceCents: number }) => {
    await updateMenuItem(itemId, data as any);
    await loadData();
  };

  return {
    categories,
    items,
    loading,
    addCategory,
    toggleCategory: handleToggleCategory,
    deleteCategory: handleDeleteCategory,
    addItem,
    toggleItem: handleToggleItem,
    deleteItem: handleDeleteItem,
    saveItemEdit: (itemId: string, data: { name: string; description?: string; priceCents: number }) => saveItemEdit(itemId, data),
    reload: loadData,
  };
}
