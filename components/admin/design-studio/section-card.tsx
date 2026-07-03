"use client";

import type { CafePageSection } from "@/lib/generated/prisma/client";

interface SectionCardProps {
  section: CafePageSection;
  onEdit: (s: CafePageSection) => void;
  onDelete: (id: string) => void;
  isPublished: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  HERO: "Hero — Main top banner",
  ABOUT: "About — Café story",
  FEATURED_MENU: "Featured Menu — Popular items",
  GALLERY: "Gallery — Photos",
  ANNOUNCEMENT: "Announcement — Promo or notice",
  CONTACT: "Contact — Address and hours",
  CUSTOM_TEXT: "Custom Text — Extra content",
};

export function SectionCard({ section, onEdit, onDelete, isPublished }: SectionCardProps) {
  const label = TYPE_LABELS[section.type] || section.type;

  return (
    <div className="flex items-center justify-between rounded border bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-sm font-medium">{label}</span>
          {section.draftTitle && (
            <span className="text-xs text-gray-500 truncate">— {section.draftTitle}</span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {section.draftIsVisible ? (
            <span className="text-xs text-gray-500">Visible in draft</span>
          ) : (
            <span className="text-xs text-amber-600">Hidden in draft</span>
          )}
          {isPublished ? (
            <span className="text-xs text-green-600 font-medium">
              Published — public version stays unchanged until you publish again.
            </span>
          ) : (
            <span className="text-xs text-blue-600">
              Draft only — not visible to customers yet.
            </span>
          )}
        </div>
      </div>
      <div className="ml-4 flex shrink-0 gap-2">
        <button
          onClick={() => onEdit(section)}
          className="rounded bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(section.id)}
          className="rounded bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          Hide
        </button>
      </div>
    </div>
  );
}
