"use client";

import type { CafePageSection } from "@/lib/generated/prisma/client";

interface SectionCardProps {
  section: CafePageSection;
  onEdit: (s: CafePageSection) => void;
  onDelete: (id: string) => void;
}

export function SectionCard({ section, onEdit, onDelete }: SectionCardProps) {
  return (
    <div className="flex items-center justify-between rounded border bg-white p-4 shadow-sm">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {section.type}
          </span>
          {section.draftTitle && <span className="font-medium">{section.draftTitle}</span>}
          <span className="text-xs text-gray-500">#{section.sortOrder}</span>
          {!section.isVisible && (
            <span className="text-xs text-gray-400">(hidden)</span>
          )}
          {section.isPublished && (
            <span className="text-xs text-green-600 font-medium">published</span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(section)}
          className="rounded bg-blue-50 px-3 py-1 text-xs text-blue-600 hover:bg-blue-100"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(section.id)}
          className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100"
        >
          Hide
        </button>
      </div>
    </div>
  );
}
