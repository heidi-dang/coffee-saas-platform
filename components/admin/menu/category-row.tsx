import type { Category } from "@/lib/api/admin-menu-client";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CategoryRowProps {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

export function CategoryRow({
  category,
  isExpanded,
  onToggle,
  onToggleActive,
  onDelete,
}: CategoryRowProps) {
  return (
    <div className="flex items-center justify-between border rounded-lg p-3">
      <div className="flex items-center gap-2">
        <button onClick={onToggle}>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <span
          className={
            category.isActive ? "" : "text-muted-foreground line-through"
          }
        >
          {category.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleActive}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {category.isActive ? "Hide" : "Show"}
        </button>
        <button
          onClick={onDelete}
          className="text-xs text-destructive hover:text-destructive/80"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
