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
  return null;
}
