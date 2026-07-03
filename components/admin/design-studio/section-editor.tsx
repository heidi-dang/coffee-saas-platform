"use client";

import { useState } from "react";
import type { CafePageSection } from "@/lib/generated/prisma/client";
import { createSection, updateSection } from "@/lib/api/admin-design-studio-client";

interface SectionEditorProps {
  existing: CafePageSection | null;
  onDone: () => void;
}

const TYPES = [
  { value: "HERO", label: "Hero — Main top banner" },
  { value: "ABOUT", label: "About — Café story" },
  { value: "FEATURED_MENU", label: "Featured Menu — Popular items" },
  { value: "GALLERY", label: "Gallery — Photos" },
  { value: "ANNOUNCEMENT", label: "Announcement — Promo or notice" },
  { value: "CONTACT", label: "Contact — Address and hours" },
  { value: "CUSTOM_TEXT", label: "Custom Text — Extra content" },
];

export function SectionEditor({ existing, onDone }: SectionEditorProps) {
  const [type, setType] = useState<string>(existing?.type || "CUSTOM_TEXT");
  const [title, setTitle] = useState(existing?.draftTitle || "");
  const [contentText, setContentText] = useState((existing?.draftContent as any)?.text || "");
  const [imageUrl, setImageUrl] = useState((existing?.draftContent as any)?.imageUrl || "");
  const [buttonLabel, setButtonLabel] = useState((existing?.draftContent as any)?.buttonLabel || "");
  const [buttonUrl, setButtonUrl] = useState((existing?.draftContent as any)?.buttonUrl || "");
  const [isVisible, setIsVisible] = useState(existing?.draftIsVisible ?? true);
  const [sortOrder, setSortOrder] = useState(existing?.sortOrder ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        type,
        title: title || null,
        content: { text: contentText || null, imageUrl: imageUrl || null, buttonLabel: buttonLabel || null, buttonUrl: buttonUrl || null },
        isVisible,
        sortOrder,
      };
      if (existing) {
        await updateSection(existing.id, payload);
      } else {
        await createSection(payload);
      }
      onDone();
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded border bg-gray-50 p-4">
      <h4 className="font-medium">{existing ? "Edit Section" : "New Section"}</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm">
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Content Text</label>
        <textarea value={contentText} onChange={(e) => setContentText(e.target.value)} rows={3} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Image URL</label>
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium">Sort Order</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Button Label</label>
          <input type="text" value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Button URL</label>
          <input type="text" value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="https://..." />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
        Visible in draft
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button onClick={onDone} className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300">
          Cancel
        </button>
      </div>
    </div>
  );
}
