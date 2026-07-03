export interface OptionValue {
  id: string;
  name: string;
  priceCents: number;
  sortOrder: number;
}

interface OptionDef {
  id: string;
  name: string;
  type: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  values: OptionValue[];
}

export interface OptionInput {
  optionId: string;
  valueId: string;
}

export function validateItemOptions(
  options: OptionDef[],
  selectedOptions: OptionInput[]
): string | null {
  for (const optDef of options) {
    const count = selectedOptions.filter((o) => o.optionId === optDef.id).length;

    if (optDef.required && count < (optDef.minSelect || 1)) {
      if (optDef.minSelect > 0 && count < optDef.minSelect) {
        return `${optDef.name} requires at least ${optDef.minSelect} selection(s)`;
      }
      return `${optDef.name} is required`;
    }

    if (optDef.type === "SINGLE" && count > 1) {
      return `${optDef.name} allows at most 1 selection`;
    }

    if (optDef.maxSelect > 0 && count > optDef.maxSelect) {
      return `${optDef.name} allows at most ${optDef.maxSelect} selection(s)`;
    }
  }
  return null;
}
