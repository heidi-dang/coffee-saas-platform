import type { MenuItem } from "@/lib/api/admin-menu-client";
import { Pencil, Trash2 } from "lucide-react";

interface MenuItemRowProps {
  item: MenuItem;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export function MenuItemRow({ item, onEdit, onToggle, onDelete }: MenuItemRowProps) {
  return (
    <div
      className={`border rounded-lg p-3 ${
        !item.isAvailable ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">
            {item.name}
            {!item.isAvailable && (
              <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Unavailable
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {item.category?.name} — $
            {(item.priceCents / 100).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {item.isAvailable ? "Disable" : "Enable"}
          </button>
          <button
            onClick={onEdit}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-destructive hover:text-destructive/80"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {item.options.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-muted-foreground cursor-pointer">
            Options ({item.options.length})
          </summary>
          <div className="mt-2 space-y-1">
            {item.options.map((opt) => (
              <div
                key={opt.id}
                className="text-xs text-muted-foreground border-l-2 pl-2"
              >
                <p className="font-medium">
                  {opt.name} ({opt.type})
                  {opt.required && " *"}
                </p>
                <p>{opt.values.map((v) => v.name).join(", ")}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
