"use client";

import type { CafePageSection } from "@/lib/generated/prisma/client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center justify-between rounded border p-4 shadow-sm ${isDragging ? "bg-stone-50 border-amber-300 ring-2 ring-amber-500/20" : "bg-white"}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="mr-3 cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-600 p-1"
      >
        <GripVertical className="h-5 w-5" />
      </div>
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
