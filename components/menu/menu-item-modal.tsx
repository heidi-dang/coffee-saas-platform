"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, X } from "lucide-react";

interface OptionValue {
  id: string;
  name: string;
  priceCents: number;
  sortOrder: number;
}

interface MenuOption {
  id: string;
  name: string;
  type: "SINGLE" | "MULTIPLE";
  required: boolean;
  minSelect: number;
  maxSelect: number;
  values: OptionValue[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  options: MenuOption[];
}

interface MenuItemModalProps {
  item: MenuItem;
  onClose: () => void;
  onAdd: (params: {
    menuItemId: string;
    name: string;
    unitPriceCents: number;
    quantity: number;
    selectedOptions: {
      optionId: string;
      optionName: string;
      valueId: string;
      valueName: string;
      priceCents: number;
    }[];
    notes: string;
  }) => void;
}

export function MenuItemModal({ item, onClose, onAdd }: MenuItemModalProps) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const optionsPrice = useMemo(() => {
    let total = 0;
    for (const option of item.options) {
      const vals = selected[option.id] || [];
      for (const v of vals) {
        const value = option.values.find((ov) => ov.id === v);
        if (value) total += value.priceCents;
      }
    }
    return total;
  }, [selected, item.options]);

  const unitPriceCents = item.priceCents + optionsPrice;

  function toggleValue(optionId: string, valueId: string, type: string) {
    setSelected((prev) => {
      const current = prev[optionId] || [];
      if (type === "SINGLE") {
        return { ...prev, [optionId]: [valueId] };
      }
      if (current.includes(valueId)) {
        return {
          ...prev,
          [optionId]: current.filter((v) => v !== valueId),
        };
      }
      return { ...prev, [optionId]: [...current, valueId] };
    });
    setError(null);
  }

  function handleAdd() {
    for (const option of item.options) {
      if (option.required) {
        const vals = selected[option.id] || [];
        if (vals.length < option.minSelect) {
          setError(`Please select ${option.name}`);
          return;
        }
      }
    }

    const selectedOptions: {
      optionId: string;
      optionName: string;
      valueId: string;
      valueName: string;
      priceCents: number;
    }[] = [];

    for (const option of item.options) {
      const vals = selected[option.id] || [];
      for (const v of vals) {
        const value = option.values.find((ov) => ov.id === v);
        if (value) {
          selectedOptions.push({
            optionId: option.id,
            optionName: option.name,
            valueId: value.id,
            valueName: value.name,
            priceCents: value.priceCents,
          });
        }
      }
    }

    onAdd({
      menuItemId: item.id,
      name: item.name,
      unitPriceCents,
      quantity,
      selectedOptions,
      notes,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background w-full max-w-lg rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{item.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {item.description && (
            <p className="text-muted-foreground text-sm">{item.description}</p>
          )}

          {item.options.map((option) => (
            <div key={option.id}>
              <p className="font-medium text-sm mb-2">
                {option.name}
                {option.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </p>
              <div className="space-y-2">
                {option.values.map((value) => {
                  const isSelected = (selected[option.id] || []).includes(
                    value.id
                  );
                  return (
                    <button
                      key={value.id}
                      type="button"
                      onClick={() =>
                        toggleValue(option.id, value.id, option.type)
                      }
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? "border-foreground bg-accent"
                          : "border-input hover:border-foreground/50"
                      }`}
                    >
                      <span className="text-sm">{value.name}</span>
                      {value.priceCents > 0 && (
                        <span className="text-sm text-muted-foreground">
                          +${(value.priceCents / 100).toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <p className="font-medium text-sm mb-2">Special Notes</p>
            <Textarea
              placeholder="Any special requests..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <p className="font-medium text-sm mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <div className="sticky bottom-0 bg-background border-t p-4">
          <Button className="w-full" size="lg" onClick={handleAdd}>
            Add to Cart — ${((unitPriceCents * quantity) / 100).toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
