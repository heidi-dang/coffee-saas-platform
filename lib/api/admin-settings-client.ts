import { apiFetch } from "./client";

export interface CafeSettings {
  acceptDineIn: boolean;
  acceptTakeaway: boolean;
  acceptPickup: boolean;
  acceptPayAtCounter: boolean;
  acceptOnlinePayment: boolean;
}

export interface CafeInfo {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
}

export interface SettingsResponse {
  cafe: CafeInfo;
  settings: CafeSettings;
}

export async function fetchSettings(): Promise<SettingsResponse> {
  return apiFetch<SettingsResponse>("/api/admin/settings");
}

export async function updateSettings(data: {
  name?: string;
  phone?: string;
  address?: string;
  acceptDineIn?: boolean;
  acceptTakeaway?: boolean;
  acceptPickup?: boolean;
  acceptPayAtCounter?: boolean;
  acceptOnlinePayment?: boolean;
}): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
