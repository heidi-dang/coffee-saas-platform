"use client";

import { useState, useEffect } from "react";
import { getTheme, updateTheme } from "@/lib/api/admin-design-studio-client";

interface ThemeData {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  fontFamily: string;
}

export function ThemeEditor() {
  const [theme, setTheme] = useState<ThemeData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getTheme()
      .then((data: any) => setTheme({
        primaryColor: data.primaryColor || "#111827",
        accentColor: data.accentColor || "#f59e0b",
        backgroundColor: data.backgroundColor || "#ffffff",
        textColor: data.textColor || "#111827",
        logoUrl: data.logoUrl || null,
        heroImageUrl: data.heroImageUrl || null,
        fontFamily: data.fontFamily || "system",
      }))
      .catch(() => setMessage("Failed to load theme"));
  }, []);

  if (!theme) return <div className="p-4 text-gray-500">Loading theme...</div>;

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateTheme(theme as any);
      setMessage("Theme saved");
    } catch {
      setMessage("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Theme Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <ColorField label="Primary" value={theme.primaryColor} onChange={(v) => setTheme({ ...theme, primaryColor: v })} />
        <ColorField label="Accent" value={theme.accentColor} onChange={(v) => setTheme({ ...theme, accentColor: v })} />
        <ColorField label="Background" value={theme.backgroundColor} onChange={(v) => setTheme({ ...theme, backgroundColor: v })} />
        <ColorField label="Text" value={theme.textColor} onChange={(v) => setTheme({ ...theme, textColor: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium">Logo URL</label>
        <input
          type="text"
          value={theme.logoUrl || ""}
          onChange={(e) => setTheme({ ...theme, logoUrl: e.target.value || null })}
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Hero Image URL</label>
        <input
          type="text"
          value={theme.heroImageUrl || ""}
          onChange={(e) => setTheme({ ...theme, heroImageUrl: e.target.value || null })}
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Font</label>
        <select
          value={theme.fontFamily}
          onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
        >
          <option value="system">System</option>
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans Serif</option>
          <option value="monospace">Monospace</option>
        </select>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Theme"}
      </button>
      {message && <p className="text-sm text-green-600">{message}</p>}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
