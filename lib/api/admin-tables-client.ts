import { apiFetch } from "./client";

export interface CafeTable {
  id: string;
  tableNumber: string;
  qrToken: string;
  isActive: boolean;
  createdAt: string;
}

export interface TablesResponse {
  tables: CafeTable[];
  cafeSlug: string;
}

export async function fetchTables(): Promise<TablesResponse> {
  return apiFetch<TablesResponse>("/api/admin/tables");
}

export async function createTable(tableNumber: string): Promise<{ table: CafeTable }> {
  return apiFetch<{ table: CafeTable }>("/api/admin/tables", {
    method: "POST",
    body: JSON.stringify({ tableNumber }),
  });
}

export async function updateTable(
  tableId: string,
  data: { isActive?: boolean; regenerateQr?: boolean }
): Promise<{ table: CafeTable }> {
  return apiFetch<{ table: CafeTable }>(`/api/admin/tables/${tableId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTable(tableId: string): Promise<void> {
  await apiFetch(`/api/admin/tables/${tableId}`, { method: "DELETE" });
}
