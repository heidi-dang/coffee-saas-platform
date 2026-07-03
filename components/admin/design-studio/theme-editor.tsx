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
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

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
      .catch(() => setMessage({ text: "Could not load theme. Please try again.", type: "error" }));
  }, []);

  if (!theme) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Theme</h3>
        <p className="text-sm text-gray-500">Loading theme...</p>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateTheme(theme as any);
      setMessage({ text: "Theme draft saved.", type: "success" });
    } catch {
      setMessage({ text: "Could not save theme draft. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Theme</h3>
      <p className="text-xs text-gray-500">
        Theme changes are saved as draft. Customers will not see them until you publish.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <ColorField label="Primary colour" value={theme.primaryColor} onChange={(v) => setTheme({ ...theme, primaryColor: v })} />
        <ColorField label="Accent colour" value={theme.accentColor} onChange={(v) => setTheme({ ...theme, accentColor: v })} />
        <ColorField label="Background colour" value={theme.backgroundColor} onChange={(v) => setTheme({ ...theme, backgroundColor: v })} />
        <ColorField label="Text colour" value={theme.textColor} onChange={(v) => setTheme({ ...theme, textColor: v })} />
      </div>

      <div>
        <label htmlFor="theme-logo-url" className="block text-sm font-medium">Logo URL</label>
        <input
          id="theme-logo-url"
          type="text"
          value={theme.logoUrl || ""}
          onChange={(e) => setTheme({ ...theme, logoUrl: e.target.value || null })}
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div>
        <label htmlFor="theme-hero-image-url" className="block text-sm font-medium">Hero image URL</label>
        <input
          id="theme-hero-image-url"
          type="text"
          value={theme.heroImageUrl || ""}
          onChange={(e) => setTheme({ ...theme, heroImageUrl: e.target.value || null })}
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          placeholder="https://example.com/hero.jpg"
        />
      </div>

      <div>
        <label htmlFor="theme-font" className="block text-sm font-medium">Font</label>
        <select
          id="theme-font"
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
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Theme Draft"}
      </button>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`} role="alert">
          {message.text}
        </p>
      )}
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
          aria-label={`${label} colour picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border px-3 py-2 text-sm"
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}
