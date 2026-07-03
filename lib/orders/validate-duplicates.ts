export function findDuplicateOptionSelections(
  selectedOptions: { optionId: string; valueId: string }[]
): string | null {
  const seen = new Set<string>();
  for (const sel of selectedOptions) {
    const key = `${sel.optionId}:${sel.valueId}`;
    if (seen.has(key)) {
      return `Duplicate option selection: ${sel.optionId}/${sel.valueId}`;
    }
    seen.add(key);
  }

  const optionCounts = new Map<string, number>();
  for (const sel of selectedOptions) {
    optionCounts.set(sel.optionId, (optionCounts.get(sel.optionId) || 0) + 1);
  }
  for (const [optId, count] of optionCounts) {
    if (count > 1) {
      return `Multiple selections for option ${optId} not allowed unless MULTIPLE type allows it`;
    }
  }

  return null;
}
