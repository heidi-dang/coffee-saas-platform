"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MenuItemCardProps {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  isAvailable: boolean;
  onCustomise: () => void;
}

export function MenuItemCard({
  name,
  description,
  priceCents,
  isAvailable,
  onCustomise,
}: MenuItemCardProps) {
  return (
    <div
      className={`group rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 flex items-start justify-between gap-4 transition-all shadow-sm hover:shadow-md hover:border-stone-300 ${
        !isAvailable ? "opacity-60 bg-stone-50/50" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-stone-900 text-base sm:text-lg tracking-tight group-hover:text-stone-950 transition-colors">
            {name}
          </h3>
          {!isAvailable && (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded">
              Unavailable
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
        <p className="font-black text-stone-900 mt-3 text-base">
          ${(priceCents / 100).toFixed(2)}
        </p>
      </div>

      <Button
        size="sm"
        onClick={onCustomise}
        disabled={!isAvailable}
        className="shrink-0 rounded-xl bg-stone-900 text-white hover:bg-stone-850 active:scale-95 transition-all px-3 py-1.5 h-auto text-xs font-bold flex items-center gap-1 shadow-sm disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </Button>
    </div>
  );
}
