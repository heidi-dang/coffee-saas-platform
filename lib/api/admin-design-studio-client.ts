import { apiFetch } from "./client";

export async function getTheme() {
  return apiFetch("/api/admin/design-studio/theme");
}

export async function updateTheme(data: Record<string, unknown>) {
  return apiFetch("/api/admin/design-studio/theme", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getSections() {
  return apiFetch("/api/admin/design-studio/sections");
}

export async function createSection(data: Record<string, unknown>) {
  return apiFetch("/api/admin/design-studio/sections", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSection(id: string, data: Record<string, unknown>) {
  return apiFetch(`/api/admin/design-studio/sections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteSection(id: string) {
  return apiFetch(`/api/admin/design-studio/sections/${id}`, {
    method: "DELETE",
  });
}

export async function publishDesign() {
  return apiFetch("/api/admin/design-studio/publish", {
    method: "POST",
  });
}
