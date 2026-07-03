"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, X, AlertCircle } from "lucide-react";

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

  // Check if required options are missing selection
  const missingRequiredOptions = useMemo(() => {
    const missing: string[] = [];
    for (const option of item.options) {
      if (option.required) {
        const vals = selected[option.id] || [];
        if (vals.length < option.minSelect) {
          missing.push(option.name);
        }
      }
    }
    return missing;
  }, [selected, item.options]);

  function toggleValue(optionId: string, valueId: string, type: "SINGLE" | "MULTIPLE") {
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
    if (missingRequiredOptions.length > 0) {
      setError(`Please choose the required options: ${missingRequiredOptions.join(", ")} before adding to cart.`);
      return;
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">{item.name}</h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Base price: ${(item.priceCents / 100).toFixed(2)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors active:scale-95"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 max-h-[60vh] scrollbar-thin">
          {item.description && (
            <p className="text-stone-500 text-sm leading-relaxed">{item.description}</p>
          )}

          {item.options.map((option) => {
            const isSingle = option.type === "SINGLE";
            const helperText = isSingle
              ? "Choose one"
              : `Choose up to ${option.maxSelect || "multiple"}`;

            return (
              <div key={option.id} className="space-y-3 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-sm tracking-tight flex items-center gap-1.5">
                    {option.name}
                    {option.required && (
                      <span className="text-red-600 font-extrabold text-xs bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                        Required
                      </span>
                    )}
                  </h3>
                  <span className="text-[11px] text-stone-400 font-medium italic">
                    {helperText}
                  </span>
                </div>

                <div className="grid gap-2">
                  {option.values.map((value) => {
                    const isSelected = (selected[option.id] || []).includes(value.id);
                    return (
                      <button
                        key={value.id}
                        type="button"
                        onClick={() => toggleValue(option.id, value.id, option.type)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-amber-700 bg-amber-50/40 text-amber-900 font-semibold"
                            : "border-stone-200 hover:border-stone-300 text-stone-700"
                        }`}
                      >
                        <span className="text-sm">{value.name}</span>
                        <span className="text-xs font-bold text-stone-500">
                          {value.priceCents > 0
                            ? `+$${(value.priceCents / 100).toFixed(2)}`
                            : "Free"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Notes Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-stone-900 text-sm tracking-tight">Special Instructions</h3>
            <Textarea
              placeholder="E.g. No sugar, extra hot, oat milk please..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl border border-stone-250 bg-stone-50/50 p-3 text-sm focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all placeholder-stone-400"
              rows={2}
            />
          </div>

          {/* Quantity Section */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <h3 className="font-bold text-stone-900 text-sm tracking-tight">Quantity</h3>
            <div className="flex items-center gap-4 bg-stone-50 p-1.5 rounded-xl border border-stone-200/50">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 active:scale-90 transition-all"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-bold text-stone-950 text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 active:scale-90 transition-all"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-500 leading-normal">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Action */}
        <div className="sticky bottom-0 bg-white border-t border-stone-100 p-6 flex flex-col gap-3">
          <Button
            className="w-full rounded-2xl bg-amber-800 hover:bg-amber-950 text-white font-bold py-6 text-base active:scale-[0.98] transition-all shadow-lg shadow-amber-900/10 disabled:opacity-40 disabled:hover:bg-amber-800"
            size="lg"
            onClick={handleAdd}
            disabled={missingRequiredOptions.length > 0}
          >
            Add to Cart — ${((unitPriceCents * quantity) / 100).toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
