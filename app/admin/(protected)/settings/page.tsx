"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CafeSettings {
  acceptDineIn: boolean;
  acceptTakeaway: boolean;
  acceptPickup: boolean;
  acceptPayAtCounter: boolean;
  acceptOnlinePayment: boolean;
}

interface Cafe {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [settings, setSettings] = useState<CafeSettings>({
    acceptDineIn: true,
    acceptTakeaway: true,
    acceptPickup: true,
    acceptPayAtCounter: true,
    acceptOnlinePayment: false,
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setCafe(data.cafe);
        if (data.settings) setSettings(data.settings);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cafe?.name,
        phone: cafe?.phone,
        address: cafe?.address,
        ...settings,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <div className="border rounded-lg p-4 space-y-4">
          <h2 className="font-semibold">Cafe Information</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={cafe?.name || ""}
              onChange={(e) =>
                setCafe((c) => (c ? { ...c, name: e.target.value } : null))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input
              value={cafe?.phone || ""}
              onChange={(e) =>
                setCafe((c) =>
                  c ? { ...c, phone: e.target.value } : null
                )
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Textarea
              value={cafe?.address || ""}
              onChange={(e) =>
                setCafe((c) =>
                  c ? { ...c, address: e.target.value } : null
                )
              }
            />
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <h2 className="font-semibold">Ordering Settings</h2>
          {(
            [
              ["acceptDineIn", "Dine-in"],
              ["acceptTakeaway", "Takeaway"],
              ["acceptPickup", "Pickup"],
              ["acceptPayAtCounter", "Pay at counter"],
              ["acceptOnlinePayment", "Online payment (coming soon)"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <span className="text-sm">{label}</span>
              <input
                type="checkbox"
                checked={settings[key as keyof CafeSettings]}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    [key]: e.target.checked,
                  }))
                }
                disabled={key === "acceptOnlinePayment"}
                className="h-4 w-4"
              />
            </label>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
