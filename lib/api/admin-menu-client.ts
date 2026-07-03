import { apiFetch } from "./client";

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuOption {
  id: string;
  name: string;
  type: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  values: { id: string; name: string; priceCents: number; sortOrder: number }[];
}

export interface MenuItem {
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

export interface CategoriesResponse {
  categories: Category[];
}

export interface MenuItemsResponse {
  items: MenuItem[];
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  return apiFetch<CategoriesResponse>("/api/admin/menu/categories");
}

export async function fetchMenuItems(): Promise<MenuItemsResponse> {
  return apiFetch<MenuItemsResponse>("/api/admin/menu/items");
}

export async function createCategory(name: string): Promise<{ category: Category }> {
  return apiFetch<{ category: Category }>("/api/admin/menu/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function toggleCategory(catId: string, isActive: boolean): Promise<void> {
  await apiFetch(`/api/admin/menu/categories/${catId}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive: !isActive }),
  });
}

export async function deleteCategory(catId: string): Promise<void> {
  await apiFetch(`/api/admin/menu/categories/${catId}`, {
    method: "DELETE",
  });
}

export async function createMenuItem(data: {
  name: string;
  description?: string;
  priceCents: number;
  categoryId: string;
}): Promise<{ item: MenuItem }> {
  return apiFetch<{ item: MenuItem }>("/api/admin/menu/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMenuItem(
  itemId: string,
  data: Partial<MenuItem>
): Promise<{ item: MenuItem }> {
  return apiFetch<{ item: MenuItem }>(`/api/admin/menu/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  await apiFetch(`/api/admin/menu/items/${itemId}`, { method: "DELETE" });
}
