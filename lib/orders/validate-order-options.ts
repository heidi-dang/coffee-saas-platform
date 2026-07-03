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

export interface DependencyRule {
  triggerOptionId: string;
  triggerValueId: string;
  action: "DISABLE" | "REQUIRE";
  targetOptionId: string;
  targetValueId?: string;
}

export function validateDependencyRules(
  selectedOptions: OptionInput[],
  rulesJson: any
): string | null {
  if (!rulesJson) return null;
  let rules: DependencyRule[] = [];
  try {
    rules = typeof rulesJson === "string" ? JSON.parse(rulesJson) : rulesJson;
  } catch {
    return null;
  }

  if (!Array.isArray(rules)) return null;

  for (const rule of rules) {
    const isTriggered = selectedOptions.some(
      (o) => o.optionId === rule.triggerOptionId && o.valueId === rule.triggerValueId
    );

    if (isTriggered) {
      const hasTarget = selectedOptions.some((o) => {
        if (o.optionId !== rule.targetOptionId) return false;
        if (rule.targetValueId && o.valueId !== rule.targetValueId) return false;
        return true;
      });

      if (rule.action === "DISABLE" && hasTarget) {
        return `Invalid combination: You cannot select these options together.`;
      }
      if (rule.action === "REQUIRE" && !hasTarget) {
        return `Required selection: Selecting this option also requires selecting the associated option.`;
      }
    }
  }

  return null;
}
