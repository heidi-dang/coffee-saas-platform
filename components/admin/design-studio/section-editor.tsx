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
      setError(e.message || "Could not save draft. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded border bg-gray-50 p-4">
      <h4 className="font-medium">{existing ? "Edit Section" : "New Section"}</h4>
      <p className="text-xs text-gray-500">
        Saving keeps this as a draft. Customers will not see it until you publish.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="section-type" className="block text-sm font-medium">Section type</label>
          <select id="section-type" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm">
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="section-title" className="block text-sm font-medium">Section title</label>
          <input id="section-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label htmlFor="section-text" className="block text-sm font-medium">Text</label>
        <textarea id="section-text" value={contentText} onChange={(e) => setContentText(e.target.value)} rows={3} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
      </div>

      <div>
        <label htmlFor="section-image-url" className="block text-sm font-medium">Image URL</label>
        <input id="section-image-url" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="https://example.com/photo.jpg" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="section-button-label" className="block text-sm font-medium">Button text</label>
          <input id="section-button-label" type="text" value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="section-button-url" className="block text-sm font-medium">Button link</label>
          <input id="section-button-url" type="text" value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="/order  or  https://..." />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
          Visible in draft
        </label>
        <div>
          <label htmlFor="section-sort" className="block text-sm font-medium">Sort order</label>
          <input id="section-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button onClick={onDone} className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300">
          Cancel
        </button>
      </div>
    </div>
  );
}
