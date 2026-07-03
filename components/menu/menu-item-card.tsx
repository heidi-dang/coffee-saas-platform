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
    <div className="border rounded-lg p-4 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium">
          {name}
          {!isAvailable && (
            <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Unavailable
            </span>
          )}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
        <p className="font-semibold mt-2">
          ${(priceCents / 100).toFixed(2)}
        </p>
      </div>
      <Button
        size="sm"
        onClick={onCustomise}
        disabled={!isAvailable}
        className="shrink-0"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </div>
  );
}
